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
import { getAllItems, createItem, updateItem, deleteItem, getAllContainers } from '../services/api';

const Items = () => {
    const [items, setItems] = useState([]);
    const [containers, setContainers] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
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
        setItems(data);
    };

    const fetchContainers = async () => {
        const data = await getAllContainers();
        setContainers(data);
    };

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
        }
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const itemData = {
            ...formData,
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

            <Grid container spacing={3}>
                {items.map((item) => (
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
                <TextField
                    label="Image Path"
                    value={formData.image_path}
                    onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                />
                <TextField
                    label="X Coordinate"
                    type="number"
                    value={formData.xCoor}
                    onChange={(e) => setFormData({ ...formData, xCoor: e.target.value })}
                    required
                />
                <TextField
                    label="Y Coordinate"
                    type="number"
                    value={formData.yCoor}
                    onChange={(e) => setFormData({ ...formData, yCoor: e.target.value })}
                    required
                />
                <TextField
                    label="Z Coordinate"
                    type="number"
                    value={formData.zCoor}
                    onChange={(e) => setFormData({ ...formData, zCoor: e.target.value })}
                    required
                />
                <FormControl fullWidth>
                    <InputLabel>Container</InputLabel>
                    <Select
                        value={formData.contained_in}
                        label="Container"
                        onChange={(e) => setFormData({ ...formData, contained_in: e.target.value })}
                        required
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