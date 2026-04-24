import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Matches Django ROOT_URLCONF + path('api/', ...)
  headers: { 'Content-Type': 'application/json' },
});

// Add token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getDogs = () => api.get('/dogs/');
export const getWalkRequests = () => api.get('/walk-requests/');
export const getMessages = () => api.get('/messages/');
export default api;