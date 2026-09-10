import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

let inMemoryToken: string | null = null;

api.interceptors.request.use((config) => {
  if (inMemoryToken) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register') && path !== '/') {
        inMemoryToken = null;
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    // Session without credentials (e.g. deactivated/deleted account whose JWT no
    // longer authenticates) surfaces as a body-less 403 from the backend. Treat it
    // as a dead session. Domain denials (IDOR) carry an ErrorResponse message and
    // must NOT log the user out.
    if (error.response?.status === 403 && !error.response?.data?.message) {
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/register') && path !== '/') {
        inMemoryToken = null;
        window.dispatchEvent(new CustomEvent('auth:forbidden'));
      }
    }
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    return Promise.reject(error);
  }
);

export function setApiToken(token: string | null) {
  inMemoryToken = token;
}

/** Backend paginated wrapper (Spring Data Page). */
export interface PageWrapper<T> {
  content: T[];
}

/** Accept either a plain array (legacy) or a Spring Page and always return the items. */
export function unwrapPage<T>(data: T[] | PageWrapper<T> | null | undefined): T[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.content ?? []);
}

export default api;
