const axios = require('axios');

class ApiService {
    constructor() {
        this.baseURL = process.env.API_BASE_URL || 'http://localhost:5000/api';
        this.axios = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor
        this.axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Update response interceptor
        this.axios.interceptors.response.use(
            (response) => {
                // Ensure response.data exists and is properly formatted
                if (!response.data) {
                    return { success: true, data: null };
                }
                return response.data;
            },
            (error) => {
                let errorResponse = {
                    success: false,
                    message: 'An unexpected error occurred',
                    data: null
                };

                if (error.response) {
                    // Server responded with error
                    errorResponse = {
                        success: false,
                        message: error.response.data.message || 'Server error',
                        data: error.response.data.data || null,
                        error: error.response.data.error || null
                    };

                    if (error.response.status === 401) {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }
                } else if (error.request) {
                    errorResponse.message = 'Network error occurred. Please check your connection.';
                }

                return Promise.reject(errorResponse);
            }
        );
    }

    // Generic API methods
    async get(endpoint, params = {}) {
        try {
            return await this.axios.get(endpoint, { params });
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async post(endpoint, data = {}) {
        try {
            return await this.axios.post(endpoint, data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async put(endpoint, data = {}) {
        try {
            return await this.axios.put(endpoint, data);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async delete(endpoint) {
        try {
            return await this.axios.delete(endpoint);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Update error handler
    handleError(error) {
        console.error('API Error:', error);
        return {
            success: false,
            message: error.message || 'An error occurred',
            data: null,
            error: error
        };
    }

    // Specific API endpoints
    auth = {
        login: (credentials) => this.post('/auth/login', credentials),
        register: (userData) => this.post('/auth/register', userData),
        logout: () => this.post('/auth/logout')
    };

    admin = {
        dashboard: {
            getStats: () => this.get('/admin/dashboard/stats'),
            getRecentActivity: () => this.get('/admin/dashboard/activity')
        },
        students: {
            getAll: (params) => this.get('/admin/students', params),
            getById: (id) => this.get(`/admin/students/${id}`),
            create: (data) => this.post('/admin/students', data),
            update: (id, data) => this.put(`/admin/students/${id}`, data),
            delete: (id) => this.delete(`/admin/students/${id}`)
        },
        staff: {
            getAll: (params) => this.get('/admin/staff', params),
            getById: (id) => this.get(`/admin/staff/${id}`),
            create: (data) => this.post('/admin/staff', data),
            update: (id, data) => this.put(`/admin/staff/${id}`, data),
            delete: (id) => this.delete(`/admin/staff/${id}`)
        }
        // Add more endpoints as needed
    };
}

module.exports = new ApiService();
