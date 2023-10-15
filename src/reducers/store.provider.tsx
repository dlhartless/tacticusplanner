﻿import React, { createContext, useEffect, useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { isEqual } from 'lodash';
import { enqueueSnackbar } from 'notistack';

import { IDispatchContext, IGlobalState } from '../models/interfaces';
import { charactersReducer } from './characters.reducer';
import { viewPreferencesReducer } from './view-settings.reducer';
import { autoTeamsPreferencesReducer } from './auto-teams-settings.reducer';
import { convertData, PersonalDataLocalStorage } from '../services';
import { selectedTeamsOrderReducer } from './selected-teams-order.reducer';
import { leSelectedRequirementsReducer } from './le-selected-requirements.reducer';
import { leSelectedTeamsReducer } from './le-selected-teams.reducer';
import { leProgressReducer } from './le-progress.reducer';
import { goalsReducer } from './goals.reducer';
import { useAuth } from '../contexts/auth';
import { IErrorResponse } from '../api/api-interfaces';
import { getUserDataApi, setUserDataApi } from '../api/api-functions';
import { GlobalState } from '../models/global-state';

export const StoreContext = createContext<IGlobalState>({} as any);
export const DispatchContext = createContext<IDispatchContext>({} as any);

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
    const { isAuthenticated, setUsername, logout } = useAuth();
    const localStore = useMemo(() => new PersonalDataLocalStorage(), []);

    const [globalState, setGlobalState] = useState(() => {
        const data = localStore.getData();
        return new GlobalState(data);
    });

    const [modified, setModified] = useState(false);
    const [saveTimeoutId, setSaveTimeoutId] = useState<NodeJS.Timeout>();

    const [modifiedDate, setModifiedDate] = useState(globalState.modifiedDate);

    const [characters, dispatchCharacters] = React.useReducer(charactersReducer, globalState.characters);
    const [goals, dispatchGoals] = React.useReducer(goalsReducer, globalState.goals);
    const [viewPreferences, dispatchViewPreferences] = React.useReducer(
        viewPreferencesReducer,
        globalState.viewPreferences
    );
    const [autoTeamsPreferences, dispatchAutoTeamsPreferences] = React.useReducer(
        autoTeamsPreferencesReducer,
        globalState.autoTeamsPreferences
    );
    const [selectedTeamOrder, dispatchSelectedTeamsOrder] = React.useReducer(
        selectedTeamsOrderReducer,
        globalState.selectedTeamOrder
    );
    const [leSelectedRequirements, dispatchLeSelectedRequirements] = React.useReducer(
        leSelectedRequirementsReducer,
        globalState.leSelectedRequirements
    );
    const [leSelectedTeams, dispatchLeSelectedTeams] = React.useReducer(
        leSelectedTeamsReducer,
        globalState.leSelectedTeams
    );
    const [leProgress, dispatchLeProgress] = React.useReducer(leProgressReducer, globalState.leProgress);

    function wrapDispatch<T>(dispatch: React.Dispatch<T>): React.Dispatch<T> {
        return (action: T) => {
            requestAnimationFrame(() => {
                setModified(true);
                dispatch(action);
                setModifiedDate(new Date());
            });
        };
    }

    const dispatch = useMemo<IDispatchContext>(
        () => ({
            characters: wrapDispatch(dispatchCharacters),
            goals: wrapDispatch(dispatchGoals),
            viewPreferences: wrapDispatch(dispatchViewPreferences),
            autoTeamsPreferences: wrapDispatch(dispatchAutoTeamsPreferences),
            selectedTeamOrder: wrapDispatch(dispatchSelectedTeamsOrder),
            leSelectedRequirements: wrapDispatch(dispatchLeSelectedRequirements),
            leSelectedTeams: wrapDispatch(dispatchLeSelectedTeams),
            leProgress: wrapDispatch(dispatchLeProgress),
            setStore: (data: IGlobalState, modified: boolean) => {
                dispatchCharacters({ type: 'Set', value: data.characters });
                dispatchGoals({ type: 'Set', value: data.goals });
                dispatchViewPreferences({ type: 'Set', value: data.viewPreferences });
                dispatchAutoTeamsPreferences({ type: 'Set', value: data.autoTeamsPreferences });
                dispatchSelectedTeamsOrder({ type: 'Set', value: data.selectedTeamOrder });
                dispatchLeSelectedRequirements({ type: 'Set', value: data.leSelectedRequirements });
                dispatchLeSelectedTeams({ type: 'Set', value: data.leSelectedTeams });
                dispatchLeProgress({ type: 'Set', value: data.leProgress });
                if (modified) {
                    setModified(true);
                    setModifiedDate(data.modifiedDate);
                }
            },
        }),
        [
            dispatchCharacters,
            dispatchViewPreferences,
            dispatchAutoTeamsPreferences,
            dispatchSelectedTeamsOrder,
            dispatchLeSelectedRequirements,
            dispatchLeSelectedTeams,
            dispatchGoals,
            dispatchLeProgress,
            setGlobalState,
        ]
    );

    useEffect(() => {
        if (!modified) {
            return;
        }

        const newValue: IGlobalState = {
            characters,
            viewPreferences,
            autoTeamsPreferences,
            selectedTeamOrder,
            leSelectedRequirements,
            leSelectedTeams,
            leProgress,
            goals,
            modifiedDate,
        };
        const storeValue = GlobalState.toStore(newValue);

        setGlobalState(newValue);
        localStore.setData(storeValue);
        setModified(false);

        if (isAuthenticated) {
            clearTimeout(saveTimeoutId);
            const timeoutId = setTimeout(() => {
                setUserDataApi(storeValue)
                    .then(() => {
                        enqueueSnackbar('Pushed local data to server.', { variant: 'success' });
                    })
                    .catch((err: AxiosError<IErrorResponse>) => {
                        if (err.response?.status === 401) {
                            enqueueSnackbar('Session expired. Please re-login.', { variant: 'error' });
                        } else {
                            enqueueSnackbar('Failed to push data to server. Please do manual back-up.', {
                                variant: 'error',
                            });
                        }
                    });
            }, 10000);
            setSaveTimeoutId(timeoutId);
        }
    }, [modified]);

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }
        getUserDataApi()
            .then(data2 => {
                const serverLastModified = new Date(data2.data.lastModifiedDate);
                setUsername(data2.data.username);

                if (data2.data.data && (!modifiedDate || modifiedDate < serverLastModified)) {
                    const serverData = convertData(data2.data.data);
                    const localData = GlobalState.toStore(globalState);

                    const isDataEqual = isEqual(
                        { ...localData, modifiedDate: undefined },
                        { ...serverData, modifiedDate: undefined }
                    );

                    if (!isDataEqual) {
                        dispatch.setStore(new GlobalState(serverData), false);
                        enqueueSnackbar('Synced with latest server data.', { variant: 'info' });
                    }

                    setModifiedDate(serverLastModified);
                    localStore.setData({ modifiedDate: serverLastModified });
                } else if (modifiedDate && modifiedDate > serverLastModified) {
                    setUserDataApi(GlobalState.toStore(globalState))
                        .then(() => enqueueSnackbar('Pushed local data to server.', { variant: 'info' }))
                        .catch((err: AxiosError<IErrorResponse>) => {
                            if (err.response?.status === 401) {
                                logout();
                                enqueueSnackbar('Session expired. Please re-login.', { variant: 'error' });
                            } else {
                                enqueueSnackbar('Failed to push data to server. Please do manual back-up.', {
                                    variant: 'error',
                                });
                            }
                        });
                }
            })
            .catch((err: AxiosError<IErrorResponse>) => {
                if (err.response?.status === 401) {
                    logout();
                    enqueueSnackbar('Session expired. Please re-login.', { variant: 'error' });
                } else {
                    enqueueSnackbar('Failed to fetch data from server. Try again later', { variant: 'error' });
                }
            });
    }, [isAuthenticated]);

    return (
        <DispatchContext.Provider value={dispatch}>
            <StoreContext.Provider value={globalState}> {children} </StoreContext.Provider>
        </DispatchContext.Provider>
    );
};
