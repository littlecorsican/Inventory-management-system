import React from 'react';
import {
    AppBar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    IconButton,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Form dialog: full-screen with a sticky save bar on phones, regular dialog on larger screens
const Modal = ({ open, onClose, title, children, onSubmit, submitting = false, submitLabel = 'Save', extraActions = null }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
                {fullScreen ? (
                    <AppBar position="sticky" elevation={0} color="default" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Toolbar>
                            <IconButton edge="start" onClick={onClose} disabled={submitting} aria-label="close">
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" sx={{ ml: 1, flex: 1 }} noWrap>{title}</Typography>
                        </Toolbar>
                    </AppBar>
                ) : (
                    <DialogTitle>{title}</DialogTitle>
                )}
                <DialogContent sx={{ pt: fullScreen ? 2 : undefined }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        {children}
                    </Box>
                </DialogContent>
                <DialogActions
                    sx={{
                        px: 3,
                        pb: fullScreen ? 'calc(16px + env(safe-area-inset-bottom))' : 2,
                        borderTop: fullScreen ? 1 : 0,
                        borderColor: 'divider',
                        flexWrap: 'wrap',
                        gap: 1,
                        '& > :not(style) ~ :not(style)': { ml: 0 },
                    }}
                >
                    {!fullScreen && <Button onClick={onClose} disabled={submitting}>Cancel</Button>}
                    {extraActions}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                        sx={{ flex: fullScreen ? 1 : 'none' }}
                        size={fullScreen ? 'large' : 'medium'}
                    >
                        {submitting ? 'Saving…' : submitLabel}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default Modal;
