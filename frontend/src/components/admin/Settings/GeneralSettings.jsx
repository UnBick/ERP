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
  FormControlLabel,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  ColorLens as ColorLensIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { settingsApi } from '../../../services/settingsApi';
import { useSettings } from '../../../context/SettingsContext';

const GeneralSettings = () => {
  const { settings: globalSettings, loading: globalLoading, refreshSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    schoolName: '',
    address: '',
    phoneNumber: '',
    email: '',
    website: '',
    taxNumber: '',
    registrationNumber: '',
    academicYear: '',
    timezone: '',
    dateFormat: '',
    currency: '',
    language: ''
  });
  const [advanced, setAdvanced] = useState({
    maintenance: false,
    debugMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false
  });
  const [alert, setAlert] = useState(null);
  const [logo, setLogo] = useState(null);
  const [themeColor, setThemeColor] = useState('#1976d2');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (globalSettings?.general) {
      setSettings(globalSettings.general);
    }
  }, [globalSettings]);

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    
    try {
        // If it's already a full URL, return as is
        if (logoPath.startsWith('http')) return logoPath;
        
        // Ensure clean path without double slashes
        const cleanPath = logoPath.replace(/^\/+/, '').replace(/\/+/g, '/');
        return `${process.env.REACT_APP_API_URL}/${cleanPath}`;
    } catch (error) {
        console.error('Error formatting logo URL:', error);
        return null;
    }
};

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.updateSettings(settings);
      
      if (response.success) {
        await refreshSettings(); // Refresh global settings after update
        setAlert({
          severity: 'success',
          message: 'Settings updated successfully'
        });
      } else {
        throw new Error(response.message || 'Failed to update settings');
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to update settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const response = await settingsApi.uploadLogo(file);
        if (response.success) {
          const logoUrl = response.data.fileUrl;
          setLogo(logoUrl);
          await refreshSettings();
          setAlert({
            severity: 'success',
            message: 'Logo uploaded successfully'
          });
        }
      } catch (error) {
        console.error('Logo upload error:', error);
        setAlert({
          severity: 'error',
          message: 'Failed to upload logo'
        });
      }
    }
  };

  const handleLogoDelete = async () => {
    try {
      const response = await settingsApi.deleteLogo();
      if (response.success) {
        setLogo(null);
        setAlert({
          severity: 'success',
          message: 'Logo deleted successfully'
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to delete logo'
      });
    }
  };

  const handleExport = async () => {
    try {
      const blob = await settingsApi.exportSettings();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `settings_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setAlert({
        severity: 'error',
        message: 'Failed to export settings'
      });
    }
  };

  const renderPreview = () => (
    <Dialog
      open={previewOpen}
      onClose={() => setPreviewOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Preview Settings</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          {logo && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <img src={getLogoUrl(logo)} alt="School Logo" style={{ maxWidth: 200 }} />
            </Box>
          )}
          <Typography variant="h5" gutterBottom sx={{ color: themeColor }}>
            {settings.schoolName}
          </Typography>
          <Typography variant="body1" paragraph>
            {settings.address}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2">
                Phone: {settings.phoneNumber}
              </Typography>
              <Typography variant="body2">
                Email: {settings.email}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                Website: {settings.website}
              </Typography>
              <Typography variant="body2">
                Tax Number: {settings.taxNumber}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPreviewOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const renderLogoSection = () => (
    <Box sx={{ mb: 3 }}>
      {logo && (
        <Box sx={{ mb: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>Current Logo</Typography>
          <Box sx={{ 
            position: 'relative', 
            width: 'fit-content',
            margin: '0 auto'
          }}>
            <img 
              src={getLogoUrl(logo)} 
              alt="School Logo" 
              style={{ 
                maxWidth: '200px', 
                maxHeight: '100px', 
                objectFit: 'contain',
                display: 'block'
              }} 
              onError={(e) => {
                console.error('Failed to load logo:', logo);
                e.target.remove(); // Remove failed image entirely
              }}
              crossOrigin="anonymous"
            />
            <IconButton
              sx={{
                position: 'absolute',
                top: -12,
                right: -12,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'error.light',
                  color: 'white'
                }
              }}
              size="small"
              onClick={handleLogoDelete}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        id="logo-upload"
        onChange={handleLogoUpload}
      />
      <label htmlFor="logo-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={<UploadIcon />}
          fullWidth
        >
          {logo ? 'Change Logo' : 'Upload Logo'}
        </Button>
      </label>
    </Box>
  );

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5">General Settings</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<PreviewIcon />}
                  onClick={() => setPreviewOpen(true)}
                >
                  Preview
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                >
                  Export
                </Button>
                <Button
                  startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="School Name"
                      value={settings.schoolName}
                      onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={settings.phoneNumber}
                      onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={settings.website}
                      onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tax Number"
                      value={settings.taxNumber}
                      onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Registration Number"
                      value={settings.registrationNumber}
                      onChange={(e) => setSettings({ ...settings, registrationNumber: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Academic Year"
                      value={settings.academicYear}
                      onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Timezone"
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date Format"
                      value={settings.dateFormat}
                      onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Currency"
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Language"
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Logo and Theme */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Appearance</Typography>
                {renderLogoSection()}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>Theme Color</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      sx={{ width: 100 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {themeColor}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Advanced Settings */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Advanced Settings</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advanced.maintenance}
                          onChange={(e) => setAdvanced({ ...advanced, maintenance: e.target.checked })}
                        />
                      }
                      label="Maintenance Mode"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advanced.debugMode}
                          onChange={(e) => setAdvanced({ ...advanced, debugMode: e.target.checked })}
                        />
                      }
                      label="Debug Mode"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advanced.allowRegistration}
                          onChange={(e) => setAdvanced({ ...advanced, allowRegistration: e.target.checked })}
                        />
                      }
                      label="Allow Registration"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advanced.emailNotifications}
                          onChange={(e) => setAdvanced({ ...advanced, emailNotifications: e.target.checked })}
                        />
                      }
                      label="Email Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={advanced.smsNotifications}
                          onChange={(e) => setAdvanced({ ...advanced, smsNotifications: e.target.checked })}
                        />
                      }
                      label="SMS Notifications"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {renderPreview()}

        <Snackbar
          open={!!alert}
          autoHideDuration={6000}
          onClose={() => setAlert(null)}
        >
          <Alert
            onClose={() => setAlert(null)}
            severity={alert?.severity || 'info'}
          >
            {alert?.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default GeneralSettings;