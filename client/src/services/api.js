// src/services/api.js
import axios from "axios";
import { BACKEND_URL } from "../config/api";

const api = axios.create({
  baseURL: BACKEND_URL,  // 👈 your backend URL
  withCredentials: true,             // 👈 ensures cookies (JWT token) are sent
});

export default api;
