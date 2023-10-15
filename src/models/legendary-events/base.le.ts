﻿import {
    ICharacter2,
    IChestMilestone,
    ILegendaryEvent,
    ILegendaryEventStatic,
    ILegendaryEventTrack,
    IPointsMilestone,
    ITableRow,
} from '../interfaces';
import { sortBy, sum, uniqBy } from 'lodash';
import { LegendaryEventEnum } from '../enums';

export abstract class LegendaryEventBase implements ILegendaryEvent {
    alpha: ILegendaryEventTrack;
    beta: ILegendaryEventTrack;
    gamma: ILegendaryEventTrack;

    suggestedTeams: ITableRow[] = [];

    readonly id: LegendaryEventEnum;
    readonly name: string;
    readonly wikiLink: string;
    readonly eventStage: number;
    readonly nextEventDate: string;

    readonly regularMissions: string[];
    readonly premiumMissions: string[];

    readonly pointsMilestones: IPointsMilestone[];
    readonly chestsMilestones: IChestMilestone[];

    protected abstract getAlphaTrack(unitsData: Array<ICharacter2>): ILegendaryEventTrack;

    protected abstract getBetaTrack(unitsData: Array<ICharacter2>): ILegendaryEventTrack;

    protected abstract getGammaTrack(unitsData: Array<ICharacter2>): ILegendaryEventTrack;

    protected constructor(unitsData: Array<ICharacter2>, staticData: ILegendaryEventStatic) {
        this.id = staticData.id;
        this.name = staticData.name;
        this.wikiLink = staticData.wikiLink;

        this.regularMissions = staticData.regularMissions ?? [];
        this.premiumMissions = staticData.premiumMissions ?? [];
        this.eventStage = staticData.eventStage;
        this.nextEventDate = staticData.nextEventDate;

        this.pointsMilestones = staticData.pointsMilestones;
        this.chestsMilestones = staticData.chestsMilestones;

        this.alpha = this.getAlphaTrack(unitsData);
        this.beta = this.getBetaTrack(unitsData);
        this.gamma = this.getGammaTrack(unitsData);

        this.populateLEPoints(this.allowedUnits);
    }

    get allowedUnits(): Array<ICharacter2> {
        return sortBy(
            uniqBy([...this.alpha.allowedUnits, ...this.beta.allowedUnits, ...this.gamma.allowedUnits], 'name'),
            'name'
        );
    }

    protected populateLEPoints(characters: ICharacter2[]): void {
        characters.forEach(character => {
            const alphaPoints = this.alpha.getCharacterPoints(character);
            const betaPoints = this.beta.getCharacterPoints(character);
            const gammaPoints = this.gamma.getCharacterPoints(character);

            const alphaSlots = this.alpha.getCharacterSlots(character);
            const betaSlots = this.beta.getCharacterSlots(character);
            const gammaSlots = this.gamma.getCharacterSlots(character);

            character.legendaryEvents[this.id] = {
                alphaPoints,
                alphaSlots,
                betaPoints,
                betaSlots,
                gammaPoints,
                gammaSlots,
                totalPoints: sum([alphaPoints, betaPoints, gammaPoints]),
                totalSlots: sum([alphaSlots, betaSlots, gammaSlots]),
            };
        });
    }
}
