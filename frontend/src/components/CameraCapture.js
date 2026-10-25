import React, { useRef, useEffect, useState } from "react";
import { Alert, Box, Button, Stack } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

// Live camera works only on https:// or localhost; on plain http the browser hides mediaDevices
export const canUseLiveCamera = () =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && window.isSecureContext;

// Live webcam preview (used on desktops). Phones use the native camera via <input capture> instead.
export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  // Start the camera on mount and always release it on unmount
  useEffect(() => {
    let stream;
    let cancelled = false;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        videoRef.current.srcObject = stream;
      } catch (err) {
        setError(err.name === 'NotAllowedError' ? 'Camera permission was denied.' : 'Could not start the camera.');
      }
    };
    startCamera();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Capture a frame at the camera's real resolution
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => blob && onCapture(new File([blob], 'camera.jpg', { type: 'image/jpeg' })),
      'image/jpeg',
      0.9
    );
  };

  if (error) {
    return <Alert severity="warning" onClose={onCancel}>{error}</Alert>;
  }

  return (
    <Box>
      <Box
        component="video"
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={() => setReady(true)}
        sx={{ width: '100%', maxHeight: '50vh', borderRadius: 2, bgcolor: 'black', display: 'block' }}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button variant="contained" startIcon={<PhotoCameraIcon />} onClick={captureImage} disabled={!ready} fullWidth>
          Take picture
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Stack>
    </Box>
  );
}
