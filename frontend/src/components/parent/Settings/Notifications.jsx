// src/components/parent/Settings/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Snackbar, Alert } from '@mui/material';

const Notifications = () => {
  const [notifications, setNotifications] = useState({ email: '', sms: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parent/notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      setAlert('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/parent/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifications),
      });

      if (!response.ok) {
        throw new Error('Failed to save notifications');
      }

      setAlert('Notifications settings saved successfully');
    } catch (error) {
      setAlert('Error saving notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Notifications Settings
        </Typography>

        <TextField
          fullWidth
          label="Email Notifications"
          value={notifications.email}
          onChange={(e) => setNotifications({ ...notifications, email: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="SMS Notifications"
          value={notifications.sms}
          onChange={(e) => setNotifications({ ...notifications, sms: e.target.value })}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </Box>

        {alert && (
          <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert onClose={() => setAlert(null)} severity={alert === 'Notifications settings saved successfully' ? 'success' : 'error'}>
              {alert}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default Notifications;