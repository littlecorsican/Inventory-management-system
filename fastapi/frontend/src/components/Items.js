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
import { getAllItems, createItem, updateItem, deleteItem, getAllContainers } from '../services/api';
import ItemModal from '../modals/ItemModal';

const Items = () => {
    const [items, setItems] = useState([]);
    const [containers, setContainers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContainer, setSelectedContainer] = useState('all');

    const baseHost = process.env.REACT_APP_BACKEND_URL;

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
        setEditingItem(item);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingItem(null);
    };

    const handleSubmit = async (itemData, itemId) => {
        if (itemId) {
            await updateItem(itemId, itemData);
        } else {
            await createItem(itemData);
        }
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
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={6} sx={{
                                        overflow: "hidden"
                                    }}>
                                        <Typography variant="h6">{item.name}</Typography>
                                        <Typography color="textSecondary">
                                            {item.description}
                                        </Typography>
                                        {/* <Typography variant="body2">
                                            Location: ({item.xCoor}, {item.yCoor}, {item.zCoor})
                                        </Typography> */}
                                        <Typography variant="body2">
                                            Container: {containers.find(c => c.id === item.contained_in)?.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={6} sx={{
                                        overflow: "hidden"
                                    }}>
                                        <Box>
                                            {item.image_path && 
                                            <img src={`${baseHost}\\${item.image_path}`} 
                                                className="w-full h-auto" 
                                            />}
                                        </Box>
                                    </Grid>
                                </Grid>
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

            <ItemModal
                open={openModal}
                onClose={handleCloseModal}
                editingItem={editingItem}
                onSubmit={handleSubmit}
            />
        </Box>
    );
};

export default Items; 