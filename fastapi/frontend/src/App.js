import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    Button,
    CssBaseline,
    ThemeProvider,
    createTheme,
    useMediaQuery,
    useTheme,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import Rooms from './components/Rooms';
import Containers from './components/Containers';
import Items from './components/Items';
import Lobby from './components/Lobby';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

    const [anchorEl, setAnchorEl] = useState(null);
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Box sx={{ flexGrow: 1 }}>
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                Inventory Management System
                            </Typography>

                            {isMobile ? (
                                <>
                                    <IconButton
                                        edge="end"
                                        color="inherit"
                                        onClick={handleMenuOpen}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                    >
                                        <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                                            Dashboard
                                        </MenuItem>
                                        <MenuItem component={Link} to="/rooms" onClick={handleMenuClose}>
                                            Rooms
                                        </MenuItem>
                                        <MenuItem component={Link} to="/containers" onClick={handleMenuClose}>
                                            Containers
                                        </MenuItem>
                                        <MenuItem component={Link} to="/items" onClick={handleMenuClose}>
                                            Items
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <>
                                    <Button color="inherit" component={Link} to="/">
                                        Dashboard
                                    </Button>
                                    <Button color="inherit" component={Link} to="/rooms">
                                        Rooms
                                    </Button>
                                    <Button color="inherit" component={Link} to="/containers">
                                        Containers
                                    </Button>
                                    <Button color="inherit" component={Link} to="/items">
                                        Items
                                    </Button>
                                </>
                            )}
                        </Toolbar>
                    </AppBar>

                    <Container maxWidth="lg" sx={{ mt: 4 }}>
                        <Routes>
                            <Route path="/" element={<Lobby />} />
                            <Route path="/rooms" element={<Rooms />} />
                            <Route path="/containers" element={<Containers />} />
                            <Route path="/items" element={<Items />} />
                        </Routes>
                    </Container>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;
