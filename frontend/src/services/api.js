import { http } from '../utils/request'
import { compressImage } from '../utils/image'

// Big enough to fill dropdowns / pickers in one go
const ALL = { limit: 1000 };

// Stats
export const getStats = () => http.get(`/stats/`);

// Rooms
export const getAllRooms = () => http.get(`/rooms/`, ALL);
export const getRoomById = (id) => http.get(`/rooms/${id}`);
export const createRoom = (roomData) => http.post(`/rooms/`, roomData);
export const updateRoom = (id, roomData) => http.put(`/rooms/${id}`, roomData);
export const deleteRoom = (id) => http.delete(`/rooms/${id}`);

// Containers
// params: { q, room_id, skip, limit }
export const getContainers = (params) => http.get(`/containers/`, params);
export const getAllContainers = () => http.get(`/containers/`, ALL);
export const getContainerById = (id) => http.get(`/containers/${id}`);
export const createContainer = (containerData) => http.post(`/containers/`, containerData);
export const updateContainer = (id, containerData) => http.put(`/containers/${id}`, containerData);
export const deleteContainer = (id) => http.delete(`/containers/${id}`);

// Items
// params: { q, container_id, unassigned, skip, limit }
export const getItems = (params) => http.get(`/items/`, params);
export const getItemById = (id) => http.get(`/items/${id}`);
export const createItem = (itemData) => http.post(`/items/`, itemData);
export const updateItem = (id, itemData) => http.put(`/items/${id}`, itemData);
export const deleteItem = (id) => http.delete(`/items/${id}`);

// Images
export const uploadImage = async (fileData) => {
    const formData = new FormData();
    const file = await compressImage(fileData);
    formData.append("file", file, file.name || "photo.jpg");
    return http.post(`/image/uploadImage`, formData);
};

/**
 * The ImagePicker value is either an existing path (string), a new File/Blob, or null.
 * Upload if needed and return the path to store on the record.
 */
export const resolveImagePath = async (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    const { saved_path } = await uploadImage(value);
    return saved_path;
};
