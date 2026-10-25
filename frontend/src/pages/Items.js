import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Add as AddIcon, CategoryOutlined as ItemsIcon } from '@mui/icons-material';
import { getItems, deleteItem, getAllContainers } from '../services/api';
import { useApp } from '../context/AppContext';
import useDebounce from '../hooks/useDebounce';
import usePagedList from '../hooks/usePagedList';
import useImagePreview from '../hooks/useImagePreview';
import { CardGrid, EmptyState, ItemCard, PageHeader, SearchField } from '../components/Cards';

const Items = () => {
    const { version, refresh, notify, editItem } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [selectedContainer, setSelectedContainer] = useState(searchParams.get('container') || 'all');
    const [containers, setContainers] = useState([]);
    const { openPreview, previewModal } = useImagePreview();

    const debouncedSearch = useDebounce(searchTerm.trim());

    // Keep filters in the URL so back/refresh and dashboard links work
    useEffect(() => {
        const next = {};
        if (debouncedSearch) next.q = debouncedSearch;
        if (selectedContainer !== 'all') next.container = selectedContainer;
        setSearchParams(next, { replace: true });
    }, [debouncedSearch, selectedContainer, setSearchParams]);

    useEffect(() => {
        getAllContainers()
            .then((data) => setContainers(data.items))
            .catch((e) => notify(e.message, 'error'));
    }, [version, notify]);

    const { items, total, loading, error, hasMore, loadMore } = usePagedList(
        getItems,
        {
            q: debouncedSearch,
            container_id: /^\d+$/.test(selectedContainer) ? selectedContainer : undefined,
            unassigned: selectedContainer === 'none' ? true : undefined,
        },
        version
    );

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.name}"?`)) return;
        try {
            await deleteItem(item.id);
            notify(`${item.name} deleted`);
            refresh();
        } catch (e) {
            notify(e.message, 'error');
        }
    };

    const filtering = Boolean(debouncedSearch) || selectedContainer !== 'all';

    return (
        <Box>
            <PageHeader
                title="Items"
                subtitle={loading && !items.length ? ' ' : `${total} item${total === 1 ? '' : 's'}${filtering ? ' found' : ''}`}
                action={
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => editItem()}>
                        Add
                    </Button>
                }
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search items…" />
                <TextField
                    select
                    size="small"
                    label="Container"
                    value={selectedContainer}
                    onChange={(e) => setSelectedContainer(e.target.value)}
                    sx={{ minWidth: { sm: 240 } }}
                >
                    <MenuItem value="all">All containers</MenuItem>
                    <MenuItem value="none">No container</MenuItem>
                    {containers.map((container) => (
                        <MenuItem key={container.id} value={String(container.id)}>
                            {container.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {items.length > 0 && (
                <CardGrid>
                    {items.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onEdit={() => editItem(item)}
                            onDelete={() => handleDelete(item)}
                            onImageClick={openPreview}
                        />
                    ))}
                </CardGrid>
            )}

            {!loading && !error && items.length === 0 && (
                <EmptyState icon={<ItemsIcon />} title={filtering ? 'No matching items' : 'No items yet'}>
                    <Typography variant="body2">
                        {filtering ? 'Try a different search or container.' : 'Snap a photo of something to start your inventory.'}
                    </Typography>
                </EmptyState>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                {loading ? <CircularProgress size={28} /> : hasMore && (
                    <Button variant="outlined" onClick={loadMore}>Load more</Button>
                )}
            </Box>

            {previewModal}
        </Box>
    );
};

export default Items;
