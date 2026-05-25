import axios from "axios";

const API = axios.create({
  baseURL: "https://srisaireal-estate.onrender.com/api",
});

export const getProperties = (params) =>
  API.get("/properties", { params });

export const createProperty = (data) =>
  API.post("/properties", data);

export const updateProperty = (id, data) =>
  API.put(`/properties/${id}`, data);

export const deleteProperty = (id) =>
  API.delete(`/properties/${id}`);

export default API;