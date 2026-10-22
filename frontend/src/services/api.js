import axios from 'axios';

// Create custom axios instance
const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to map route and method to action name
function getClientActionName(method, url) {
  const m = (method || 'GET').toUpperCase();
  const u = (url || '').toLowerCase();
  if (u.includes('/auth/login')) return '🔐 Login';
  if (u.includes('/auth/signup') || u.includes('/auth/register')) return '🔑 Sign Up';
  if (u.includes('/auth/refresh')) return '🔄 Refresh Token';
  if (u.includes('/auth/forgot-password')) return '📩 Forgot Password';
  if (u.includes('/auth/reset-password')) return '🔒 Reset Password';
  if (u.includes('/auth/logout')) return '🚪 Logout';
  if (u.includes('/auth/me')) return '👤 Fetch Profile';
  if (u.includes('/todos')) {
    if (m === 'POST') return '➕ Add Todo';
    if (m === 'PUT') return '✏️ Update Todo';
    if (m === 'DELETE') return '🗑️ Delete Todo';
    if (m === 'GET') return '📋 Fetch Todos';
  }
  return `${m} ${url}`;
}

// Request interceptor: attach accessToken from localStorage and log
api.interceptors.request.use(
  (config) => {
    config._startTime = performance.now();
    const action = getClientActionName(config.method, config.url);
    console.log(
      `%c🚀 [API HIT] %c${(config.method || 'GET').toUpperCase()} ${config.url} %c(${action})`,
      'background: #2563eb; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
      'color: #0284c7; font-weight: bold;',
      'color: #64748b; font-style: italic;',
      config.data || ''
    );

    const token = localStorage.getItem('taskflow_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token expiration and automatic refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    const duration = response.config._startTime
      ? Math.round(performance.now() - response.config._startTime)
      : null;
    const action = getClientActionName(response.config.method, response.config.url);
    console.log(
      `%c✅ [API ${response.status}] %c${(response.config.method || 'GET').toUpperCase()} ${response.config.url} %c(${action} • ${duration}ms)`,
      'background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
      'color: #059669; font-weight: bold;',
      'color: #64748b;'
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/v1/auth/login') &&
      !originalRequest.url?.includes('/api/v1/auth/signup') &&
      !originalRequest.url?.includes('/api/v1/auth/refresh')
    ) {
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

      const refreshToken = localStorage.getItem('taskflow_refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        // No refresh token, trigger logout event
        window.dispatchEvent(
          new CustomEvent('auth:session_expired', {
            detail: { reason: 'No refresh token available. Please log in.' },
          })
        );
        return Promise.reject(error);
      }

      try {
        const response = await axios.post('/api/v1/auth/refresh', {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('taskflow_access_token', accessToken);

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        // Refresh token failed or expired (> 2 days)
        localStorage.removeItem('taskflow_access_token');
        localStorage.removeItem('taskflow_refresh_token');
        localStorage.removeItem('taskflow_user');

        window.dispatchEvent(
          new CustomEvent('auth:session_expired', {
            detail: { reason: 'Session expired after 2 days. Please log in again.' },
          })
        );

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
