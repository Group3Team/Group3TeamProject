import axios from 'axios';

const api = axios.create({
  // Updated to port 8001 to match docker-compose.yml (8001:8000)
  baseURL: 'http://localhost:8001/api', 
  headers: { 'Content-Type': 'application/json' },
});

// Add token if available (Critical for authentication)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getDogs = () => api.get('/dogs/');
export const getWalkRequests = () => api.get('/walk-requests/');
export const getMessages = () => api.get('/messages/');

export default api;