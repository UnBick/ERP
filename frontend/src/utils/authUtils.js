export const handleUnauthorized = () => {
  // Clear token and redirect to login
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
}); 