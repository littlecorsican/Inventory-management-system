import React, { useRef } from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';

const escapeHtml = (text) =>
    text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Printable QR label for a container. Stick it on the box; scanning it with any phone
 * camera opens the container's page and shows what's inside.
 */
const QrLabelDialog = ({ open, onClose, container }) => {
    const qrRef = useRef(null);
    const url = `${window.location.origin}/containers/${container.id}`;
    const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);

    const print = () => {
        const svg = qrRef.current?.querySelector('svg')?.outerHTML || '';
        const win = window.open('', '_blank', 'width=420,height=520');
        if (!win) return;
        win.document.write(`<!doctype html><html><head><title>${escapeHtml(container.name)} label</title>
            <style>
                body { font-family: sans-serif; margin: 0; display: flex; justify-content: center; }
                .label { border: 1px dashed #999; padding: 12px 16px; margin: 16px; text-align: center; width: 200px; }
                .label svg { width: 160px; height: 160px; }
                .name { font-size: 18px; font-weight: 700; margin-top: 8px; word-break: break-word; }
                .id { font-size: 11px; color: #666; }
                @media print { .label { border-color: #ccc; } }
            </style></head>
            <body><div class="label">${svg}<div class="name">${escapeHtml(container.name)}</div><div class="id">#${container.id}</div></div>
            <script>window.onload = () => { window.print(); };</script></body></html>`);
        win.document.close();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>QR label</DialogTitle>
            <DialogContent>
                <Box ref={qrRef} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                        <QRCodeSVG value={url} size={180} level="M" />
                    </Box>
                    <Typography variant="h6" sx={{ mt: 1, textAlign: 'center', wordBreak: 'break-word' }}>{container.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all', textAlign: 'center' }}>{url}</Typography>
                </Box>
                {isLocalhost && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        This label points to <b>{window.location.hostname}</b>, which other devices can't open.
                        Open the app via your computer's network address (e.g. http://192.168.1.10:8000) before printing.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                <Button variant="contained" startIcon={<PrintIcon />} onClick={print}>Print</Button>
            </DialogActions>
        </Dialog>
    );
};

export default QrLabelDialog;
