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
import { getAllContainers, createContainer, updateContainer, deleteContainer, getAllRooms } from '../services/api';
import ContainerModal from '../modals/ContainerModal';

const Containers = () => {
    const [containers, setContainers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editingContainer, setEditingContainer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('all');

    useEffect(() => {
        fetchContainers();
        fetchRooms();
    }, []);

    const fetchContainers = async () => {
        const data = await getAllContainers();
        setContainers(data.items);
    };

    const fetchRooms = async () => {
        const data = await getAllRooms();
        setRooms(data.items);
    };

    // Filter containers based on search term and selected room
    const filteredContainers = containers.filter(container => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            container.name.toLowerCase().includes(searchLower) ||
            (container.description && container.description.toLowerCase().includes(searchLower))
        );
        
        const matchesRoom = selectedRoom === 'all' || 
            container.room_id === parseInt(selectedRoom);
        
        return matchesSearch && matchesRoom;
    });

    const handleOpenModal = (container = null) => {
        setEditingContainer(container);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingContainer(null);
    };

    const handleSubmit = async (containerData, containerId) => {
        if (containerId) {
            await updateContainer(containerId, containerData);
        } else {
            await createContainer(containerData);
        }
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

            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    label="Search containers by name or description"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search..."
                    sx={{ maxWidth: 600 }}
                />
            </Box>

            {/* Room Filter */}
            <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 300 }}>
                    <InputLabel>Filter by Room</InputLabel>
                    <Select
                        value={selectedRoom}
                        label="Filter by Room"
                        onChange={(e) => setSelectedRoom(e.target.value)}
                    >
                        <MenuItem value="all">Show all</MenuItem>
                        {rooms.map((room) => (
                            <MenuItem key={room.id} value={room.id}>
                                {room.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                {filteredContainers.map((container) => (
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

            {/* Show message when no containers match search */}
            {filteredContainers.length === 0 && (searchTerm || selectedRoom !== 'all') && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="h6" color="textSecondary">
                        No containers found matching your criteria
                    </Typography>
                </Box>
            )}

            <ContainerModal
                open={openModal}
                onClose={handleCloseModal}
                editingContainer={editingContainer}
                onSubmit={handleSubmit}
            />
        </Box>
    );
};

export default Containers; 