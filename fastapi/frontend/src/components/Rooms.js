import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    IconButton,
    Grid,
    TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Modal from './Modal';
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../services/api';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        width: '',
        length: '',
        height: '',
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        const data = await getAllRooms();
        setRooms(data.items);
    };

    const handleOpenModal = (room = null) => {
        if (room) {
            setEditingRoom(room);
            setFormData({
                name: room.name,
                width: room.width,
                length: room.length,
                height: room.height,
            });
        } else {
            setEditingRoom(null);
            setFormData({
                name: '',
                width: '',
                length: '',
                height: '',
            });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingRoom(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const roomData = {
            ...formData,
            width: parseInt(formData.width) || null,
            length: parseInt(formData.length) || null,
            height: parseInt(formData.height) || null,
        };

        if (editingRoom) {
            await updateRoom(editingRoom.id, roomData);
        } else {
            await createRoom(roomData);
        }

        handleCloseModal();
        fetchRooms();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            await deleteRoom(id);
            fetchRooms();
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Rooms</Typography>
                <Button variant="contained" onClick={() => handleOpenModal()}>
                    Add Room
                </Button>
            </Box>

            <Grid container spacing={3}>
                {rooms.map((room) => (
                    <Grid item xs={12} sm={6} md={4} key={room.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{room.name}</Typography>
                                <Typography color="textSecondary">
                                    Dimensions: {room.width}m x {room.length}m x {room.height}m
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton onClick={() => handleOpenModal(room)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(room.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Modal
                open={openModal}
                onClose={handleCloseModal}
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
        </Box>
    );
};

export default Rooms; 