class ApiService {
    constructor() {
        this.axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.axios.interceptors.response.use(
            (response) => response.data,
            (error) => {
                if (error.response?.status === 401) {
                    // Clear tokens and redirect to login
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    window.location.href = '/login';
                    return Promise.reject({ message: 'Session expired. Please login again.' });
                }
                return Promise.reject(error.response?.data || error);
            }
        );
    }

  static async getNotices() {
    const response = await fetch('/api/notices');
    const data = await response.json();
    return Array.isArray(data) ? data : 
           Array.isArray(data.notices) ? data.notices : [];
  }

  static async getEvents() {
    const response = await fetch('/api/events');
    const data = await response.json();
    return Array.isArray(data) ? data : 
           Array.isArray(data.events) ? data.events : [];
  }

  static async getGalleryImages() {
    const response = await fetch('/api/media/gallery');
    const data = await response.json();
    return Array.isArray(data) ? data : 
           Array.isArray(data.images) ? data.images : [];
  }
}

export default ApiService;
