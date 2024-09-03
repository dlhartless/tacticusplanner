﻿import React from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { StaticDataService } from 'src/services';
import { CharacterImage } from 'src/shared-components/character-image';
import { menuItemById } from 'src/models/menu-items';
import { LegendaryEventEnum } from 'src/models/enums';

export const PlanLeRoutes = () => {
    const navigate = useNavigate();
    const leMasterTableMenuItem = menuItemById['leMasterTable'];
    return (
        <div style={{ display: 'flex', gap: 10, flexDirection: 'column', alignItems: 'center' }}>
            <Card
                variant="outlined"
                onClick={() => navigate(leMasterTableMenuItem.routeMobile)}
                sx={{
                    width: 350,
                    minHeight: 140,
                }}>
                <CardHeader
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {leMasterTableMenuItem.icon} {leMasterTableMenuItem.label}
                        </div>
                    }
                />
            </Card>

            {StaticDataService.lreCharacters.map(le => {
                const isFinished = !!le.lre?.finished;
                return (
                    <Card
                        variant="outlined"
                        key={le.name}
                        onClick={() => navigate(`/mobile/plan/lre?character=${LegendaryEventEnum[le.lre!.id]}`)}
                        sx={{
                            width: 350,
                            minHeight: 140,
                            opacity: isFinished ? 0.5 : 1,
                        }}>
                        <CardHeader
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <CharacterImage icon={le.icon} name={le.name} /> {le.name}
                                </div>
                            }
                            subheader={'Legendary Event'}
                        />
                        <CardContent style={{ display: 'flex', flexDirection: 'column' }}>
                            {isFinished ? (
                                <span>Finished</span>
                            ) : (
                                <>
                                    <span>Stage: {le.lre?.eventStage}/3</span>
                                    <span>Next event: {le.lre?.nextEventDate}</span>
                                </>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
