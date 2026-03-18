// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token if exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle common errors (401, 403, network issues, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized → logout or redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login'; // or use navigate if in component
      // You can also dispatch a global logout event if using context
    }

    // Handle 403 Forbidden (e.g. wrong role)
    if (error.response?.status === 403) {
      console.warn('Access forbidden:', error.response?.data?.message);
      // Optionally show toast: "You don't have permission"
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - backend may be down');
      // Optionally show toast: "No internet connection or server unreachable"
    }

    // Return error so the component can handle it (show error message, etc.)
    return Promise.reject(error);
  }
);

// Optional: helper functions for common requests (you can remove or expand)
export const get = (url, config = {}) => api.get(url, config);
export const post = (url, data, config = {}) => api.post(url, data, config);
export const put = (url, data, config = {}) => api.put(url, data, config);
export const patch = (url, data, config = {}) => api.patch(url, data, config);
export const del = (url, config = {}) => api.delete(url, config);

// For file uploads (multipart/form-data)
export const uploadFile = (url, formData, onUploadProgress) =>
  api.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

export { api };
export default api;