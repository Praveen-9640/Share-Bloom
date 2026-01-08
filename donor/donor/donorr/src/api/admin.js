// src/api/admin.js
import axios from "axios";

const API_BASE = "http://localhost:5001/api"; // update if your backend base differs

// create an axios instance that will attach JWT from localStorage
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Users
export const fetchUsers = ({ page = 1, perPage = 20, q = "" } = {}) =>
  api.get("/admin/users", { params: { page, perPage, q } });

export const updateUserRole = (userId, role) =>
  api.put(`/admin/users/${userId}/role`, { role });

export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

// Stats & reports
export const fetchStats = () => api.get("/admin/stats");
export const fetchReports = ({ limit = 50 } = {}) =>
  api.get("/admin/reports", { params: { limit } });

export default api;
