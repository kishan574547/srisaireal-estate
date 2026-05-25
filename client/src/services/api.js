import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('srisai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('srisai_token');
      localStorage.removeItem('srisai_admin');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────
export const loginAdmin = (email, password) =>
  api.post('/auth/login', { email, password });

export const verifyToken = () => api.get('/auth/verify');

// ─── Properties ──────────────────────────────────────────────
export const getProperties = (params = {}) =>
  api.get('/properties', { params });

export const getProperty = (id) => api.get(`/properties/${id}`);

export const createProperty = (formData) =>
  api.post('/properties', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProperty = (id, formData) =>
  api.put(`/properties/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteProperty = (id) => api.delete(`/properties/${id}`);

export default api;