import { toast } from 'react-toastify';

export const handleError = (error, customMessage = null) => {
  const message = 
    customMessage || 
    error.response?.data?.message || 
    error.message || 
    'An unexpected error occurred';

  toast.error(message);
  
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error);
  }
  
  return {
    error: true,
    message
  };
};
