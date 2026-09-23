import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://srisaireal-estate.onrender.com/api',
});

// Attach Authorization token to all requests when logged in
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('srisai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration/unauthorized errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // If unauthorized on admin actions, clear invalid token
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('srisai_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const loginAdmin = (credentials) =>
  API.post('/auth/login', credentials);

export const verifyAdmin = () =>
  API.get('/auth/verify');

export const getProperties = (params = {}) =>
  API.get('/properties', { params });

export const getPropertyById = (id) =>
  API.get(`/properties/${id}`);

export const createProperty = (data) =>
  API.post('/properties', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const updateProperty = (id, data) =>
  API.put(`/properties/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const deleteProperty = (id) =>
  API.delete(`/properties/${id}`);

export default API;