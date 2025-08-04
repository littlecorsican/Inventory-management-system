import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    IconButton,
    Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getAllRooms, createRoom, updateRoom, deleteRoom, getRoomById } from '../services/api';
import RoomModal from '../modals/RoomModal';
import ThreeScene from './ThreeScene';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        const data = await getAllRooms();
        setRooms(data.items);
    };

    const handleOpenModal = (room = null) => {
        setEditingRoom(room);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingRoom(null);
    };

    const handleSubmit = async (roomData, roomId) => {
        if (roomId) {
            await updateRoom(roomId, roomData);
        } else {
            await createRoom(roomData);
        }
        fetchRooms();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            await deleteRoom(id);
            fetchRooms();
        }
    };

    const getContainers = async(id) => {
        const data = await getRoomById(id);
        console.log("data.items", data)
        setSelectedRoom(data);
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Rooms</Typography>
                <Button variant="contained" onClick={() => handleOpenModal()}>
                    Add Room
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    {selectedRoom ? `3D Visualization - ${selectedRoom.name}` : '3D Room Visualization'}
                </Typography>
                <div id="animation-container">
                    <ThreeScene selectedRoom={selectedRoom} />
                </div>
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
                                    <Button onClick={()=>getContainers(room.id)}>View 3D</Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <RoomModal
                open={openModal}
                onClose={handleCloseModal}
                editingRoom={editingRoom}
                onSubmit={handleSubmit}
            />
        </Box>
    );
};

export default Rooms; 