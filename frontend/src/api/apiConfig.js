export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return { 'Content-Type': 'application/json' };
    }

    // Always ensure clean token format
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    return {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
    };
};

export const makeAuthenticatedRequest = async (url, options = {}) => {
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
        throw new Error('No authentication token available');
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        throw new Error(`Request failed: ${response.statusText}`);
    }

    return response.json();
};
