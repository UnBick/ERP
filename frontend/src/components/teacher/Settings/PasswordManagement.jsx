// src/components/teacher/Settings/PasswordManagement.jsx
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
  FormHelperText,
  Grid,
  Card,
  CardContent,
} from '@mui/material';

const PasswordManagement = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setAlert({
        severity: 'error',
        message: 'New password and confirm password do not match'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/teacher/settings/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      setAlert({
        severity: 'success',
        message: 'Password updated successfully'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Error updating password'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordStrength(calculatePasswordStrength(e.target.value));
              }}
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handlePasswordUpdate} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Update Password'}
              </Button>
            </Box>

            {alert && (
              <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
                <Alert onClose={() => setAlert(null)} severity={alert.severity}>
                  {alert.message}
                </Alert>
              </Snackbar>
            )}
          </Paper>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption">Password Strength</Typography>
            <LinearProgress 
              variant="determinate" 
              value={passwordStrength}
              color={passwordStrength > 75 ? "success" : "warning"}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Security Settings</Typography>
              {/* Add 2FA and security options */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PasswordManagement;