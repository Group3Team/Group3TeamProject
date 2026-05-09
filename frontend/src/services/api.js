import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', 
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token if available.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;        // prevent concurrent refresh cycles
const failedQueue = [];          // requests waiting for a new token

// Resolve / reject all queued requests after a successful or failed refresh.
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      // Update the request's Authorization header with the new token and resolve it.
      config.headers.Authorization = `Bearer ${token}`;
      resolve(api.request(config));
    }
  });

  failedQueue.length = 0;
};

// Response interceptor: handle access-token expiration (401).
api.interceptors.response.use(
  (response) => response,                                         // pass through success responses.
  async (error) => {
    const originalRequest = error.config;

    // Only act on 401s that haven't already been retried via refresh.
    if (error.response?.status === 401 && !originalRequest._retried) {
      if (isRefreshing) {
        // Another request is already refreshing — queue this one and wait.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retried = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      try {
        // Use the underlying axios instance directly (not `api`) so that we
        // don't re-trigger this same interceptor during the refresh call.
        const { data } = await axios.post('/api/auth/token/refresh/', {
          refresh: refreshToken,
        });

        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        processQueue(null, data.access);

        // Retry the original failed request with a fresh token.
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api.request(originalRequest);
      } catch (refreshError) {
        // Refresh failed — log the user out and reject all queued requests.
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        processQueue(refreshError, null);

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Non-401 or already-retried — propagate the error.
    return Promise.reject(error);
  },
);

export const getDogs = () => api.get('/dogs/');
export const getWalkRequests = () => api.get('/walk-requests/');
export const getMessages = () => api.get('/messages/');

export default api;
