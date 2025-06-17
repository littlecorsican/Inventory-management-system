import React from 'react';
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
} from '@mui/material';
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
                            <Button color="inherit" component={Link} to="/">
                                Rooms
                            </Button>
                            <Button color="inherit" component={Link} to="/containers">
                                Containers
                            </Button>
                            <Button color="inherit" component={Link} to="/items">
                                Items
                            </Button>
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
