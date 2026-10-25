import React from 'react';
import {
    Dialog,
    IconButton,
    Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ImagePreviewModal = ({ open, onClose, imageSrc, imageAlt = "Image preview" }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen
            PaperProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.92)',
                    boxShadow: 'none',
                }
            }}
        >
            <IconButton
                onClick={onClose}
                aria-label="close"
                sx={{
                    position: 'absolute',
                    right: 'calc(12px + env(safe-area-inset-right))',
                    top: 'calc(12px + env(safe-area-inset-top))',
                    zIndex: 1,
                    color: 'white',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    }
                }}
            >
                <CloseIcon />
            </IconButton>
            <Box
                onClick={onClose}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    p: { xs: 0, sm: 3 },
                }}
            >
                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                        }}
                    />
                )}
            </Box>
        </Dialog>
    );
};

export default ImagePreviewModal;
