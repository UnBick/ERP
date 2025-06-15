// src/components/teacher/Settings/Notifications.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
} from '@mui/material';

const Notifications = () => {
  const [notifications, setNotifications] = useState({
    email: false,
    sms: false,
    push: false,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [notificationTypes, setNotificationTypes] = useState({
    assignments: {
      enabled: true,
      email: true,
      push: false,
      frequency: 'immediate'
    },
    attendance: {
      enabled: true,
      email: true,
      push: true,
      frequency: 'daily'
    },
    // Add more notification types
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/teacher/notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      setAlert('Error fetching notifications settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/teacher/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notifications),
      });

      if (!response.ok) {
        throw new Error('Failed to update notifications settings');
      }

      setAlert('Notifications settings updated successfully');
    } catch (error) {
      setAlert('Error updating notifications settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    setNotifications({
      ...notifications,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>
              Notifications Settings
            </Typography>

            <FormControlLabel
              control={<Switch checked={notifications.email} onChange={handleChange} name="email" />}
              label="Email Notifications"
            />
            <FormControlLabel
              control={<Switch checked={notifications.sms} onChange={handleChange} name="sms" />}
              label="SMS Notifications"
            />
            <FormControlLabel
              control={<Switch checked={notifications.push} onChange={handleChange} name="push" />}
              label="Push Notifications"
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" onClick={handleUpdateNotifications} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Update Notifications'}
              </Button>
            </Box>

            {alert && (
              <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
                <Alert onClose={() => setAlert(null)} severity="error">
                  {alert}
                </Alert>
              </Snackbar>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recent Notifications</Typography>
              {/* Add notification history */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Notifications;