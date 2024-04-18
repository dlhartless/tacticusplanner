﻿import { IGuildMember, IPersonalCharacterData2 } from 'src/models/interfaces';
import { Difficulty, Rarity } from 'src/models/enums';

export interface IGuildInsightsRequest {
    members: IGuildMember[];
}

export interface IGuildInsightsResponse {
    guildUsers: string[];
    userData: Array<IPersonalCharacterData2 & { numberOfUnlocked: number; ownedBy: string[] }>;
}

export interface IGuildRostersResponse {
    guildUsers: string[];
    userData: Record<string, IPersonalCharacterData2[]>;
}

export interface IGuildWarPlayer {
    username: string;
    unlocked: number;
    slots: Record<Rarity, number>;
    potential: Record<Difficulty, number>;
    enlistedZone: string;
}
