export const BASE_URL = "http://192.168.0.119:8080";
// src/config/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.0.119:8080", // Substitua pelo IP do seu servidor backend
});

export default api;
