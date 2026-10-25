import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    MeetingRoomOutlined as RoomIcon,
    ViewInAr as View3DIcon,
} from '@mui/icons-material';
import { getAllRooms, createRoom, updateRoom, deleteRoom, getRoomById } from '../services/api';
import { useApp } from '../context/AppContext';
import RoomModal from '../modals/RoomModal';
import ThreeScene from '../components/ThreeScene';
import { EmptyState, PageHeader } from '../components/Cards';

const Rooms = () => {
    const navigate = useNavigate();
    const { version, notify } = useApp();
    const [rooms, setRooms] = useState(null);
    const [error, setError] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const sceneRef = useRef(null);

    const fetchRooms = async () => {
        try {
            const data = await getAllRooms();
            setRooms(data.items);
            setError(null);
        } catch (e) {
            setError(e.message);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [version]);

    const handleOpenModal = (room = null) => {
        setEditingRoom(room);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingRoom(null);
    };

    const handleSubmit = async (roomData, roomId) => {
        try {
            if (roomId) {
                await updateRoom(roomId, roomData);
            } else {
                await createRoom(roomData);
            }
            notify(`${roomData.name} saved`);
            fetchRooms();
            if (selectedRoom && selectedRoom.id === roomId) view3D(roomId);
            return true;
        } catch (e) {
            notify(e.message, 'error');
            return false;
        }
    };

    const handleDelete = async (room) => {
        if (!window.confirm(`Delete room "${room.name}"? Its containers will be kept.`)) return;
        try {
            await deleteRoom(room.id);
            notify(`${room.name} deleted`);
            if (selectedRoom?.id === room.id) setSelectedRoom(null);
            fetchRooms();
        } catch (e) {
            notify(e.message, 'error');
        }
    };

    const view3D = async (id) => {
        try {
            setSelectedRoom(await getRoomById(id));
            setTimeout(() => sceneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
        } catch (e) {
            notify(e.message, 'error');
        }
    };

    return (
        <Box>
            <PageHeader
                title="Rooms"
                action={
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                        Add
                    </Button>
                }
            />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {selectedRoom && (
                <Box ref={sceneRef} sx={{ mb: 3, scrollMarginTop: 80 }}>
                    <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="h6" sx={{ flex: 1 }} noWrap>{selectedRoom.name} · 3D</Typography>
                        <IconButton onClick={() => setSelectedRoom(null)} aria-label="close 3D view"><CloseIcon /></IconButton>
                    </Stack>
                    <ThreeScene room={selectedRoom} onSelectContainer={(c) => navigate(`/containers/${c.id}`)} />
                    <Typography variant="caption" color="text.secondary">
                        Drag to rotate · pinch or scroll to zoom · tap a box to open it.
                        {selectedRoom.containers.length === 0 && ' No containers in this room yet.'}
                    </Typography>
                </Box>
            )}

            {rooms && rooms.length === 0 && (
                <EmptyState icon={<RoomIcon />} title="No rooms yet">
                    <Typography variant="body2">Rooms are optional. They help you group containers and view them in 3D.</Typography>
                </EmptyState>
            )}

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
                {(rooms || []).map((room) => (
                    <Card variant="outlined" key={room.id}>
                        <CardContent sx={{ pb: '12px !important' }}>
                            <Typography variant="h6" noWrap>{room.name}</Typography>
                            <Typography color="text.secondary" variant="body2">
                                {room.width || '?'}m × {room.length || '?'}m × {room.height || '?'}m
                            </Typography>
                            <Stack direction="row" alignItems="center" sx={{ mt: 1 }}>
                                <Button startIcon={<View3DIcon />} onClick={() => view3D(room.id)} sx={{ mr: 'auto' }}>
                                    View 3D
                                </Button>
                                <IconButton onClick={() => handleOpenModal(room)} aria-label={`edit ${room.name}`}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(room)} aria-label={`delete ${room.name}`}>
                                    <DeleteIcon />
                                </IconButton>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {openModal && (
                <RoomModal
                    open={openModal}
                    onClose={handleCloseModal}
                    editingRoom={editingRoom}
                    onSubmit={handleSubmit}
                />
            )}
        </Box>
    );
};

export default Rooms;
