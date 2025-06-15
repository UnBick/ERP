// src/components/student/Settings/Notifications.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Switch,
  FormGroup,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  IconButton,
  Select,
  MenuItem,
} from '@mui/material';
import { NotificationsActive, Preview } from '@mui/icons-material';

const Notifications = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    assignments: {
      email: true,
      push: true,
      frequency: 'immediate'
    },
    grades: {
      email: true,
      push: true,
      frequency: 'daily'
    },
    announcements: {
      email: true,
      push: true,
      frequency: 'immediate'
    },
    reminders: {
      email: true,
      push: true,
      frequency: 'weekly'
    }
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      setAlert('Error fetching notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
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

  const handleNotificationChange = (type, key, value) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value,
      },
    }));
  };

  const handlePreview = (type) => {
    // Show preview notification
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {Object.entries(notifications).map(([type, settings]) => (
            <Grid item xs={12} md={6} key={type}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">{type}</Typography>
                    <IconButton onClick={() => handlePreview(type)}>
                      <Preview />
                    </IconButton>
                  </Box>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email}
                          onChange={(e) => handleNotificationChange(type, 'email', e.target.checked)}
                        />
                      }
                      label="Email"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.push}
                          onChange={(e) => handleNotificationChange(type, 'push', e.target.checked)}
                        />
                      }
                      label="Push Notifications"
                    />
                    <Select
                      value={settings.frequency}
                      onChange={(e) => handleNotificationChange(type, 'frequency', e.target.value)}
                      fullWidth
                      size="small"
                    >
                      <MenuItem value="immediate">Immediate</MenuItem>
                      <MenuItem value="daily">Daily Digest</MenuItem>
                      <MenuItem value="weekly">Weekly Summary</MenuItem>
                    </Select>
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="contained" onClick={handleSaveNotifications} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Settings'}
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
    </Box>
  );
};

export default Notifications;