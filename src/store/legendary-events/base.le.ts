﻿import {
    ICharacter,
    ILegendaryEvent,
    ILegendaryEventTrack,
    ITableRow,
    LegendaryEventSection
} from '../static-data/interfaces';
import { cloneDeep, sortBy, sum, uniqBy } from 'lodash';
import { LegendaryEvents, Rank } from '../personal-data/personal-data.interfaces';

export abstract class LegendaryEventBase implements ILegendaryEvent {
    alphaTrack: ILegendaryEventTrack;
    betaTrack: ILegendaryEventTrack;
    gammaTrack: ILegendaryEventTrack;

    selectedTeams: ITableRow[];

    characterSelectedRestrictions: Record<string, string[]> = {};

    readonly id: LegendaryEvents;

    protected abstract getAlphaTrack(unitsData: Array<ICharacter>): ILegendaryEventTrack;

    protected abstract getBetaTrack(unitsData: Array<ICharacter>): ILegendaryEventTrack;

    protected abstract getGammaTrack(unitsData: Array<ICharacter>): ILegendaryEventTrack;

    protected constructor(id: LegendaryEvents, unitsData: Array<ICharacter>, selectedTeams: ITableRow[]) {
        this.id = id;
        this.selectedTeams = selectedTeams;

        this.alphaTrack = this.getAlphaTrack(unitsData);
        this.betaTrack = this.getBetaTrack(unitsData);
        this.gammaTrack = this.getGammaTrack(unitsData);

        this.populateLEPoints(this.allowedUnits);

        this.allowedUnits.forEach(char => {
            const selected: string[] = [];
            this.selectedTeams.forEach(row => {
                for (const rowKey in row) {
                    const value = row[rowKey];
                    if (typeof value !== 'string' && value.name === char.name) {
                        selected.push(rowKey);
                    }
                }
            });
            this.characterSelectedRestrictions[char.name] = selected;
        });
    }

    get allowedUnits(): Array<ICharacter> {
        return sortBy(uniqBy([...this.alphaTrack.allowedUnits, ...this.betaTrack.allowedUnits, ...this.gammaTrack.allowedUnits], 'name'), 'name');
    }

    public getSelectedCharactersPoints(): Array<{
        name: string,
        points: number,
        rank: Rank
    }> {
        return this.allowedUnits
            .filter(x => (x.leSelection & this.id) === this.id).map(char => ({
                name: char.name,
                points: this.getSelectedCharPoints(char.name),
                rank: char.rank
            }));
        
    }

    private getSelectedCharPoints(name: string): number {
        if (name=== 'Makhotep'){
            // eslint-disable-next-line no-debugger
            debugger;
        }
        const selectedRestrictions = this.characterSelectedRestrictions[name];
        const alphaTrack = this.getSectionPoints(selectedRestrictions, this.alphaTrack);
        const betaTrack = this.getSectionPoints(selectedRestrictions, this.betaTrack);
        const gammaTrack = this.getSectionPoints(selectedRestrictions, this.gammaTrack);

        return alphaTrack + betaTrack + gammaTrack;
    }

    private getSectionPoints(selectedRestrictions: string[], track: ILegendaryEventTrack): number {
        if (!selectedRestrictions.filter(x => x.includes(track.section)).length) {
            return 0;
        }

        return sum(selectedRestrictions
            .filter(x => x.includes(track.section))
            .map(x => x.replace(track.section, ''))
            .map(x => track.getRestrictionPoints(x))) + track.killPoints;
    }

    protected populateLEPoints(characters: ICharacter[]): void {
        characters.forEach(character => {
            const alphaPoints = this.alphaTrack.getCharacterPoints(character);

            const betaPoints = this.betaTrack.getCharacterPoints(character);

            const gammaPoints = this.gammaTrack.getCharacterPoints(character);

            character.legendaryEventPoints[this.id] = sum([alphaPoints, betaPoints, gammaPoints]);
        });
    }
}