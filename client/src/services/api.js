import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getProperties = () =>
  API.get('/properties');

export const createProperty = (data) =>
  API.post('/properties', data);

export const updateProperty = (id, data) =>
  API.put(`/properties/${id}`, data);

export const deleteProperty = (id) =>
  API.delete(`/properties/${id}`);

export default API;