// src/components/student/Settings/PasswordManagement.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  LinearProgress,
} from '@mui/material';

const PasswordManagement = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    severity: 'info',
    message: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleNewPasswordChange = (e) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    setPasswordStrength(calculatePasswordStrength(newPass));
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'Passwords do not match'
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/student/settings/security/password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      setAlert({
        show: true,
        severity: response.ok ? 'success' : 'error',
        message: data.message
      });

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStrength(0);
      }
    } catch (error) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'Error updating password'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Password Management
        </Typography>

        <TextField
          fullWidth
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={newPassword}
          onChange={handleNewPasswordChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption">Password Strength</Typography>
          <LinearProgress 
            variant="determinate" 
            value={passwordStrength}
            color={passwordStrength > 75 ? "success" : passwordStrength > 50 ? "warning" : "error"}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handlePasswordUpdate} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Update Password'}
          </Button>
        </Box>

        <Snackbar 
          open={alert.show} 
          autoHideDuration={6000} 
          onClose={() => setAlert({ ...alert, show: false })}
        >
          <Alert 
            onClose={() => setAlert({ ...alert, show: false })} 
            severity={alert.severity}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default PasswordManagement;