import React, { useState } from 'react';
import { Box, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import Modal from '../components/Modal';
import ImagePicker from '../components/ImagePicker';
import ContainerSelect from '../components/ContainerSelect';
import { createItem, updateItem, resolveImagePath } from '../services/api';

const emptyForm = (defaults = {}) => ({
    name: '',
    description: '',
    image: null,
    quantity: 1,
    contained_in: null,
    ...defaults,
});

const ItemModal = ({ open, onClose, editingItem, defaults, onSaved, notify }) => {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(() =>
        editingItem
            ? {
                name: editingItem.name,
                description: editingItem.description || '',
                image: editingItem.image_path || null,
                quantity: editingItem.quantity ?? 1,
                contained_in: editingItem.contained_in ?? null,
            }
            : emptyForm(defaults)
    );

    const set = (field) => (value) => setFormData((f) => ({ ...f, [field]: value }));

    const save = async (addAnother) => {
        setSubmitting(true);
        try {
            // Upload once; if saving fails below, a retry reuses the uploaded path
            const image_path = await resolveImagePath(formData.image);
            set('image')(image_path);
            const itemData = {
                name: formData.name.trim(),
                description: formData.description,
                image_path,
                quantity: Math.max(0, parseInt(formData.quantity, 10) || 0),
                contained_in: formData.contained_in,
            };

            if (editingItem) {
                await updateItem(editingItem.id, itemData);
            } else {
                await createItem(itemData);
            }
            onSaved?.();
            notify?.(`${itemData.name} saved`);

            if (addAnother) {
                // Keep the container so you can quickly catalogue a whole box
                setFormData(emptyForm({ contained_in: formData.contained_in }));
            } else {
                onClose();
            }
        } catch (e) {
            notify?.(e.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        save(false);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={editingItem ? 'Edit Item' : 'Add Item'}
            onSubmit={handleSubmit}
            submitting={submitting}
            extraActions={!editingItem && (
                <Button
                    variant="outlined"
                    disabled={submitting || !formData.name.trim()}
                    onClick={() => save(true)}
                    sx={{ flex: { xs: 1, sm: 'none' } }}
                >
                    Save & add another
                </Button>
            )}
        >
            <ImagePicker value={formData.image} onChange={set('image')} />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
                <TextField
                    label="Name"
                    value={formData.name}
                    onChange={(e) => set('name')(e.target.value)}
                    required
                    inputProps={{ enterKeyHint: 'done' }}
                    sx={{ flex: 1 }}
                />
                <TextField
                    label="Qty"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => set('quantity')(e.target.value)}
                    inputProps={{ inputMode: 'numeric', min: 0, style: { textAlign: 'center' } }}
                    sx={{ width: 140 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start" sx={{ mr: 0 }}>
                                <IconButton size="small" edge="start" aria-label="decrease quantity"
                                    onClick={() => set('quantity')(Math.max(0, (parseInt(formData.quantity, 10) || 0) - 1))}>
                                    <RemoveIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end" sx={{ ml: 0 }}>
                                <IconButton size="small" edge="end" aria-label="increase quantity"
                                    onClick={() => set('quantity')((parseInt(formData.quantity, 10) || 0) + 1)}>
                                    <AddIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
            <ContainerSelect
                value={formData.contained_in}
                onChange={set('contained_in')}
                onError={(msg) => notify?.(msg, 'error')}
            />
            <TextField
                label="Notes"
                value={formData.description}
                onChange={(e) => set('description')(e.target.value)}
                multiline
                minRows={2}
            />
        </Modal>
    );
};

export default ItemModal;
