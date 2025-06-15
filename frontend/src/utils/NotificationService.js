import { toast } from 'react-toastify';

const NotificationService = {
  success: (message) => {
    toast.success(message);
  },
  
  error: (message) => {
    toast.error(message);
  },
  
  info: (message) => {
    toast.info(message);
  }
};

export default NotificationService;
