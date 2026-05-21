import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
});

api.interceptors.request.use((config) => {
  // Log the exact URL being requested for debugging
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
