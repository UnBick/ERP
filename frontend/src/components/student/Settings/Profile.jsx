// src/components/student/Settings/Profile.jsx
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
  Avatar,
  IconButton,
  Grid,
  Badge,
  Tooltip,
  Divider,
} from '@mui/material';
import { PhotoCamera, Edit } from '@mui/icons-material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

const Profile = () => {
  const [profile, setProfile] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      religion: '',
      category: '',
      nationality: '',
      placeOfBirth: '',
      motherTongue: '',
      bloodGroup: '',
      aadharNo: '',
      avatar: ''
    },
    academicInfo: {
      enrollmentNumber: '',
      class: '',
      section: '',
      rollNumber: '',
      admissionNumber: '',
      admissionDate: '',
      previousSchool: '',
      academicYear: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      address: '',
      guardianName: '',
      guardianContact: '',
      guardianRelation: '',
      alternateContact: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    severity: 'info',
    message: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [editing, setEditing] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    portfolio: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/student/settings/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const { success, data } = await response.json();
      if (success) {
        setProfile(data);
        setSocialLinks(data.socialLinks || {});
      }
    } catch (error) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'Error fetching profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/student/settings/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalInfo: {
            bloodGroup: profile.personalInfo.bloodGroup,
            nationality: profile.personalInfo.nationality
          },
          contactInfo: {
            phone: profile.contactInfo.phone,
            alternateContact: profile.contactInfo.alternateContact,
            address: profile.contactInfo.address
          },
          socialLinks
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const data = await response.json();
      setAlert({
        show: true,
        severity: 'success',
        message: data.message
      });
    } catch (error) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'Error updating profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await fetch('/api/student/profile/avatar', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setAvatar(data.avatarUrl);
    } catch (error) {
      setAlert('Error updating avatar');
    }
  };

  const renderField = (label, value, field) => (
    <Grid item xs={12} md={6}>
      {editing ? (
        <TextField
          fullWidth
          label={label}
          value={value || ''}
          onChange={(e) => setProfile(prev => ({
            ...prev,
            [field.split('.')[0]]: {
              ...prev[field.split('.')[0]],
              [field.split('.')[1]]: e.target.value
            }
          }))}
          variant="outlined"
          disabled={!isEditableField(field)}
        />
      ) : (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="textSecondary">
            {label}
          </Typography>
          <Typography variant="body1">
            {value || 'Not provided'}
          </Typography>
        </Box>
      )}
    </Grid>
  );

  const isEditableField = (field) => {
    const editableFields = [
      'personalInfo.bloodGroup',
      'personalInfo.nationality',
      'contactInfo.phone',
      'contactInfo.alternateContact',
      'contactInfo.address'
    ];
    return editableFields.includes(field);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Profile Photo Section */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profile.personalInfo?.avatar}
              alt={`${profile.personalInfo?.firstName} ${profile.personalInfo?.lastName}`}
              sx={{
                width: 150,
                height: 150,
                border: '2px solid',
                borderColor: 'primary.main'
              }}
            />
            <input
              accept="image/*"
              type="file"
              hidden
              id="photo-upload"
              onChange={handleAvatarChange}
            />
            <label htmlFor="photo-upload">
              <IconButton
                component="span"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' }
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </label>
          </Box>
        </Box>

        {/* Header with Edit Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Student Profile</Typography>
          {!editing ? (
            <IconButton color="primary" onClick={() => setEditing(true)}>
              <EditIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Personal Information</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          {renderField('First Name', profile.personalInfo?.firstName, 'personalInfo.firstName')}
          {renderField('Last Name', profile.personalInfo?.lastName, 'personalInfo.lastName')}
          {renderField('Date of Birth', profile.personalInfo?.dateOfBirth, 'personalInfo.dateOfBirth')}
          {renderField('Blood Group', profile.personalInfo?.bloodGroup, 'personalInfo.bloodGroup')}
          {renderField('Nationality', profile.personalInfo?.nationality, 'personalInfo.nationality')}

          {/* Academic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Academic Information</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          {renderField('Enrollment Number', profile.academicInfo?.enrollmentNumber, 'academicInfo.enrollmentNumber')}
          {renderField('Class', profile.academicInfo?.class?.name, 'academicInfo.class')}
          {renderField('Section', profile.academicInfo?.section?.name, 'academicInfo.section')}
          {renderField('Roll Number', profile.academicInfo?.rollNumber, 'academicInfo.rollNumber')}

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Contact Information</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          {renderField('Phone', profile.contactInfo?.phone, 'contactInfo.phone')}
          {renderField('Alternate Contact', profile.contactInfo?.alternateContact, 'contactInfo.alternateContact')}
          {renderField('Address', profile.contactInfo?.address, 'contactInfo.address')}
          {renderField('Guardian Name', profile.contactInfo?.guardianName, 'contactInfo.guardianName')}
          {renderField('Guardian Contact', profile.contactInfo?.guardianContact, 'contactInfo.guardianContact')}
        </Grid>
      </Paper>

      <Snackbar
        open={alert.show}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, show: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, show: false })}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;