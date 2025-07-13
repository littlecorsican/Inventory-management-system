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
import { CloudUpload as CloudUploadIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import Modal from '../components/Modal';
import { getAllRooms, getAllContainers, uploadImage, uploadBase64 } from '../services/api';
import CameraCapture from '../components/CameraCapture';
import { truncateFilename } from '../utils/file';


const ContainerModal = ({ open, onClose, editingContainer, onSubmit }) => {
    const [rooms, setRooms] = useState([]);
    const [containers, setContainers] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageData, setImageData] = useState(null);
    const [cameraOpen, setCameraOpen] = useState(false)
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
            setSelectedFile(editingContainer.image_path);
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

    const handleUploadImage = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        if (file) {
            setFormData({ ...formData, image_path: file.name });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const uploadedName = selectedFile ? await uploadImage(selectedFile) : await uploadBase64(imageData)

        const containerData = {
            ...formData,
            image_path: uploadedName?.saved_path,
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

    const startCamera = () => {
        setCameraOpen(true)
    }

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
            <Box sx={{ display: 'flex', flexDirection: { xs: "column", md: 'row' }, gap: 2 }}>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleUploadImage}
                />
                <label htmlFor="image-upload">
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                    >
                        {selectedFile ? typeof selectedFile === "string" ? truncateFilename(selectedFile) : truncateFilename(selectedFile.name) : 'Upload Image'}
                    </Button>
                </label>
                {cameraOpen && <CameraCapture setImageData={setImageData} setCameraOpen={setCameraOpen} />}
                {!cameraOpen && <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PhotoCameraIcon />}
                    onClick={startCamera}
                >
                    Capture using camera
                </Button>}
                {imageData && (
                    <div>
                    <h4>Captured Image:</h4>
                    <img src={imageData} alt="Snapshot" />
                    </div>
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
