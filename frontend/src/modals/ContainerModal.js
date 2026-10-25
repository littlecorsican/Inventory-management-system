import React, { useEffect, useMemo, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import Modal from '../components/Modal';
import ImagePicker from '../components/ImagePicker';
import ContainerSelect from '../components/ContainerSelect';
import { getAllRooms, createContainer, updateContainer, resolveImagePath } from '../services/api';

const toInt = (v) => (v === '' || v === null || v === undefined ? null : parseInt(v, 10));

const ContainerModal = ({ open, onClose, editingContainer, defaults, onSaved, notify }) => {
    const [rooms, setRooms] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(() => {
        const c = editingContainer || defaults || {};
        return {
            name: c.name || '',
            description: c.description || '',
            image: c.image_path || null,
            xCoor: c.xCoor ?? '',
            yCoor: c.yCoor ?? '',
            zCoor: c.zCoor ?? '',
            room_id: c.room_id ?? '',
            contained_in: c.contained_in ?? null,
        };
    });

    useEffect(() => {
        getAllRooms()
            .then((data) => setRooms(data.items))
            .catch((e) => notify?.(e.message, 'error'));
    }, [notify]);

    // A container can't be put inside itself
    const excludeIds = useMemo(() => (editingContainer ? [editingContainer.id] : []), [editingContainer]);
    const set = (field) => (value) => setFormData((f) => ({ ...f, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Upload once; if saving fails below, a retry reuses the uploaded path
            const image_path = await resolveImagePath(formData.image);
            set('image')(image_path);
            const containerData = {
                name: formData.name.trim(),
                description: formData.description,
                image_path,
                xCoor: toInt(formData.xCoor),
                yCoor: toInt(formData.yCoor),
                zCoor: toInt(formData.zCoor),
                room_id: toInt(formData.room_id),
                contained_in: formData.contained_in,
            };

            if (editingContainer) {
                await updateContainer(editingContainer.id, containerData);
            } else {
                await createContainer(containerData);
            }
            onSaved?.();
            notify?.(`${containerData.name} saved`);
            onClose();
        } catch (err) {
            notify?.(err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editingContainer ? 'Edit Container' : 'Add Container'}
            onSubmit={handleSubmit}
            submitting={submitting}
        >
            <ImagePicker value={formData.image} onChange={set('image')} />
            <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => set('name')(e.target.value)}
                required
                placeholder="e.g. Blue box, Garage shelf 2"
            />
            <TextField
                select
                label="Room"
                value={formData.room_id}
                onChange={(e) => set('room_id')(e.target.value)}
            >
                <MenuItem value="">None</MenuItem>
                {rooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                        {room.name}
                    </MenuItem>
                ))}
            </TextField>
            <ContainerSelect
                label="Inside another container (optional)"
                value={formData.contained_in}
                onChange={set('contained_in')}
                excludeIds={excludeIds}
                allowCreate={false}
                onError={(msg) => notify?.(msg, 'error')}
            />
            <TextField
                label="Notes"
                value={formData.description}
                onChange={(e) => set('description')(e.target.value)}
                multiline
                minRows={2}
            />
            <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body2">Position in room (for 3D view)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                        {[['xCoor', 'X (width)'], ['zCoor', 'Y (length)'], ['yCoor', 'Height']].map(([field, label]) => (
                            <TextField
                                key={field}
                                label={label}
                                type="number"
                                size="small"
                                value={formData[field]}
                                onChange={(e) => set(field)(e.target.value)}
                                inputProps={{ inputMode: 'numeric' }}
                                helperText="m"
                            />
                        ))}
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Modal>
    );
};

export default ContainerModal;
