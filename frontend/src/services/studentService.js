import apiService from '../utils/apiService';

const studentService = {
    // ...existing code...

    getDashboardStats: async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await apiService.get('/admin/students/dashboard-stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch dashboard stats');
            }

            return response;
        } catch (error) {
            console.error('Dashboard stats error:', error);
            throw error;
        }
    },
    
    // ...existing code...
};

export default studentService;
