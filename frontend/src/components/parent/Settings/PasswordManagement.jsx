// src/components/parent/Settings/PasswordManagement.jsx
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
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
} from '@mui/material';
import { Security, History } from '@mui/icons-material';
import { getApiUrl } from '../../../config/apiConfig';


const PasswordManagement = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [securityOptions, setSecurityOptions] = useState({
    twoFactorAuth: false,
    passwordExpiry: false,
    strongPassword: true,
  });

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setAlert('New password and confirm password do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/v1/parent/updatePassword'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update password');
      }

      setAlert('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setAlert('Error updating password');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password),
    };
    return requirements;
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
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
              onChange={(e) => setNewPassword(e.target.value)}
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
                <Alert onClose={() => setAlert(null)} severity="error">
                  {alert}
                </Alert>
              </Snackbar>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Security Options
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={securityOptions.twoFactorAuth}
                  onChange={(e) => setSecurityOptions(prev => ({
                    ...prev,
                    twoFactorAuth: e.target.checked
                  }))}
                />
              }
              label="Enable Two-Factor Authentication"
            />
            {/* Add more security options */}
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Password History
            </Typography>
            {/* Add password history list */}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PasswordManagement;