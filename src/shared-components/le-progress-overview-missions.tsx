﻿import React, { useMemo } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Checkbox, Divider, FormControlLabel } from '@mui/material';
import { ILegendaryEvent, ILegendaryEventBattle, ILegendaryEventOverviewProgress } from '../models/interfaces';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getCompletionRateColor } from '../shared-logic/functions';
import { Tooltip } from '@mui/material';

export const LeProgressOverviewMissions = ({
    progress,
    legendaryEvent,
    missionProgressChange,
    bundleChange,
}: {
    progress: ILegendaryEventOverviewProgress;
    legendaryEvent: ILegendaryEvent;
    missionProgressChange: (section: 'regularMissions' | 'premiumMissions', value: number) => void;
    bundleChange: (value: number) => void;
}) => {
    const [accordionExpanded, setAccordionExpanded] = React.useState<string | false>(false);

    const [regularMissionsProgress, setRegularMissionsProgress] = React.useState<number>(progress.regularMissions);
    const [premiumMissionsProgress, setPremiumMissionsProgress] = React.useState<number>(progress.premiumMissions);
    const [bundle, setBundle] = React.useState<number>(progress.bundle);

    const handleAccordionChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setAccordionExpanded(isExpanded ? section : false);
    };

    return (
        <>
            {legendaryEvent.regularMissions.length ? (
                <Accordion
                    TransitionProps={{ unmountOnExit: true }}
                    expanded={accordionExpanded === 'regularMissions'}
                    onChange={handleAccordionChange('regularMissions')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span>Regular Missions</span>
                            <span style={{ fontWeight: 700 }}>
                                {regularMissionsProgress}/{10}
                            </span>
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {legendaryEvent.regularMissions.map((mission, index) => (
                                <FormControlLabel
                                    key={mission}
                                    control={
                                        <Checkbox
                                            checked={index < regularMissionsProgress}
                                            onChange={(_, checked) => {
                                                setRegularMissionsProgress(checked ? index + 1 : index);
                                                missionProgressChange('regularMissions', checked ? index + 1 : index);
                                            }}
                                            inputProps={{ 'aria-label': 'controlled' }}
                                        />
                                    }
                                    label={index + 1 + '. ' + mission}
                                />
                            ))}
                        </div>
                    </AccordionDetails>
                </Accordion>
            ) : undefined}

            {legendaryEvent.premiumMissions.length ? (
                <Accordion
                    TransitionProps={{ unmountOnExit: true }}
                    expanded={accordionExpanded === 'premiumMissions'}
                    onChange={handleAccordionChange('premiumMissions')}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span>Premium Missions & 300 Bundle</span>
                            <span style={{ fontWeight: 700 }}>
                                {premiumMissionsProgress}/{10}
                            </span>
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={bundle > 0}
                                        onChange={(_, checked) => {
                                            setBundle(checked ? 1 : 0);
                                            bundleChange(checked ? 1 : 0);
                                        }}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />
                                }
                                label={'300 Bundle'}
                            />
                            <Divider />
                            {legendaryEvent.premiumMissions.map((mission, index) => (
                                <FormControlLabel
                                    key={mission}
                                    control={
                                        <Checkbox
                                            checked={index < premiumMissionsProgress}
                                            onChange={(_, checked) => {
                                                setPremiumMissionsProgress(checked ? index + 1 : index);
                                                missionProgressChange('premiumMissions', checked ? index + 1 : index);
                                            }}
                                            inputProps={{ 'aria-label': 'controlled' }}
                                        />
                                    }
                                    label={index + 1 + '. ' + mission}
                                />
                            ))}
                        </div>
                    </AccordionDetails>
                </Accordion>
            ) : undefined}
        </>
    );
};

const RequirementDetails = ({
    reqName,
    battles,
    reqIndex,
}: {
    reqName: string;
    battles: ILegendaryEventBattle[];
    reqIndex: number;
}) => {
    const completedBattles = useMemo(() => {
        let total = 0;

        battles.forEach(battle => {
            if (battle.state[reqIndex]) {
                total++;
            }
        });

        return total;
    }, [reqIndex]);

    const scoredPoints = useMemo(() => {
        let total = 0;

        battles.forEach(battle => {
            if (battle.state[reqIndex]) {
                total += battle.requirements[reqIndex].points;
            }
        });

        return total;
    }, []);

    const totalPoints = useMemo(() => {
        return battles
            .map(x => x.requirements[reqIndex].points)
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }, []);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
                style={{
                    width: 15,
                    height: 15,
                    backgroundColor: getCompletionRateColor(completedBattles, battles.length),
                    borderRadius: 50,
                }}></div>
            <Tooltip title={`${scoredPoints}/${totalPoints} Points`}>
                <span style={{ fontWeight: 700 }}>
                    {completedBattles}/{battles.length}
                </span>
            </Tooltip>
            <span>{reqName}</span>
        </div>
    );
};
