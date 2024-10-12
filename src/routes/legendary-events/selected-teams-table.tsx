﻿import React, { useContext, useEffect, useMemo, useRef } from 'react';

import { AgGridReact } from 'ag-grid-react';
import {
    CellClassParams,
    CellClickedEvent,
    ColDef,
    ColGroupDef,
    ICellRendererParams,
    ITooltipParams,
    ValueFormatterParams,
} from 'ag-grid-community';

import {
    ICharacter2,
    ILegendaryEventTrack,
    ILegendaryEventTrackRequirement,
    ILreTeam,
    ITableRow,
} from '../../models/interfaces';
import { Rank, Rarity } from '../../models/enums';

import { fitGridOnWindowResize } from '../../shared-logic/functions';
import { CharacterTitle } from '../../shared-components/character-title';
import { StoreContext } from '../../reducers/store.provider';

interface Props {
    show: boolean;
    track: ILegendaryEventTrack;
    characters: ICharacter2[];
    // teams: Record<string, Array<ICharacter2 | string>>;
    teams: ILreTeam[];
    deselectChars: (teamName: string, ...chars: string[]) => void;
    completedRequirements: string[];
}

function convertTeamsToRecord(
    teams: ILreTeam[],
    characters: ICharacter2[]
): Record<string, Array<ICharacter2 | string>> {
    const teamRecord: Record<string, Array<ICharacter2 | string>> = {};

    teams.forEach(team => {
        // For each team, map charactersIds to either ICharacter2 or keep as string if not found
        teamRecord[team.id] = team.charactersIds.map(characterId => {
            const characterObj = characters.find(character => character.id === characterId);
            return characterObj ? characterObj : ''; // If found, return ICharacter2, else return the string
        });
    });

    return teamRecord;
}

export const SelectedTeamsTable: React.FC<Props> = ({
    show,
    completedRequirements,
    teams,
    deselectChars,
    track,
    characters,
}) => {
    const { viewPreferences } = useContext(StoreContext);
    const gridRef = useRef<AgGridReact>(null);

    const rows = useMemo(() => {
        const result: ITableRow[] = [{}, {}, {}, {}, {}];

        for (const teamKey in teams) {
            const team = teams[teamKey];
            for (let i = 0; i < team.length; i++) {
                result[i][teamKey] = team[i];
            }
        }
        return result;
    }, [teams]);

    const columnsDefs = useMemo<Array<ColDef>>(
        () => getSectionColumns(track.unitsRestrictions, viewPreferences.lightWeight, viewPreferences.hideNames),
        [track.eventId, viewPreferences.lightWeight, viewPreferences.hideNames, completedRequirements]
    );

    // const handleCellCLick = (cellClicked: CellClickedEvent<ITableRow[], ICharacter2>) => {
    //     const teamName = cellClicked.column.getColId();
    //     const value = cellClicked.value;
    //     const shiftKey = (cellClicked.event as MouseEvent).shiftKey;
    //     if (shiftKey) {
    //         const team = teams[teamName].map(x => (typeof x === 'string' ? x : x.name));
    //         deselectChars(teamName, ...team);
    //         return;
    //     }
    //
    //     if (value && typeof value === 'object') {
    //         deselectChars(teamName, value.name);
    //         return;
    //     }
    // };

    useEffect(() => {
        gridRef.current?.api?.sizeColumnsToFit();
    }, [viewPreferences.showAlpha, viewPreferences.showBeta, viewPreferences.showGamma, viewPreferences.hideCompleted]);

    function getSectionColumns(
        unitsRestrictions: ILegendaryEventTrackRequirement[],
        lightweight: boolean,
        hideNames: boolean
    ): Array<ColDef> {
        return unitsRestrictions.map(u => ({
            field: u.name,
            headerName: u.name,
            headerTooltip: u.name,
            headerClass: 'center-header-text',
            resizable: true,
            sortable: false,
            hide: completedRequirements.includes(u.name),
            valueFormatter: !lightweight
                ? undefined
                : (params: ValueFormatterParams) =>
                      typeof params.value === 'string' ? params.value : params.value?.shortName,
            cellRenderer: lightweight
                ? undefined
                : (props: ICellRendererParams<ICharacter2>) => {
                      const character = props.value;
                      if (character) {
                          return <CharacterTitle character={character} imageSize={30} hideName={hideNames} />;
                      }
                  },
            cellClass: (params: CellClassParams) =>
                typeof params.value === 'string' ? params.value : Rank[params.value?.rank]?.toLowerCase(),
            tooltipValueGetter: (params: ITooltipParams) =>
                typeof params.value === 'string' || !params.value?.name
                    ? params.value
                    : params.value?.name +
                      ' - ' +
                      Rarity[params.value?.rarity ?? 0] +
                      ' - ' +
                      Rank[params.value?.rank ?? 0],
            suppressMovable: true,
            wrapHeaderText: true,
        }));
    }

    return (
        <div
            className="ag-theme-material auto-teams"
            style={{
                display: show ? 'block' : 'none',
                height: '240px',
                width: '100%',
                border: '2px solid black',
            }}>
            <AgGridReact
                ref={gridRef}
                tooltipShowDelay={100}
                rowData={rows}
                rowHeight={35}
                columnDefs={columnsDefs}
                onGridReady={fitGridOnWindowResize(gridRef)}
                onCellClicked={handleCellCLick}></AgGridReact>
        </div>
    );
};
