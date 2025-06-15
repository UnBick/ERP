// frontend/src/components/admin/Staff/StaffServices.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  School,
  LocalLibrary,
  DirectionsBus,
  RestaurantMenu,
  LocalHospital,
  SportsEsports,
} from '@mui/icons-material';
import { useStudent } from '../Students/context/StudentContext';

const ServiceCard = ({ title, icon, description, onRequest }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small" onClick={onRequest}>
        Request Service
      </Button>
    </CardActions>
  </Card>
);

const StaffServices = () => {
  const { currentUser } = useStudent();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [requestDetails, setRequestDetails] = useState('');

  const services = [
    {
      id: 'academic',
      title: 'Academic Support',
      icon: <School />,
      description: 'Get help with professional development, teaching resources, and more'
    },
    {
      id: 'library',
      title: 'Library Services',
      icon: <LocalLibrary />,
      description: 'Access library resources and request materials'
    },
    {
      id: 'transport',
      title: 'Transport Services',
      icon: <DirectionsBus />,
      description: 'School bus routes and transport arrangements'
    },
    {
      id: 'cafeteria',
      title: 'Cafeteria Services',
      icon: <RestaurantMenu />,
      description: 'Meal plans and special dietary requirements'
    },
    {
      id: 'healthcare',
      title: 'Healthcare Services',
      icon: <LocalHospital />,
      description: 'Medical assistance and health records'
    },
    {
      id: 'extracurricular',
      title: 'Extracurricular Activities',
      icon: <SportsEsports />,
      description: 'Sports, clubs, and other activities'
    }
  ];

  const handleRequestService = (service) => {
    setSelectedService(service);
    setOpenDialog(true);
  };

  const handleSubmitRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/staff/services/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          userId: currentUser,
          details: requestDetails,
          requestDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit service request');
      }

      setOpenDialog(false);
      setRequestDetails('');
      setSuccess('Service request submitted successfully');
    } catch (err) {
      setError('Failed to submit service request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Staff Services
        </Typography>

        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <ServiceCard
                {...service}
                onRequest={() => handleRequestService(service)}
              />
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Request {selectedService?.title}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Request Details"
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Request'}
            </Button>
          </DialogActions>
        </Dialog>

        {success && (
          <Snackbar
            open={true}
            autoHideDuration={6000}
            onClose={() => setSuccess(null)}
          >
            <Alert onClose={() => setSuccess(null)} severity="success">
              {success}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default StaffServices;