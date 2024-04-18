﻿import { IGuild, IGuildMember, SetStateAction } from '../models/interfaces';
import { defaultData } from '../models/constants';

export type GuildAction =
    | SetStateAction<IGuild>
    | {
          type: 'UpdateUsername';
          index: number;
          value: string;
      }
    | {
          type: 'StopEditingGuildMembers';
      }
    | {
          type: 'UpdateShareToken';
          index: number;
          value: string;
      }
    | {
          type: 'ImportFromExcel';
          members: IGuildMember[];
      };

export const guildReducer = (state: IGuild, action: GuildAction): IGuild => {
    switch (action.type) {
        case 'Set': {
            return action.value ?? defaultData.guild;
        }

        case 'UpdateUsername': {
            const user = state.members.find(x => x.index === action.index);

            if (user) {
                user.username = action.value;
                return {
                    ...state,
                    members: [...state.members],
                };
            }

            return {
                ...state,
                members: [...state.members, { username: action.value, shareToken: '', index: action.index }],
            };
        }

        case 'UpdateShareToken': {
            const user = state.members.find(x => x.index === action.index);

            if (user) {
                user.shareToken = action.value;
                return {
                    ...state,
                    members: [...state.members],
                };
            }

            return {
                ...state,
                members: [...state.members, { shareToken: action.value, username: '', index: action.index }],
            };
        }

        case 'StopEditingGuildMembers': {
            return {
                ...state,
                members: state.members.filter(x => !!x.username || !!x.shareToken),
            };
        }
        case 'ImportFromExcel': {
            const newMembers = action.members.slice(0, 30).map((x, i) => ({ ...x, index: i }));
            return {
                ...state,
                members: newMembers,
            };
        }

        default: {
            throw new Error();
        }
    }
};
