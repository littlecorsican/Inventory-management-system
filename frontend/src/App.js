import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    Button,
    CssBaseline,
    CircularProgress,
    Fab,
    Paper,
    BottomNavigation,
    BottomNavigationAction,
    ThemeProvider,
    createTheme,
    responsiveFontSizes,
    useMediaQuery,
} from '@mui/material';
import {
    AddAPhoto as AddAPhotoIcon,
    CategoryOutlined as ItemsIcon,
    HomeOutlined as HomeIcon,
    Inventory2Outlined as BoxIcon,
    MeetingRoomOutlined as RoomIcon,
} from '@mui/icons-material';

import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Containers from './pages/Containers';
import ContainerDetail from './pages/ContainerDetail';
import { EmptyState } from './components/Cards';

// The 3D view pulls in three.js, so only download it when the Rooms page is opened
const Rooms = lazy(() => import('./pages/Rooms'));

const theme = responsiveFontSizes(createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#ff7043',
            contrastText: '#fff',
        },
        background: {
            default: '#f5f7fa',
        },
    },
    shape: {
        borderRadius: 10,
    },
    components: {
        MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
        MuiCard: { defaultProps: { variant: 'outlined' } },
    },
}));

const NAV = [
    { label: 'Home', to: '/', icon: <HomeIcon /> },
    { label: 'Items', to: '/items', icon: <ItemsIcon /> },
    { label: 'Containers', to: '/containers', icon: <BoxIcon /> },
    { label: 'Rooms', to: '/rooms', icon: <RoomIcon /> },
];

// Which nav entry is active for the current URL (e.g. /containers/3 -> Containers)
const useActiveNav = () => {
    const { pathname } = useLocation();
    const match = NAV.slice(1).find((n) => pathname.startsWith(n.to));
    return match ? match.to : '/';
};

const Shell = () => {
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const active = useActiveNav();
    const { editItem } = useApp();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="sticky" elevation={0} sx={{ pt: 'env(safe-area-inset-top)' }}>
                <Toolbar>
                    <BoxIcon sx={{ mr: 1 }} />
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', fontWeight: 600 }}
                        noWrap
                    >
                        Home Inventory
                    </Typography>

                    {!isMobile && NAV.map((n) => (
                        <Button
                            key={n.to}
                            color="inherit"
                            component={Link}
                            to={n.to}
                            startIcon={n.icon}
                            sx={{ opacity: active === n.to ? 1 : 0.75, borderBottom: active === n.to ? '2px solid' : '2px solid transparent', borderRadius: 0 }}
                        >
                            {n.label}
                        </Button>
                    ))}
                </Toolbar>
            </AppBar>

            <Container
                maxWidth="lg"
                sx={{
                    pt: { xs: 2, sm: 3 },
                    // leave room for the bottom nav + floating button on phones
                    pb: isMobile ? 'calc(140px + env(safe-area-inset-bottom))' : 6,
                }}
            >
                <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/items" element={<Items />} />
                        <Route path="/containers" element={<Containers />} />
                        <Route path="/containers/:id" element={<ContainerDetail />} />
                        <Route path="/rooms" element={<Rooms />} />
                        <Route path="*" element={<EmptyState title="Page not found"><Button component={Link} to="/">Go home</Button></EmptyState>} />
                    </Routes>
                </Suspense>
            </Container>

            {/* Quick "snap an item" button, always reachable with a thumb */}
            <Fab
                color="secondary"
                aria-label="add item"
                onClick={() => editItem()}
                variant={isMobile ? 'circular' : 'extended'}
                sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    position: 'fixed',
                    right: 'calc(16px + env(safe-area-inset-right))',
                    bottom: isMobile ? 'calc(72px + env(safe-area-inset-bottom))' : 24,
                }}
            >
                <AddAPhotoIcon sx={{ mr: isMobile ? 0 : 1 }} />
                {!isMobile && 'Add item'}
            </Fab>

            {isMobile && (
                <Paper
                    elevation={8}
                    sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, pb: 'env(safe-area-inset-bottom)', zIndex: (t) => t.zIndex.appBar }}
                >
                    <BottomNavigation showLabels value={active}>
                        {NAV.map((n) => (
                            <BottomNavigationAction key={n.to} label={n.label} value={n.to} icon={n.icon} component={Link} to={n.to} />
                        ))}
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    );
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppProvider>
                    <Shell />
                </AppProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;
