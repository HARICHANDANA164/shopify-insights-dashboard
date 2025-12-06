import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
client.interceptors.request.use(
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

// Response interceptor to handle auth errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if we're not already on login/signup pages
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup' && currentPath !== '/forgot-password' && currentPath !== '/reset-password') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    // Log network errors for debugging
    if (!error.response) {
      console.error('Network error:', error.message);
      console.error('API URL:', API_URL);
    }
    
    return Promise.reject(error);
  }
);

export default client;

