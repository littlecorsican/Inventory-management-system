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
import { getAllContainers, uploadBase64, uploadImage } from '../services/api';
import CameraCapture from '../components/CameraCapture';
import { truncateFilename } from '../utils/file';


const ItemModal = ({ open, onClose, editingItem, onSubmit }) => {
    const [containers, setContainers] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageData, setImageData] = useState(null);
    const [cameraOpen, setCameraOpen] = useState(false)
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
        fetchContainers();
    }, []);

    useEffect(() => {
        if (editingItem) {
            setFormData({
                name: editingItem.name,
                description: editingItem.description,
                image_path: editingItem.image_path,
                xCoor: editingItem.xCoor,
                yCoor: editingItem.yCoor,
                zCoor: editingItem.zCoor,
                contained_in: editingItem.contained_in,
            });
            setSelectedFile(null);
        } else {
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
    }, [editingItem]);

    const fetchContainers = async () => {
        const data = await getAllContainers();
        setContainers(data.items);
    };

    const handleUploadImage = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        if (file) {
            setFormData({ ...formData, image_path: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Handle file upload if a new file is selected
        // let imagePath = formData.image_path;
        // if (selectedFile) {
        //     // Here you would typically upload the file to your server
        //     // For now, we'll use the file name as the path
        //     // You might want to implement actual file upload logic here
        //     imagePath = `/uploads/${selectedFile.name}`;
        // }

        const uploadedName = selectedFile ? await uploadImage(selectedFile) : await uploadBase64(imageData)

        const itemData = {
            ...formData,
            image_path: uploadedName?.saved_path,
            xCoor: formData.xCoor ? parseInt(formData.xCoor) : null,
            yCoor: formData.yCoor ? parseInt(formData.yCoor) : null,
            zCoor: formData.zCoor ? parseInt(formData.zCoor) : null,
            contained_in: formData.contained_in ? parseInt(formData.contained_in) : null,
        };

        console.log("itemData", itemData)

        await onSubmit(itemData, editingItem?.id);
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
                    >
                        {selectedFile ? truncateFilename(selectedFile.name) : 'Upload Image'}
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
                {/* {selectedFile && (
                    <Typography variant="caption" color="textSecondary">
                        Selected: {selectedFile.name}
                    </Typography>
                )} */}
            </Box>
            <Box display="flex" gap={2}>
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
            </Box>
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
    );
};

export default ItemModal;