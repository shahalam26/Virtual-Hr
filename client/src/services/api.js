// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",  // 👈 your backend URL
  withCredentials: true,             // 👈 ensures cookies (JWT token) are sent
});

export default api;
