import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getApiUrl } from '../../config/apiConfig';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/v1/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user data
      await login(data.data.user, data.data.token);

      // Redirect based on role
      switch (data.data.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'parent':
          navigate('/parent/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      setError(error.message || 'Login failed');
    }
  };

  // ... rest of component (render method, etc.)
};
