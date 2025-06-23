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
import { Edit as EditIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import Modal from './Modal';
import { getAllContainers, createContainer, updateContainer, deleteContainer, getAllRooms } from '../services/api';

const Containers = () => {
    const [containers, setContainers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editingContainer, setEditingContainer] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('all');
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
        if (container) {
            setEditingContainer(container);
            setFormData({
                name: container.name,
                description: container.description,
                image_path: container.image_path,
                room_id: container.room_id || '',
                contained_in: container.contained_in || '',
            });
            setSelectedFile(null);
        } else {
            setEditingContainer(null);
            setFormData({
                name: '',
                description: '',
                image_path: '',
                room_id: '',
                contained_in: '',
            });
            setSelectedFile(null);
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingContainer(null);
        setSelectedFile(null);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        if (file) {
            setFormData({ ...formData, image_path: file.name });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Handle file upload if a new file is selected
        let imagePath = formData.image_path;
        if (selectedFile) {
            // Here you would typically upload the file to your server
            // For now, we'll use the file name as the path
            // You might want to implement actual file upload logic here
            imagePath = `/uploads/${selectedFile.name}`;
        }

        const containerData = {
            ...formData,
            image_path: imagePath,
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="image-upload"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="image-upload">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            fullWidth
                        >
                            {selectedFile ? selectedFile.name : 'Upload Image'}
                        </Button>
                    </label>
                    {selectedFile && (
                        <Typography variant="caption" color="textSecondary">
                            Selected: {selectedFile.name}
                        </Typography>
                    )}
                </Box>
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