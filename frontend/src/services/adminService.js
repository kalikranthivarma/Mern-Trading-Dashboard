import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/admin` : "http://localhost:5000/api/admin";

// Use a separate axios instance for admin calls if needed
const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const loginAdmin = async (email, password) => {
  const response = await adminApi.post("/login", { email, password });
  return response.data;
};

export const logoutAdmin = async () => {
  const response = await adminApi.post("/logout");
  return response.data;
};

export const createAdmin = async (adminData, token) => {
  const response = await adminApi.post("/create", adminData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getDashboardStats = async (token) => {
  const response = await adminApi.get("/dashboard", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getUsers = async (token) => {
  const response = await adminApi.get("/users", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const suspendUser = async (userId, token) => {
  const response = await adminApi.patch(`/users/${userId}/suspend`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const activateUser = async (userId, token) => {
  const response = await adminApi.patch(`/users/${userId}/activate`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAssets = async (token) => {
  const response = await adminApi.get("/assets", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getTransactions = async (token) => {
  const response = await adminApi.get("/transactions", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAnalytics = async (token) => {
  const response = await adminApi.get("/analytics", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateMarketStatus = async (status, token) => {
  const response = await adminApi.patch(`/market/${status}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getOrders = async (token) => {
  const response = await adminApi.get("/orders", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const cancelOrder = async (orderId, token) => {
  const response = await adminApi.patch(`/orders/${orderId}/cancel`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSettings = async (token) => {
  const response = await adminApi.get("/settings", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getAdminNotifications = async (token) => {
  const response = await adminApi.get("/notifications", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createGlobalNotification = async (data, token) => {
  const response = await adminApi.post("/notifications", data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getWithdrawals = async (token) => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/withdrawals/admin/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const processWithdrawal = async (id, action, remarks, token) => {
  const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/withdrawals/admin/${id}/${action}`, { remarks }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
