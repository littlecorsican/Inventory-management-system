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
import { getAllItems, createItem, updateItem, deleteItem, getAllContainers } from '../services/api';

const Items = () => {
    const [items, setItems] = useState([]);
    const [containers, setContainers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContainer, setSelectedContainer] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_path: '',
        xCoor: '',
        yCoor: '',
        zCoor: '',
        contained_in: '',
    });

    useEffect(() => {
        fetchItems();
        fetchContainers();
    }, []);

    const fetchItems = async () => {
        const data = await getAllItems();
        setItems(data.items);
    };

    const fetchContainers = async () => {
        const data = await getAllContainers();
        setContainers(data.items);
    };

    // Filter items based on search term and selected container
    const filteredItems = items.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (
            item.name.toLowerCase().includes(searchLower) ||
            (item.description && item.description.toLowerCase().includes(searchLower))
        );
        
        const matchesContainer = selectedContainer === 'all' || 
            item.contained_in === parseInt(selectedContainer);
        
        return matchesSearch && matchesContainer;
    });

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                description: item.description,
                image_path: item.image_path,
                xCoor: item.xCoor,
                yCoor: item.yCoor,
                zCoor: item.zCoor,
                contained_in: item.contained_in,
            });
            setSelectedFile(null);
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                description: '',
                image_path: '',
                xCoor: '',
                yCoor: '',
                zCoor: '',
                contained_in: '',
            });
            setSelectedFile(null);
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingItem(null);
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

        const itemData = {
            ...formData,
            image_path: imagePath,
            xCoor: parseInt(formData.xCoor),
            yCoor: parseInt(formData.yCoor),
            zCoor: parseInt(formData.zCoor),
            contained_in: parseInt(formData.contained_in),
        };

        if (editingItem) {
            await updateItem(editingItem.id, itemData);
        } else {
            await createItem(itemData);
        }

        handleCloseModal();
        fetchItems();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            await deleteItem(id);
            fetchItems();
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Items</Typography>
                <Button variant="contained" onClick={() => handleOpenModal()}>
                    Add Item
                </Button>
            </Box>

            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    label="Search items by name or description"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Type to search..."
                    sx={{ maxWidth: 600 }}
                />
            </Box>

            {/* Container Filter */}
            <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 300 }}>
                    <InputLabel>Filter by Container</InputLabel>
                    <Select
                        value={selectedContainer}
                        label="Filter by Container"
                        onChange={(e) => setSelectedContainer(e.target.value)}
                    >
                        <MenuItem value="all">Show all</MenuItem>
                        {containers.map((container) => (
                            <MenuItem key={container.id} value={container.id}>
                                {container.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={3}>
                {filteredItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{item.name}</Typography>
                                <Typography color="textSecondary">
                                    {item.description}
                                </Typography>
                                <Typography variant="body2">
                                    Location: ({item.xCoor}, {item.yCoor}, {item.zCoor})
                                </Typography>
                                <Typography variant="body2">
                                    Container: {containers.find(c => c.id === item.contained_in)?.name}
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton onClick={() => handleOpenModal(item)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(item.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Show message when no items match search */}
            {filteredItems.length === 0 && (searchTerm || selectedContainer !== 'all') && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="h6" color="textSecondary">
                        No items found matching your criteria
                    </Typography>
                </Box>
            )}

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                title={editingItem ? 'Edit Item' : 'Add Item'}
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
                <TextField
                    label="X Coordinate"
                    type="number"
                    value={formData.xCoor}
                    onChange={(e) => setFormData({ ...formData, xCoor: e.target.value })}
                />
                <TextField
                    label="Y Coordinate"
                    type="number"
                    value={formData.yCoor}
                    onChange={(e) => setFormData({ ...formData, yCoor: e.target.value })}
                />
                <TextField
                    label="Z Coordinate"
                    type="number"
                    value={formData.zCoor}
                    onChange={(e) => setFormData({ ...formData, zCoor: e.target.value })}
                />
                <FormControl fullWidth>
                    <InputLabel>Container</InputLabel>
                    <Select
                        value={formData.contained_in}
                        label="Container"
                        onChange={(e) => setFormData({ ...formData, contained_in: e.target.value })}
                    >
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

export default Items; 