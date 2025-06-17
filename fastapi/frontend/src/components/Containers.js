import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    IconButton,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Modal from './Modal';
import { getAllContainers, createContainer, updateContainer, deleteContainer, getAllRooms } from '../services/api';

const Containers = () => {
    const [containers, setContainers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editingContainer, setEditingContainer] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_path: '',
        room_id: '',
        contained_in: '',
    });

    useEffect(() => {
        fetchContainers();
        fetchRooms();
    }, []);

    const fetchContainers = async () => {
        const data = await getAllContainers();
        setContainers(data);
    };

    const fetchRooms = async () => {
        const data = await getAllRooms();
        setRooms(data);
    };

    const handleOpenModal = (container = null) => {
        if (container) {
            setEditingContainer(container);
            setFormData({
                name: container.name,
                description: container.description,
                image_path: container.image_path,
                room_id: container.room_id || '',
                contained_in: container.contained_in || '',
            });
        } else {
            setEditingContainer(null);
            setFormData({
                name: '',
                description: '',
                image_path: '',
                room_id: '',
                contained_in: '',
            });
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingContainer(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const containerData = {
            ...formData,
            room_id: formData.room_id ? parseInt(formData.room_id) : null,
            contained_in: formData.contained_in ? parseInt(formData.contained_in) : null,
        };

        if (editingContainer) {
            await updateContainer(editingContainer.id, containerData);
        } else {
            await createContainer(containerData);
        }

        handleCloseModal();
        fetchContainers();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this container?')) {
            await deleteContainer(id);
            fetchContainers();
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Containers</Typography>
                <Button variant="contained" onClick={() => handleOpenModal()}>
                    Add Container
                </Button>
            </Box>

            <Grid container spacing={3}>
                {containers.map((container) => (
                    <Grid item xs={12} sm={6} md={4} key={container.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{container.name}</Typography>
                                <Typography color="textSecondary">
                                    {container.description}
                                </Typography>
                                {container.room_id && (
                                    <Typography variant="body2">
                                        Room: {rooms.find(r => r.id === container.room_id)?.name}
                                    </Typography>
                                )}
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton onClick={() => handleOpenModal(container)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(container.id)}>
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
                title={editingContainer ? 'Edit Container' : 'Add Container'}
                onSubmit={handleSubmit}
            >
                <TextField
                    label="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
                <TextField
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    multiline
                    rows={3}
                />
                <TextField
                    label="Image Path"
                    value={formData.image_path}
                    onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                />
                <FormControl fullWidth>
                    <InputLabel>Room</InputLabel>
                    <Select
                        value={formData.room_id}
                        label="Room"
                        onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    >
                        <MenuItem value="">None</MenuItem>
                        {rooms.map((room) => (
                            <MenuItem key={room.id} value={room.id}>
                                {room.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Parent Container</InputLabel>
                    <Select
                        value={formData.contained_in}
                        label="Parent Container"
                        onChange={(e) => setFormData({ ...formData, contained_in: e.target.value })}
                    >
                        <MenuItem value="">None</MenuItem>
                        {containers.map((container) => (
                            <MenuItem key={container.id} value={container.id}>
                                {container.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Modal>
        </Box>
    );
};

export default Containers; 