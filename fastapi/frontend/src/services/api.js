import { http } from '../utils/request'

const baseHost = process.env.REACT_APP_BACKEND_URL;

// Rooms
export const getAllRooms = async () => {
    http.get(`${baseHost}/rooms/`)
    return [];
};

export const getRoomById = async (id) => {
    http.get(`${baseHost}/rooms/${id}`)
    return null;
};

export const createRoom = async (roomData) => {
    http.post(`${baseHost}/rooms/`)
    return null;
};

export const updateRoom = async (id, roomData) => {
    // TODO: Implement API call
    return null;
};

export const deleteRoom = async (id) => {
    // TODO: Implement API call
    return null;
};

// Containers
export const getAllContainers = async () => {
    // TODO: Implement API call
    return [];
};

export const getContainerById = async (id) => {
    // TODO: Implement API call
    return null;
};

export const createContainer = async (containerData) => {
    // TODO: Implement API call
    return null;
};

export const updateContainer = async (id, containerData) => {
    // TODO: Implement API call
    return null;
};

export const deleteContainer = async (id) => {
    // TODO: Implement API call
    return null;
};

// Items
export const getAllItems = async () => {
    // TODO: Implement API call
    return [];
};

export const getItemById = async (id) => {
    // TODO: Implement API call
    return null;
};

export const createItem = async (itemData) => {
    // TODO: Implement API call
    return null;
};

export const updateItem = async (id, itemData) => {
    // TODO: Implement API call
    return null;
};

export const deleteItem = async (id) => {
    // TODO: Implement API call
    return null;
}; 