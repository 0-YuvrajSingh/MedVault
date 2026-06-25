import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject token from memory
api.interceptors.request.use((config) => {
  const token = (window as any).__MEDVAULT_TOKEN__;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register') && path !== '/') {
        delete (window as any).__MEDVAULT_TOKEN__;
        window.location.href = '/login';
      }
    }
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

export function setApiToken(token: string | null) {
  if (token) {
    (window as any).__MEDVAULT_TOKEN__ = token;
  } else {
    delete (window as any).__MEDVAULT_TOKEN__;
  }
}

export default api;
