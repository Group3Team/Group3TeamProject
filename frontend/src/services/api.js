import axios from 'axios';

const api = axios.create({
  // Updated to port 8001 with fallback for development
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
  
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