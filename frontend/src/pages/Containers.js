import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { Add as AddIcon, Inventory2Outlined as BoxIcon } from '@mui/icons-material';
import { getContainers, deleteContainer, getAllRooms } from '../services/api';
import { useApp } from '../context/AppContext';
import useDebounce from '../hooks/useDebounce';
import usePagedList from '../hooks/usePagedList';
import { CardGrid, ContainerCard, EmptyState, PageHeader, SearchField } from '../components/Cards';

export const confirmDeleteContainer = async (container, { notify, refresh }) => {
    if (!window.confirm(`Delete "${container.name}"? Anything inside it will be moved up one level.`)) return false;
    try {
        await deleteContainer(container.id);
        notify(`${container.name} deleted`);
        refresh();
        return true;
    } catch (e) {
        notify(e.message, 'error');
        return false;
    }
};

const Containers = () => {
    const { version, refresh, notify, editContainer } = useApp();
    const [rooms, setRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('all');
    const debouncedSearch = useDebounce(searchTerm.trim());

    useEffect(() => {
        getAllRooms()
            .then((data) => setRooms(data.items))
            .catch((e) => notify(e.message, 'error'));
    }, [version, notify]);

    const { items: containers, total, loading, error, hasMore, loadMore } = usePagedList(
        getContainers,
        { q: debouncedSearch, room_id: selectedRoom === 'all' ? undefined : selectedRoom },
        version
    );

    const filtering = Boolean(debouncedSearch) || selectedRoom !== 'all';

    return (
        <Box>
            <PageHeader
                title="Containers"
                subtitle={loading && !containers.length ? ' ' : `${total} container${total === 1 ? '' : 's'}`}
                action={
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => editContainer()}>
                        Add
                    </Button>
                }
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search containers…" />
                <TextField
                    select
                    size="small"
                    label="Room"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    sx={{ minWidth: { sm: 220 } }}
                >
                    <MenuItem value="all">All rooms</MenuItem>
                    {rooms.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                            {room.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {containers.length > 0 && (
                <CardGrid>
                    {containers.map((container) => (
                        <ContainerCard
                            key={container.id}
                            container={container}
                            onEdit={() => editContainer(container)}
                            onDelete={() => confirmDeleteContainer(container, { notify, refresh })}
                        />
                    ))}
                </CardGrid>
            )}

            {!loading && !error && containers.length === 0 && (
                <EmptyState icon={<BoxIcon />} title={filtering ? 'No matching containers' : 'No containers yet'}>
                    <Typography variant="body2">
                        {filtering ? 'Try a different search or room.' : 'Add the boxes, drawers and shelves where you keep things.'}
                    </Typography>
                </EmptyState>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                {loading ? <CircularProgress size={28} /> : hasMore && (
                    <Button variant="outlined" onClick={loadMore}>Load more</Button>
                )}
            </Box>
        </Box>
    );
};

export default Containers;
