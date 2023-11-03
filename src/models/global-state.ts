﻿import {
    IAutoTeamsPreferences,
    ICampaignsProgress,
    ICharacter2,
    IDailyRaidsPreferences,
    IGlobalState,
    ILegendaryEventProgressState,
    ILegendaryEventSelectedRequirements,
    ILegendaryEventSelectedTeams,
    IPersonalCharacterData2,
    IPersonalData2,
    IPersonalGoal,
    ISelectedTeamsOrdering,
    IViewPreferences,
    LegendaryEventData,
} from './interfaces';
import { StaticDataService } from '../services';
import { CharacterBias, LegendaryEventEnum, Rank } from './enums';

export class GlobalState implements IGlobalState {
    readonly modifiedDate?: Date;
    readonly seenAppVersion?: string | null;

    readonly autoTeamsPreferences: IAutoTeamsPreferences;
    readonly characters: Array<ICharacter2>;
    readonly viewPreferences: IViewPreferences;
    readonly dailyRaidsPreferences: IDailyRaidsPreferences;
    readonly selectedTeamOrder: ISelectedTeamsOrdering;
    readonly leSelectedRequirements: LegendaryEventData<ILegendaryEventSelectedRequirements>;
    readonly goals: IPersonalGoal[];
    readonly leProgress: LegendaryEventData<ILegendaryEventProgressState>;
    readonly leSelectedTeams: LegendaryEventData<ILegendaryEventSelectedTeams>;
    readonly campaignsProgress: ICampaignsProgress;

    constructor(personalData: IPersonalData2) {
        this.viewPreferences = personalData.viewPreferences;
        this.autoTeamsPreferences = personalData.autoTeamsPreferences;
        this.dailyRaidsPreferences = personalData.dailyRaidsPreferences;

        this.selectedTeamOrder = personalData.selectedTeamOrder;
        this.leSelectedRequirements = personalData.leSelectedRequirements;
        this.leSelectedTeams = GlobalState.fixNames(personalData.leTeams);
        this.leProgress = personalData.leProgress;
        for (const leProgressKey in this.leProgress) {
            const leProgress = this.leProgress[+leProgressKey as LegendaryEventEnum];
            if (leProgress) {
                leProgress.notes = '';
            }
        }
        this.goals = GlobalState.fixNames(personalData.goals).map((goal, index) => ({ ...goal, priority: index + 1 }));

        this.modifiedDate = personalData.modifiedDate;
        this.seenAppVersion = personalData.seenAppVersion;
        this.campaignsProgress = personalData.campaignsProgress;

        const chars = GlobalState.fixNames(personalData.characters);

        this.characters = StaticDataService.unitsData.map(staticData => {
            const personalCharData = chars.find(c => c.name === staticData.name);
            const combinedData: IPersonalCharacterData2 = {
                name: staticData.name,
                rank: personalCharData?.rank ?? Rank.Locked,
                rarity: personalCharData?.rarity ?? staticData.initialRarity,
                bias: personalCharData?.bias ?? CharacterBias.None,
                upgrades: personalCharData?.upgrades ?? [],
            };
            return {
                ...staticData,
                ...combinedData,
                rank: +combinedData.rank,
            };
        });
    }

    static fixNames<T>(obj: T): T {
        const fixName = {
            'Aleph-null': 'Aleph-Null',
            "Aun'shi": "Aun'Shi",
        };

        let result = JSON.stringify(obj);

        for (const fixNameKey in fixName) {
            const value = fixName[fixNameKey as keyof typeof fixName];
            result = result.replaceAll(fixNameKey, value);
        }

        return JSON.parse(result);
    }

    static toStore(value: IGlobalState): IPersonalData2 {
        const charactersToStore: IPersonalCharacterData2[] = value.characters
            .filter(
                x =>
                    x.bias !== CharacterBias.None ||
                    x.rank !== Rank.Locked ||
                    x.rarity !== x.initialRarity ||
                    x.upgrades?.length
            )
            .map(x => ({ name: x.name, rank: x.rank, rarity: x.rarity, bias: x.bias, upgrades: x.upgrades }));

        return {
            schemaVersion: 2,
            modifiedDate: value.modifiedDate,
            seenAppVersion: value.seenAppVersion,
            goals: value.goals,
            selectedTeamOrder: value.selectedTeamOrder,
            leTeams: value.leSelectedTeams,
            leProgress: value.leProgress,
            leSelectedRequirements: value.leSelectedRequirements,
            characters: charactersToStore,
            autoTeamsPreferences: value.autoTeamsPreferences,
            viewPreferences: value.viewPreferences,
            dailyRaidsPreferences: value.dailyRaidsPreferences,
            campaignsProgress: value.campaignsProgress,
        };
    }
}
