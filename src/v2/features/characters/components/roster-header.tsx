﻿import React, { useContext } from 'react';
import { TextField } from '@mui/material';

import { FlexBox } from 'src/v2/components/flex-box';
import { MiscIcon } from 'src/v2/components/images/misc-image';
import { numberToThousandsString } from 'src/v2/functions/number-to-thousands-string';

import { InfoBox } from './info-box';

import './roster-header.scss';
import { CharactersViewContext } from 'src/v2/features/characters/characters-view.context';
import { Conditional } from 'src/v2/components/conditional';

export const RosterHeader = ({
    children,
    totalValue,
    totalPower,
    filterChanges,
}: React.PropsWithChildren<{
    totalValue: number;
    totalPower: number;
    filterChanges: (bsValue: string) => void;
}>) => {
    const { showBsValue, showPower } = useContext(CharactersViewContext);
    return (
        <FlexBox gap={10} justifyContent={'center'} wrap>
            <InfoBox />
            <Conditional condition={showBsValue}>
                <div className="value-score-container">
                    <MiscIcon icon={'blackstone'} height={40} width={30} />
                    {numberToThousandsString(totalValue)}
                </div>
            </Conditional>
            <Conditional condition={showPower}>
                <div className="power-score-container">
                    <MiscIcon icon={'power'} height={40} width={30} />
                    {numberToThousandsString(totalPower)}
                </div>
            </Conditional>
            <TextField
                sx={{ margin: '10px', width: '220px' }}
                label="Quick Filter"
                variant="outlined"
                onChange={event => filterChanges(event.target.value)}
            />
            {children}
        </FlexBox>
    );
};
