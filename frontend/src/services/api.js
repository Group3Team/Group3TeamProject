import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000/api' });

export const getDogs = () => api.get('/dogs/');
export const getWalkRequests = () => api.get('/walk-requests/');
export const getMessages = () => api.get('/messages/');

export default api;
