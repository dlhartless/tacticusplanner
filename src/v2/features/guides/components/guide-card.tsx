﻿import React from 'react';
import { IGuide } from 'src/v2/features/guides/guides.models';
import { Card, CardActions, CardContent, CardHeader, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { IUnit } from 'src/v2/features/characters/characters.models';
import { TokenImage } from 'src/v2/components/images/token-image';
import { TeamView } from 'src/v2/features/guides/components/team-view';
import { GuidesStatus } from 'src/v2/features/guides/guides.enums';
import { isMobile } from 'react-device-detect';
import { RichTextViewer } from 'src/v2/components/inputs/rich-text-viewer';
import { allModes, gameModes } from 'src/v2/features/teams/teams.constants';
import { AccessibleTooltip } from 'src/v2/components/tooltip';
import Button from '@mui/material/Button';

interface Props {
    team: IGuide;
    units: IUnit[];
    fullView?: boolean;
    onView?: () => void;
    onViewOriginal: () => void;
    onHonor: (honored: boolean) => void;
    onShare: () => void;
    onEdit: () => void;
}

export const GuideCard: React.FC<Props> = ({
    team,
    units,
    fullView = false,
    onView = () => {},
    onHonor,
    onShare,
    onEdit,
    onViewOriginal,
}) => {
    const renderActions = () => {
        if (team.status !== GuidesStatus.approved) {
            return (
                <>
                    {team.permissions.canEdit && (
                        <IconButton aria-label="add to favorites" onClick={onEdit}>
                            <AccessibleTooltip title="Edit">
                                <EditIcon />
                            </AccessibleTooltip>
                        </IconButton>
                    )}
                </>
            );
        }

        return (
            <>
                {team.permissions.canHonor && (
                    <>
                        {team.isHonored ? (
                            <IconButton aria-label="add to favorites" onClick={() => onHonor(false)}>
                                <AccessibleTooltip title="Remove Honor">
                                    <FavoriteIcon />
                                </AccessibleTooltip>
                            </IconButton>
                        ) : (
                            <IconButton aria-label="add to favorites" onClick={() => onHonor(true)}>
                                <AccessibleTooltip title="Do Honor">
                                    <FavoriteBorderIcon />
                                </AccessibleTooltip>
                            </IconButton>
                        )}
                    </>
                )}

                <IconButton aria-label="share" onClick={onShare}>
                    <AccessibleTooltip title="Share">
                        <ShareIcon />
                    </AccessibleTooltip>
                </IconButton>

                {team.permissions.canEdit && (
                    <IconButton aria-label="add to favorites" onClick={onEdit}>
                        <AccessibleTooltip title="Edit">
                            <EditIcon />
                        </AccessibleTooltip>
                    </IconButton>
                )}
            </>
        );
    };

    const gameMode = gameModes.find(x => x.value === team.primaryMode)?.label ?? 'NA';
    const subMode = allModes.find(x => x.value === team.subModes[0])?.label ?? 'NA';

    return (
        <Card
            sx={{
                maxWidth: !fullView ? 420 : 'unset',
                minWidth: isMobile ? 'unset' : 420,
                overflow: 'auto',
                zoom: isMobile ? '90%' : '100%',
            }}
            variant="outlined">
            <CardHeader
                style={{ paddingBottom: 0 }}
                avatar={<TokenImage gameMode={team.primaryMode} />}
                action={
                    <>
                        {fullView ? (
                            <CardActions disableSpacing>{renderActions()}</CardActions>
                        ) : (
                            <IconButton aria-label="settings" onClick={onView}>
                                <MoreVertIcon />
                            </IconButton>
                        )}
                    </>
                }
                title={team.name}
                subheader={`By ${team.createdBy}`}
            />
            <CardContent onClick={onView}>
                {(team.status === GuidesStatus.rejected || team.status === GuidesStatus.pending) &&
                    !!team.originalTeamId && <Button onClick={onViewOriginal}>View original team</Button>}
                {team.status === GuidesStatus.rejected && (
                    <Typography variant="body2" color="error">
                        {team.rejectReason} (Rejected by {team.moderatedBy})
                    </Typography>
                )}
                <Typography variant="body2" color="text.primary">
                    {gameMode} - {subMode}
                </Typography>

                <TeamView slots={team.teamSlots} units={units} expanded={fullView} />

                <Typography variant="body2" color="text.secondary">
                    {team.intro}
                </Typography>
            </CardContent>

            {!fullView && <CardActions disableSpacing>{renderActions()}</CardActions>}
            {fullView && (
                <CardContent>
                    <RichTextViewer htmlValue={team.guide} />
                </CardContent>
            )}
        </Card>
    );
};
