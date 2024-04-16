﻿import React from 'react';
import { DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { isMobile } from 'react-device-detect';
import { IGuildWarPlayer } from 'src/v2/features/guild/guild.models';
import { PlayersTable } from 'src/v2/features/guild/players-table';

interface Props {
    guildWarPlayers: IGuildWarPlayer[];
}

export const ViewPlayers: React.FC<Props> = ({ guildWarPlayers }) => {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Button onClick={handleClickOpen}>View players</Button>
            <Dialog open={open} onClose={handleClose} maxWidth={isMobile ? 'xl' : 'lg'} fullWidth>
                <DialogTitle>Guild players</DialogTitle>
                <DialogContent>
                    <PlayersTable rows={guildWarPlayers} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>OK</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
