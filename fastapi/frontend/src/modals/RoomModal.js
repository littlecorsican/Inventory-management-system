import React, { useState, useEffect } from 'react';
import {
    TextField
} from '@mui/material';
import Modal from '../components/Modal';

const RoomModal = ({ open, onClose, editingRoom, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        width: '',
        length: '',
        height: '',
    });

    useEffect(() => {
        if (editingRoom) {
            setFormData({
                name: editingRoom.name,
                width: editingRoom.width,
                length: editingRoom.length,
                height: editingRoom.height,
            });
        } else {
            setFormData({
                name: '',
                width: '',
                length: '',
                height: '',
            });
        }
    }, [editingRoom]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const roomData = {
            ...formData,
            width: parseInt(formData.width) || null,
            length: parseInt(formData.length) || null,
            height: parseInt(formData.height) || null,
        };

        await onSubmit(roomData, editingRoom?.id);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editingRoom ? 'Edit Room' : 'Add Room'}
            onSubmit={handleSubmit}
        >
            <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
            />
            <TextField
                label="Width (m)"
                type="number"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
            />
            <TextField
                label="Length (m)"
                type="number"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
            />
            <TextField
                label="Height (m)"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            />
        </Modal>
    );
};

export default RoomModal;
