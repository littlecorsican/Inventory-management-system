import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import Modal from '../components/Modal';
import { getAllRooms, getAllContainers } from '../services/api';

const ContainerModal = ({ open, onClose, editingContainer, onSubmit }) => {
    const [rooms, setRooms] = useState([]);
    const [containers, setContainers] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_path: '',
        room_id: '',
        contained_in: '',
    });

    useEffect(() => {
        fetchRooms();
        fetchContainers();
    }, []);

    useEffect(() => {
        if (editingContainer) {
            setFormData({
                name: editingContainer.name,
                description: editingContainer.description,
                image_path: editingContainer.image_path,
                room_id: editingContainer.room_id || '',
                contained_in: editingContainer.contained_in || '',
            });
            setSelectedFile(null);
        } else {
            setFormData({
                name: '',
                description: '',
                image_path: '',
                room_id: '',
                contained_in: '',
            });
            setSelectedFile(null);
        }
    }, [editingContainer]);

    const fetchRooms = async () => {
        const data = await getAllRooms();
        setRooms(data.items);
    };

    const fetchContainers = async () => {
        const data = await getAllContainers();
        setContainers(data.items);
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

        await onSubmit(containerData, editingContainer?.id);
        onClose();
    };

    const handleClose = () => {
        setSelectedFile(null);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
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
    );
};

export default ContainerModal;
