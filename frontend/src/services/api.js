import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Auth endpoints must never trigger the refresh flow themselves — doing so
// doubles /api/auth/* hits per failed login (authLimiter 429) and creates
// redirect loops on the login pages.
const AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/register-driver',
  '/auth/refresh-token',
  '/auth/logout',
];

const isAuthEndpoint = (url = '') => {
  const path = String(url).split('?')[0].toLowerCase();
  return AUTH_PATHS.some((p) => path.endsWith(p));
};

const isAuthPage = () => {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname;
  return (
    p === '/login' ||
    p === '/signup' ||
    p.startsWith('/driver/login') ||
    p.startsWith('/driver/register') ||
    p.startsWith('/driver/continue')
  );
};

const clearAuthState = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  delete api.defaults.headers.common.Authorization;
};

const redirectToLoginIfNeeded = () => {
  if (typeof window === 'undefined') return;
  // Never force-reload auth pages (login 401 would loop) and never yank
  // public browsing into /login on a background 401 — route guards handle it.
  if (isAuthPage()) return;
  const p = window.location.pathname;
  const isProtected = p.startsWith('/admin') || p.startsWith('/driver') || p.startsWith('/customer');
  if (isProtected) window.location.href = '/login';
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Never retry rate-limited (429) or auth-endpoint 401s — each retry
    // burns authLimiter budget and turns one submit into many requests.
    if (!originalRequest || status === 429 || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        clearAuthState();
        redirectToLoginIfNeeded();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh-token`, {
          refreshToken,
        });

        if (data.success) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          processQueue(null, data.accessToken);
          return api(originalRequest);
        }

        // Server responded 200 but success=false — treat as auth failure
        processQueue(new Error(data.message || 'Token refresh failed'), null);
        clearAuthState();
        redirectToLoginIfNeeded();
        return Promise.reject(new Error(data.message || 'Token refresh failed'));
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Stale tokens after browser close/reopen must not linger.
        clearAuthState();
        redirectToLoginIfNeeded();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
