import axios from 'axios';

export const API_BASE_URL = 'https://backend-production-a762.up.railway.app';

export const MESSAGE_ENDPOINTS = {
  SETTINGS: `${API_BASE_URL}/admin/settings/messages`,
  TEMPLATES: `${API_BASE_URL}/admin/settings/message-templates`,
  HISTORY: `${API_BASE_URL}/admin/messages/history`,
  SEND: `${API_BASE_URL}/admin/messages/send`,
  SCHEDULE: `${API_BASE_URL}/admin/messages/schedule`
};

export const API_ENDPOINTS = {
  NOTICES: '/api/notices',
  EVENTS: '/api/events',
  GALLERY: '/api/media/gallery',
  CONTACT: '/api/contact'
};

const api = axios.create({
    baseURL: 'https://backend-production-a762.up.railway.app',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
    timeout: 10000 // Add timeout
});

// Debug interceptor
api.interceptors.request.use(request => {
    console.log('API Request:', {
        url: request.url,
        method: request.method,
        headers: request.headers
    });
    return request;
});

// Add request interceptor to inject token
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    async error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
