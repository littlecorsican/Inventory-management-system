import React from 'react';
import {
    Dialog,
    DialogContent,
    IconButton,
    Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const ImagePreviewModal = ({ open, onClose, imageSrc, imageAlt = "Image preview" }) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    boxShadow: 'none',
                    borderRadius: 0
                }
            }}
        >
            <DialogContent sx={{ p: 0, position: 'relative' }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
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
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '80vh',
                        p: 2
                    }}
                >
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ImagePreviewModal; 