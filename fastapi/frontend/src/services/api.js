import { http } from '../utils/request'

const baseHost = process.env.REACT_APP_BACKEND_URL;

// Rooms
export const getAllRooms = async () => {
    const data = await http.get(`/rooms`)
    return data || [];
};

export const getRoomById = async (id) => {
    const data = await http.get(`/rooms/${id}`)
    return data || [];
};

export const createRoom = async (roomData) => {
    console.log("roomData", roomData)
    const data = await http.post(`/rooms`, roomData)
    return data ;
};

export const updateRoom = async (id, roomData) => {
    const data = await http.put(`/rooms/${id}`, roomData)
    return data;
};

export const deleteRoom = async (id) => {
    const data = await http.delete(`/rooms/${id}`)
    return data;
};

// Containers
export const getAllContainers = async () => {
    const data = await http.get(`/containers`)
    return data;
};

export const getContainerById = async (id) => {
    const data = await http.get(`/containers/${id}`)
    return data;
};

export const createContainer = async (containerData) => {
    const data = await http.post(`/containers`, containerData)
    return data;
};

export const updateContainer = async (id, containerData) => {
    const data = await http.put(`/containers/${id}`, containerData)
    return data;
};

export const deleteContainer = async (id) => {
    const data = await http.delete(`/containers/${id}`)
    return data;
};

// Items
export const getAllItems = async () => {
    const data = await http.get(`/items`)
    return data;
};

export const getItemById = async (id) => {
    const data = await http.get(`/items/${id}`)
    return data;
};

export const createItem = async (itemData) => {
    const data = await http.post(`/items`, itemData)
    return data;
};

export const updateItem = async (id, itemData) => {
    const data = await http.put(`/items/${id}`, itemData)
    return data;
};

export const deleteItem = async (id) => {
    const data = await http.delete(`/items/${id}`)
    return data;
}; 