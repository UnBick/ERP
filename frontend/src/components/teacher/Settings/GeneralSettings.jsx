// src/components/teacher/Settings/GeneralSettings.jsx
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
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
  List,  // Add this import
  ListItem,  // Add this import
  ListItemText,  // Add this import
  ListItemIcon,  // Add this import
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  AccessibilityNew,
  Translate,
  Schedule,
} from '@mui/icons-material';
import { getApiUrl } from '../../../config/apiConfig';

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    preferredLanguage: '',
    timezone: '',
    dateFormat: '',
    theme: 'light',
    fontSize: 'medium',
    accessibility: {
      highContrast: false,
      screenReader: false,
      reducedMotion: false,
      keyboardNavigation: true
    },
    calendar: {
      startOfWeek: 'monday',
      timeFormat: '24h',
      defaultView: 'week'
    },
    communication: {
      preferredLanguage: 'english',
      autoTranslate: false,
      responseTemplates: true
    },
    display: {
      compactMode: false,
      showToolTips: true,
      dashboardLayout: 'grid'
    }
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/teacher/settings'));
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      setAlert('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/teacher/settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setAlert('Settings updated successfully');
    } catch (error) {
      setAlert('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    // Add more languages
  ];

  const timeZones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    // Add more time zones
  ];

  const handleThemeToggle = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">General Settings</Typography>
              <IconButton onClick={handleThemeToggle}>
                {settings.theme === 'light' ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Box>

            <Grid container spacing={3}>
              {/* Language Settings */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Language</InputLabel>
                  <Select
                    value={settings.communication.preferredLanguage}
                    onChange={(e) => setSettings({
                      ...settings,
                      communication: {
                        ...settings.communication,
                        preferredLanguage: e.target.value
                      }
                    })}
                  >
                    {languages.map(lang => (
                      <MenuItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Time Zone Settings */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Time Zone</InputLabel>
                  <Select
                    value={settings.timezone}
                    onChange={(e) => setSettings({
                      ...settings,
                      timezone: e.target.value
                    })}
                  >
                    {timeZones.map(tz => (
                      <MenuItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Accessibility
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.accessibility.highContrast}
                      onChange={(e) => setSettings({
                        ...settings,
                        accessibility: {
                          ...settings.accessibility,
                          highContrast: e.target.checked
                        }
                      })}
                    />
                  }
                  label="High Contrast Mode"
                />
                {/* Add more accessibility options */}
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Display Preferences
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Font Size</InputLabel>
                  <Select
                    value={settings.fontSize}
                    onChange={(e) => setSettings({
                      ...settings,
                      fontSize: e.target.value
                    })}
                  >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Quick Settings</Typography>
              <List>
                <ListItem>
                  <ListItemIcon><Schedule /></ListItemIcon>
                  <ListItemText 
                    primary="Calendar View"
                    secondary={settings.calendar.defaultView}
                  />
                </ListItem>
                {/* Add more quick settings */}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {alert && (
        <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
          <Alert onClose={() => setAlert(null)} severity="error">
            {alert}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default GeneralSettings;