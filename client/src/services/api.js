import axios from 'axios';

const API = axios.create({
  baseURL: 'https://srisaireal-estate.onrender.com/api',
});

export const loginAdmin = (credentials) =>
  API.post('/auth/login', credentials);

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