import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getApiUrl } from '../../../../config/apiConfig';

// Gateway configuration details
const GATEWAY_CONFIGS = {
  sbi: {
    name: 'SBI Payment Gateway',
    logo: '/images/payment/sbi-logo.png',
    fields: [
      { key: 'merchantId', label: 'Merchant ID' },
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' },
    ],
  },
  phonepe: {
    name: 'PhonePe',
    logo: '/images/payment/phonepe-logo.png',
    fields: [
      { key: 'merchantId', label: 'Merchant ID' },
      { key: 'saltKey', label: 'Salt Key', type: 'password' },
      { key: 'saltIndex', label: 'Salt Index' },
    ],
  },
  bhim: {
    name: 'BHIM UPI',
    logo: '/images/payment/bhim-logo.png',
    fields: [
      { key: 'merchantId', label: 'Merchant ID' },
      { key: 'virtualAddress', label: 'Virtual Address' },
      { key: 'upiKey', label: 'UPI Key', type: 'password' },
    ],
  },
};

const PaymentGateway = () => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  // Initialize settings with empty values for each gateway
  const [settings, setSettings] = useState(
    Object.keys(GATEWAY_CONFIGS).reduce((acc, key) => {
      acc[key] = {
        enabled: false,
        mode: 'test',
        merchantId: '',
        apiKey: '',
        secretKey: '',
        saltKey: '',
        saltIndex: '',
        virtualAddress: '',
        upiKey: '',
      };
      return acc;
    }, {})
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  // Fetch current gateway settings from the backend
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/v1/admin/fees/payment-gateways'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch payment gateway settings');
      }

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch payment gateway settings');
      }
    } catch (error) {
      console.error('Error fetching payment gateway settings:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching payment gateway settings'
      });
    } finally {
      setLoading(false);
    }
  };

  // Save settings to the backend
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/v1/admin/fees/payment-gateways'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save payment gateway settings');
      }

      const data = await response.json();
      if (data.success) {
        setAlert({
          type: 'success',
          message: 'Payment gateway settings saved successfully'
        });
      } else {
        throw new Error(data.message || 'Failed to save payment gateway settings');
      }
    } catch (error) {
      console.error('Error saving payment gateway settings:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error saving payment gateway settings'
      });
    } finally {
      setLoading(false);
    }
  };

  // Update a specific field for a gateway
  const handleSettingChange = (gateway, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        [field]: value,
      },
    }));
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Payment Gateway Configuration
      </Typography>
      {loading && <CircularProgress sx={{ mb: 3 }} />}
      <Grid container spacing={3}>
        {Object.keys(GATEWAY_CONFIGS).map((gateway) => {
          const config = GATEWAY_CONFIGS[gateway];
          const gatewaySetting = settings[gateway];
          return (
            <Grid item xs={12} md={4} key={gateway}>
              <Card>
                <CardMedia
                  component="img"
                  height="120"
                  image={config.logo}
                  alt={config.name}
                  sx={{ objectFit: 'contain', p: 2 }}
                />
                <CardContent>
                  <Typography variant="h6">{config.name}</Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={gatewaySetting.enabled}
                        onChange={() =>
                          handleSettingChange(gateway, 'enabled', !gatewaySetting.enabled)
                        }
                      />
                    }
                    label={gatewaySetting.enabled ? 'Enabled' : 'Disabled'}
                  />
                  {gatewaySetting.enabled && (
                    <>
                      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                        <InputLabel>Mode</InputLabel>
                        <Select
                          value={gatewaySetting.mode}
                          label="Mode"
                          onChange={(e) =>
                            handleSettingChange(gateway, 'mode', e.target.value)
                          }
                        >
                          <MenuItem value="test">Test Mode</MenuItem>
                          <MenuItem value="live">Live Mode</MenuItem>
                        </Select>
                      </FormControl>
                      <Accordion sx={{ mt: 2 }}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel-content"
                          id="panel-header"
                        >
                          <Typography variant="body1">Configure Settings</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {config.fields.map((field) => (
                            <TextField
                              key={field.key}
                              fullWidth
                              label={field.label}
                              type={field.type || 'text'}
                              value={gatewaySetting[field.key]}
                              onChange={(e) =>
                                handleSettingChange(gateway, field.key, e.target.value)
                              }
                              inputProps={{
                                autoComplete:
                                  field.type === 'password' ? 'new-password' : 'on',
                              }}
                              sx={{ mb: 2 }}
                            />
                          ))}
                        </AccordionDetails>
                      </Accordion>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
      {alert && (
        <Snackbar
          open={!!alert}
          autoHideDuration={6000}
          onClose={() => setAlert(null)}
        >
          <Alert severity={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default PaymentGateway;
