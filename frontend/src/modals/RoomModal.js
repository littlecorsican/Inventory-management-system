import React, { useState } from 'react';
import {
    Box,
    TextField
} from '@mui/material';
import Modal from '../components/Modal';

const RoomModal = ({ open, onClose, editingRoom, onSubmit }) => {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: editingRoom?.name || '',
        width: editingRoom?.width ?? '',
        length: editingRoom?.length ?? '',
        height: editingRoom?.height ?? '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const roomData = {
            ...formData,
            name: formData.name.trim(),
            width: parseInt(formData.width) || null,
            length: parseInt(formData.length) || null,
            height: parseInt(formData.height) || null,
        };

        setSubmitting(true);
        const saved = await onSubmit(roomData, editingRoom?.id);
        setSubmitting(false);
        if (saved) onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editingRoom ? 'Edit Room' : 'Add Room'}
            onSubmit={handleSubmit}
            submitting={submitting}
        >
            <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g. Garage, Bedroom"
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {[['width', 'Width'], ['length', 'Length'], ['height', 'Height']].map(([field, label]) => (
                    <TextField
                        key={field}
                        label={label}
                        type="number"
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        inputProps={{ inputMode: 'numeric', min: 0 }}
                        helperText="metres"
                    />
                ))}
            </Box>
        </Modal>
    );
};

export default RoomModal;
