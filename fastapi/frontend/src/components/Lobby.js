import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    IconButton,
    Grid,
    TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Modal from './Modal';
import { getAllRooms, createRoom, updateRoom, deleteRoom } from '../services/api';

const Lobby = () => {
    

    return (
        <Box sx={{ p: 3 }}>
          <h1>Dashboard</h1>
          {/* TODO 
           number of items
           number of boxes
           number of rooms
           search item
           search container
           search rooms
           items added in the last x days
           last registered item
          
          */}
        </Box>
    );
};

export default Lobby; 