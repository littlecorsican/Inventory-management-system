import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import {
    AddAPhoto as AddAPhotoIcon,
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon,
    PhotoLibrary as PhotoLibraryIcon,
    Videocam as VideocamIcon,
} from '@mui/icons-material';
import CameraCapture, { canUseLiveCamera } from './CameraCapture';
import { imageUrl } from '../utils/image';

/**
 * Photo field.
 * value: existing image path (string), a new File, or null. onChange receives the same.
 */
const ImagePicker = ({ value, onChange, label = 'Photo' }) => {
    const cameraInput = useRef(null);
    const galleryInput = useRef(null);
    const [webcamOpen, setWebcamOpen] = useState(false);
    const [preview, setPreview] = useState(null);
    const isTouch = useMediaQuery('(pointer: coarse)');
    const showWebcam = !isTouch && canUseLiveCamera();

    useEffect(() => {
        if (value instanceof Blob) {
            const url = URL.createObjectURL(value);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreview(imageUrl(value));
    }, [value]);

    const handleFile = (event) => {
        const file = event.target.files?.[0];
        if (file) onChange(file);
        // Allow picking the same file again later
        event.target.value = '';
    };

    // On phones "capture" opens the camera app directly; desktops ignore it and show a file picker
    const openCamera = () => (isTouch ? cameraInput : galleryInput).current.click();

    if (webcamOpen) {
        return (
            <CameraCapture
                onCapture={(file) => { onChange(file); setWebcamOpen(false); }}
                onCancel={() => setWebcamOpen(false)}
            />
        );
    }

    return (
        <Box>
            <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
            <input ref={galleryInput} type="file" accept="image/*" hidden onChange={handleFile} />

            <Box
                onClick={preview ? undefined : openCamera}
                role={preview ? undefined : 'button'}
                sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '4 / 3',
                    maxHeight: { xs: '45vh', sm: 320 },
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'action.hover',
                    border: preview ? 'none' : '2px dashed',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: preview ? 'default' : 'pointer',
                }}
            >
                {preview ? (
                    <>
                        <Box component="img" src={preview} alt={label} sx={{ width: '100%', height: '100%', objectFit: 'contain', bgcolor: 'black' }} />
                        <IconButton
                            aria-label="remove photo"
                            onClick={() => onChange(null)}
                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.55)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </>
                ) : (
                    <Stack alignItems="center" spacing={1} color="text.secondary">
                        <AddAPhotoIcon sx={{ fontSize: 48 }} />
                        <Typography variant="body2">{isTouch ? 'Tap to take a photo' : 'Click to add a photo'}</Typography>
                    </Stack>
                )}
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {isTouch && (
                    <Button variant="outlined" startIcon={<PhotoCameraIcon />} onClick={() => cameraInput.current.click()} fullWidth>
                        {preview ? 'Retake' : 'Camera'}
                    </Button>
                )}
                <Button variant="outlined" startIcon={<PhotoLibraryIcon />} onClick={() => galleryInput.current.click()} fullWidth>
                    {isTouch ? 'Gallery' : 'Upload'}
                </Button>
                {showWebcam && (
                    <Button variant="outlined" startIcon={<VideocamIcon />} onClick={() => setWebcamOpen(true)} fullWidth>
                        Webcam
                    </Button>
                )}
            </Stack>
        </Box>
    );
};

export default ImagePicker;
