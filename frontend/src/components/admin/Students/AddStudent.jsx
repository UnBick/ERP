import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { getApiUrl } from '../../../config/apiConfig';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: ''
    },
    academicInfo: {
      class: '',
      section: '',
      rollNumber: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      guardianName: '',
      guardianContact: ''
    }
  });
  const token = localStorage.getItem('authToken'); 
console.log("Token being sent:", token);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(getApiUrl('/api/v1/admin/students'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`},  // Include token
        body: JSON.stringify({
          name: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`,
          class: formData.academicInfo.class,
          section: formData.academicInfo.section,
          rollNumber: formData.academicInfo.rollNumber,
          contact: formData.contactInfo.phone,
          parent: formData.contactInfo.guardianContact, 
          dateOfBirth: formData.personalInfo.dateOfBirth,
          address: formData.contactInfo.address
        }),
      });

      if (!response.ok) throw new Error('Failed to create student');
      
      setAlert({ type: 'success', message: 'Student created successfully!' });
      setFormData({
        personalInfo: { firstName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '' },
        academicInfo: { class: '', section: '', rollNumber: '' },
        contactInfo: { email: '', phone: '', address: '', guardianName: '', guardianContact: '' }
      });
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: e.target.value
      }
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Add New Student</Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6">Personal Information</Typography>
            <TextField fullWidth label="First Name" value={formData.personalInfo.firstName} onChange={handleChange('personalInfo', 'firstName')} required sx={{ mt: 2 }} />
            <TextField fullWidth label="Last Name" value={formData.personalInfo.lastName} onChange={handleChange('personalInfo', 'lastName')} required sx={{ mt: 2 }} />
            <TextField fullWidth label="Date of Birth" type="date" value={formData.personalInfo.dateOfBirth} onChange={handleChange('personalInfo', 'dateOfBirth')} required sx={{ mt: 2 }} InputLabelProps={{ shrink: true }} />
          </Grid>

          {/* Academic Information */}
          <Grid item xs={12}>
            <Typography variant="h6">Academic Information</Typography>
            <TextField fullWidth label="Class" value={formData.academicInfo.class} onChange={handleChange('academicInfo', 'class')} required sx={{ mt: 2 }} />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6">Contact Information</Typography>
            <TextField fullWidth label="Phone Number" value={formData.contactInfo.phone} onChange={handleChange('contactInfo', 'phone')} required sx={{ mt: 2 }} />
            <TextField fullWidth label="Guardian Name" value={formData.contactInfo.guardianName} onChange={handleChange('contactInfo', 'guardianName')} sx={{ mt: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create Student'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
        <Alert severity={alert?.type} onClose={() => setAlert(null)}>
          {alert?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddStudent;
