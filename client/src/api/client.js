import axios from 'axios';

// In production (Render), REACT_APP_API_URL points to the backend.
// In local dev, the proxy in package.json handles it (no baseURL needed).
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || ''
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
