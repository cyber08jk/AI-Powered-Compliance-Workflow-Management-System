import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    getUsers: () => api.get('/auth/users'),
    createUser: (data) => api.post('/auth/users', data),
};

// Issues
export const issueService = {
    getAll: (params) => api.get('/issues', { params }),
    getById: (id) => api.get(`/issues/${id}`),
    create: (data) => api.post('/issues', data),
    update: (id, data) => api.put(`/issues/${id}`, data),
    transition: (id, newStatus) => api.patch(`/issues/${id}/transition`, { newStatus }),
    delete: (id) => api.delete(`/issues/${id}`),
};

// Workflows
export const workflowService = {
    getAll: () => api.get('/workflows'),
    getById: (id) => api.get(`/workflows/${id}`),
    create: (data) => api.post('/workflows', data),
    update: (id, data) => api.put(`/workflows/${id}`, data),
    delete: (id) => api.delete(`/workflows/${id}`),
};

// Audit
export const auditService = {
    getAll: (params) => api.get('/audit', { params }),
    getEntityLogs: (entity, entityId) => api.get(`/audit/entity/${entity}/${entityId}`),
};

// AI
export const aiService = {
    generateSummary: (issueId) => api.post(`/ai/summarize/${issueId}`),
    getSummaries: (issueId) => api.get(`/ai/summaries/${issueId}`),
};

// Dashboard
export const dashboardService = {
    getStats: () => api.get('/dashboard'),
};

export default api;
