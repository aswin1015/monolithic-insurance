import axios from 'axios';

const BASE_URL = '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '#/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ── Policies ──────────────────────────────────────────────────────
export const policiesAPI = {
  getAll: () => api.get('/policies'),
  getByType: (type) => api.get(`/policies/type/${type}`),
  getById: (id) => api.get(`/policies/${id}`),
};

// ── Claims ────────────────────────────────────────────────────────
export const claimsAPI = {
  submit: (formData) => api.post('/claims', formData),
  getMy: () => api.get('/claims/my'),
  getById: (id) => api.get(`/claims/${id}`),
};

// ── Admin ─────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getClaims: (params) => api.get('/admin/claims', { params }),
  updateClaim: (id, data) => api.patch(`/admin/claims/${id}`, data),
  getUsers: () => api.get('/admin/users'),
};

export default api;
