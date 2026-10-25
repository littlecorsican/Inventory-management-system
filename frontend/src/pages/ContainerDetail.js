import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Breadcrumbs,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Link,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import {
    AddAPhoto as AddAPhotoIcon,
    CreateNewFolderOutlined as AddContainerIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Inventory2Outlined as BoxIcon,
    MeetingRoomOutlined as RoomIcon,
    QrCode2 as QrIcon,
} from '@mui/icons-material';
import { getContainerById, deleteItem } from '../services/api';
import { useApp } from '../context/AppContext';
import useImagePreview from '../hooks/useImagePreview';
import { CardGrid, ContainerCard, EmptyState, ItemCard, Thumb } from '../components/Cards';
import QrLabelDialog from '../components/QrLabelDialog';
import { confirmDeleteContainer } from './Containers';

const ContainerDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { version, refresh, notify, editItem, editContainer } = useApp();
    const [container, setContainer] = useState(null);
    const [error, setError] = useState(null);
    const [qrOpen, setQrOpen] = useState(false);
    const { openPreview, previewModal } = useImagePreview();

    useEffect(() => {
        let active = true;
        setError(null);
        getContainerById(id)
            .then((data) => active && setContainer(data))
            .catch((e) => active && setError(e.message));
        return () => { active = false; };
    }, [id, version]);

    const handleDeleteItem = async (item) => {
        if (!window.confirm(`Delete "${item.name}"?`)) return;
        try {
            await deleteItem(item.id);
            notify(`${item.name} deleted`);
            refresh();
        } catch (e) {
            notify(e.message, 'error');
        }
    };

    const handleDeleteContainer = async () => {
        const deleted = await confirmDeleteContainer(container, { notify, refresh });
        if (deleted) navigate(container.contained_in ? `/containers/${container.contained_in}` : '/containers');
    };

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!container || String(container.id) !== String(id)) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>;
    }

    return (
        <Box>
            <Breadcrumbs sx={{ mb: 1.5, '& ol': { flexWrap: 'wrap' } }} maxItems={4}>
                <Link component={RouterLink} to="/containers" underline="hover" color="inherit">Containers</Link>
                {container.path.map((p) => (
                    <Link key={p.id} component={RouterLink} to={`/containers/${p.id}`} underline="hover" color="inherit">{p.name}</Link>
                ))}
                <Typography color="text.primary" noWrap>{container.name}</Typography>
            </Breadcrumbs>

            <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Box sx={{ width: { xs: '100%', sm: 200 }, flexShrink: 0, borderRadius: 1, overflow: 'hidden', maxHeight: { xs: 260, sm: 'none' } }}>
                        <Thumb path={container.image_path} alt={container.name} icon={<BoxIcon />} onClick={() => openPreview(container.image_path, container.name)} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="flex-start" spacing={1}>
                            <Typography variant="h5" component="h1" fontWeight={600} sx={{ flex: 1, wordBreak: 'break-word' }}>
                                {container.name}
                            </Typography>
                            <IconButton onClick={() => setQrOpen(true)} aria-label="QR label"><QrIcon /></IconButton>
                            <IconButton onClick={() => editContainer(container)} aria-label="edit container"><EditIcon /></IconButton>
                            <IconButton onClick={handleDeleteContainer} aria-label="delete container"><DeleteIcon /></IconButton>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ my: 1, flexWrap: 'wrap', gap: 1 }}>
                            {container.room_name && <Chip size="small" icon={<RoomIcon />} label={container.room_name} sx={{ ml: '0 !important' }} />}
                            <Chip size="small" label={`${container.items.length} item${container.items.length === 1 ? '' : 's'}`} sx={{ ml: '0 !important' }} />
                        </Stack>
                        {container.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{container.description}</Typography>
                        )}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                            <Button variant="contained" startIcon={<AddAPhotoIcon />} onClick={() => editItem(null, { contained_in: container.id })}>
                                Add item here
                            </Button>
                            <Button variant="outlined" startIcon={<AddContainerIcon />} onClick={() => editContainer(null, { contained_in: container.id, room_id: container.room_id })}>
                                Add container inside
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>

            {container.child_containers.length > 0 && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Containers inside</Typography>
                    <CardGrid>
                        {container.child_containers.map((child) => (
                            <ContainerCard
                                key={child.id}
                                container={child}
                                onEdit={() => editContainer(child)}
                                onDelete={() => confirmDeleteContainer(child, { notify, refresh })}
                            />
                        ))}
                    </CardGrid>
                </Box>
            )}

            <Typography variant="h6" sx={{ mb: 1 }}>Items</Typography>
            {container.items.length ? (
                <CardGrid>
                    {container.items.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            showContainer={false}
                            onEdit={() => editItem(item)}
                            onDelete={() => handleDeleteItem(item)}
                            onImageClick={openPreview}
                        />
                    ))}
                </CardGrid>
            ) : (
                <EmptyState icon={<BoxIcon />} title="Nothing in here yet">
                    <Typography variant="body2">Use "Add item here" to snap what's inside.</Typography>
                </EmptyState>
            )}

            {previewModal}
            {qrOpen && <QrLabelDialog open onClose={() => setQrOpen(false)} container={container} />}
        </Box>
    );
};

export default ContainerDetail;
