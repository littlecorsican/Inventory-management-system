import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CircularProgress,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import {
    AddAPhoto as AddAPhotoIcon,
    CategoryOutlined as ItemsIcon,
    Inventory2Outlined as BoxIcon,
    MeetingRoomOutlined as RoomIcon,
    WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';
import { getStats, getItems, getContainers } from '../services/api';
import { useApp } from '../context/AppContext';
import useDebounce from '../hooks/useDebounce';
import useImagePreview from '../hooks/useImagePreview';
import { CardGrid, ContainerCard, EmptyState, ItemCard, SearchField } from '../components/Cards';

const StatTile = ({ icon, label, value, to }) => (
    <Card variant="outlined">
        <CardActionArea component={RouterLink} to={to} sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 0.5, sm: 1.5 }}>
                <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
                <Box>
                    <Typography variant="h5" fontWeight={600} lineHeight={1.1}>{value ?? '–'}</Typography>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                </Box>
            </Stack>
        </CardActionArea>
    </Card>
);

const SearchResults = ({ query }) => {
    const { editItem, editContainer } = useApp();
    const [results, setResults] = useState(null);
    const { openPreview, previewModal } = useImagePreview();

    useEffect(() => {
        let active = true;
        setResults(null);
        Promise.all([getItems({ q: query, limit: 10 }), getContainers({ q: query, limit: 5 })])
            .then(([items, containers]) => active && setResults({ items, containers }))
            .catch(() => active && setResults({ items: { items: [], total: 0 }, containers: { items: [], total: 0 } }));
        return () => { active = false; };
    }, [query]);

    if (!results) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>;

    const { items, containers } = results;
    if (!items.total && !containers.total) {
        return <EmptyState icon={<ItemsIcon />} title={`Nothing found for "${query}"`} />;
    }

    return (
        <Stack spacing={3}>
            {containers.total > 0 && (
                <Box>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Containers ({containers.total})</Typography>
                    <CardGrid>
                        {containers.items.map((c) => <ContainerCard key={c.id} container={c} onEdit={() => editContainer(c)} />)}
                    </CardGrid>
                </Box>
            )}
            {items.total > 0 && (
                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>Items ({items.total})</Typography>
                        {items.total > items.items.length && (
                            <Button size="small" component={RouterLink} to={`/items?q=${encodeURIComponent(query)}`}>See all</Button>
                        )}
                    </Stack>
                    <CardGrid>
                        {items.items.map((i) => <ItemCard key={i.id} item={i} onEdit={() => editItem(i)} onImageClick={openPreview} />)}
                    </CardGrid>
                </Box>
            )}
            {previewModal}
        </Stack>
    );
};

const Dashboard = () => {
    const { version, editItem } = useApp();
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm.trim());
    const { openPreview, previewModal } = useImagePreview();

    useEffect(() => {
        getStats()
            .then((data) => { setStats(data); setError(null); })
            .catch((e) => setError(e.message));
    }, [version]);

    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 2,
                    borderRadius: 3,
                    color: 'primary.contrastText',
                    background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
                }}
            >
                <Typography variant="h5" fontWeight={600}>Where did I put it?</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>
                    Search everything you own, or snap something new.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <SearchField
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search items and containers…"
                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                        size="medium"
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        startIcon={<AddAPhotoIcon />}
                        onClick={() => editItem()}
                        sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                    >
                        Snap item
                    </Button>
                </Stack>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {debouncedSearch ? (
                <SearchResults query={debouncedSearch} />
            ) : (
                <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: { xs: 1, sm: 2 }, mb: 2 }}>
                        <StatTile icon={<ItemsIcon />} label="Items" value={stats?.items} to="/items" />
                        <StatTile icon={<BoxIcon />} label="Containers" value={stats?.containers} to="/containers" />
                        <StatTile icon={<RoomIcon />} label="Rooms" value={stats?.rooms} to="/rooms" />
                    </Box>

                    {stats?.unassigned_items > 0 && (
                        <Alert
                            severity="warning"
                            icon={<WarningIcon />}
                            sx={{ mb: 2 }}
                            action={<Button color="inherit" size="small" component={RouterLink} to="/items?container=none">Fix</Button>}
                        >
                            {stats.unassigned_items} item{stats.unassigned_items === 1 ? ' has' : 's have'} no container
                        </Alert>
                    )}

                    <Typography variant="h6" sx={{ mb: 1 }}>Recently added</Typography>
                    {!stats ? (
                        !error && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
                    ) : stats.recent_items.length ? (
                        <CardGrid>
                            {stats.recent_items.map((item) => (
                                <ItemCard key={item.id} item={item} onEdit={() => editItem(item)} onImageClick={openPreview} />
                            ))}
                        </CardGrid>
                    ) : (
                        <EmptyState icon={<AddAPhotoIcon />} title="Your inventory is empty">
                            <Typography variant="body2">Tap the camera button to add your first item.</Typography>
                        </EmptyState>
                    )}
                </>
            )}

            {previewModal}
        </Box>
    );
};

export default Dashboard;
