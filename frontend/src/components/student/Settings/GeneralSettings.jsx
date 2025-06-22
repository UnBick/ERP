// src/components/student/Settings/GeneralSettings.jsx
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
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
} from '@mui/material';
import { getApiUrl } from '../../../config/apiConfig';

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    preferredLanguage: '',
    timezone: '',
    dateFormat: '',
    theme: 'light',
    fontSize: 'medium',
    colorBlindMode: false,
    notifications: {
      sound: true,
      desktop: true,
    },
    accessibility: {
      highContrast: false,
      screenReader: false,
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
      const response = await fetch(getApiUrl('/api/student/settings'));
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
      const response = await fetch(getApiUrl('/api/student/settings'), {
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

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Display Settings</Typography>
            <Select
              fullWidth
              label="Theme"
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              sx={{ mb: 2 }}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="system">System</MenuItem>
            </Select>
            
            <Select
              fullWidth
              label="Font Size"
              value={settings.fontSize}
              onChange={(e) => setSettings({ ...settings, fontSize: e.target.value })}
              sx={{ mb: 2 }}
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6">Accessibility</Typography>
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
            <FormControlLabel
              control={
                <Switch
                  checked={settings.accessibility.screenReader}
                  onChange={(e) => setSettings({
                    ...settings,
                    accessibility: {
                      ...settings.accessibility,
                      screenReader: e.target.checked
                    }
                  })}
                />
              }
              label="Screen Reader Support"
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          label="Preferred Language"
          value={settings.preferredLanguage}
          onChange={(e) => setSettings({ ...settings, preferredLanguage: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Timezone"
          value={settings.timezone}
          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Date Format"
          value={settings.dateFormat}
          onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleUpdateSettings} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Update Settings'}
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

export default GeneralSettings;