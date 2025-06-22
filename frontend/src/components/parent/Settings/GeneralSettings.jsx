// src/components/parent/Settings/GeneralSettings.jsx
import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, CircularProgress, Snackbar, Alert, Select, MenuItem, Switch, FormGroup, FormControlLabel } from '@mui/material';
import { getApiUrl } from '../../../config/apiConfig';

const GeneralSettings = () => {
  const [settings, setSettings] = useState({ email: '', phoneNumber: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [preferences, setPreferences] = useState({
    language: 'en',
    timeZone: 'UTC',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    emailNotifications: true,
    smsNotifications: true,
    appNotifications: true,
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    // Add more languages
  ];

  const timeZones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'EST', label: 'Eastern Time' },
    // Add more time zones
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/v1/parent/generalSettings'));
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      setAlert('Error fetching settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/v1/parent/generalSettings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setAlert('Settings saved successfully');
    } catch (error) {
      setAlert('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              General Settings
            </Typography>

            <TextField
              fullWidth
              label="Email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={settings.phoneNumber}
              onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" onClick={handleSave} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Save Settings'}
              </Button>
            </Box>

            {alert && (
              <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
                <Alert onClose={() => setAlert(null)} severity={alert === 'Settings saved successfully' ? 'success' : 'error'}>
                  {alert}
                </Alert>
              </Snackbar>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={preferences.language}
                onChange={(e) => setPreferences({
                  ...preferences,
                  language: e.target.value
                })}
              >
                {languages.map(lang => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      emailNotifications: e.target.checked
                    }))}
                  />
                }
                label="Email Notifications"
              />
              {/* Add more notification preferences */}
            </FormGroup>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default GeneralSettings;