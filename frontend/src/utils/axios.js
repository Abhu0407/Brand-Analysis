// frontend/src/utils/axios.js
import axios from 'axios';

// Use proxy in development, direct URL in production
// Works with both Vite and Create React App
const isDev = typeof import.meta !== 'undefined' 
  ? import.meta.env.DEV 
  : process.env.NODE_ENV === 'development';
  
const baseURL = isDev
  ? '/api'  // Use proxy in development
  : 'http://localhost:4000/api';  // Direct URL in production

// Create axios instance with base URL
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

