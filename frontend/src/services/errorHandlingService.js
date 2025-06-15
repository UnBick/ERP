export const handleApiError = (error, enqueueSnackbar) => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || error.message || 'An error occurred';
    enqueueSnackbar(message, { variant: 'error' });
};
