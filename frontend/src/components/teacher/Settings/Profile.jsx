// src/components/teacher/Settings/Profile.jsx
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
  Avatar,
  IconButton,
  Divider
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useTeacher } from '../../../context/TeacherContext';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    staffID: '',
    email: '',
    contact: '',
    mobileNo: '',
    address: '',
    department: '',
    designation: '',
    dateOfBirth: '',
    gender: '',
    religion: '',
    category: '',
    qualifications: '',
    joiningDate: '',
    nationality: '',
    salary: ''
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [qualifications, setQualifications] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const { updateTeacherData } = useTeacher();
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/teacher/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching profile information'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditedProfile({ ...profile });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditedProfile({});
    setEditMode(false);
  };

  const handleChange = (field) => (event) => {
    setEditedProfile({
      ...editedProfile,
      [field]: event.target.value
    });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/teacher/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setEditMode(false);
        setAlert({
          type: 'success',
          message: 'Profile updated successfully'
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Error updating profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('avatar', file);
    // Upload logic
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create local preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/teacher/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Photo upload response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload photo');
      }

      // Update both profile and global state with new avatar URL
      setProfile(prev => ({
        ...prev,
        avatar: data.data.avatar
      }));
      updateTeacherData(prev => ({
        ...prev,
        avatar: data.data.avatar
      }));

      setAlert({
        type: 'success',
        message: 'Profile photo updated successfully'
      });
    } catch (error) {
      console.error('Upload error:', error);
      // Revert preview on error
      setPhotoPreview(null);
      setAlert({
        type: 'error',
        message: error.message || 'Error uploading photo'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (label, value, field) => (
    <Grid item xs={12} md={6}>
      {editMode ? (
        <TextField
          fullWidth
          label={label}
          value={editedProfile[field] || ''}
          onChange={handleChange(field)}
          variant="outlined"
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

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={photoPreview || profile.avatar}
              alt={profile.name}
              sx={{
                width: 150,
                height: 150,
                border: '2px solid',
                borderColor: 'primary.main',
                '& img': {
                  objectFit: 'cover'
                }
              }}
            >
              {profile.name?.charAt(0)}
            </Avatar>
            <input
              accept="image/*"
              type="file"
              hidden
              id="photo-upload"
              onChange={handlePhotoUpload}
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
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </label>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Profile Information</Typography>
          {!editMode ? (
            <IconButton color="primary" onClick={handleEdit}>
              <EditIcon />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
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
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          {renderField('Staff ID', profile.staffID, 'staffID')}
          {renderField('Name', profile.name, 'name')}
          {renderField('Email', profile.email, 'email')}
          {renderField('Contact', profile.contact, 'contact')}

          {/* Professional Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Professional Information</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          {renderField('Department', profile.department, 'department')}
          {renderField('Designation', profile.designation, 'designation')}
          {renderField('Qualifications', profile.qualifications, 'qualifications')}
          {renderField('Joining Date', profile.joiningDate, 'joiningDate')}

          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Personal Information</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          {renderField('Address', profile.address, 'address')}
          {renderField('Gender', profile.gender, 'gender')}
          {renderField('Religion', profile.religion, 'religion')}
          {renderField('Nationality', profile.nationality, 'nationality')}
        </Grid>
      </Paper>

      <Snackbar
        open={!!alert}
        autoHideDuration={6000}
        onClose={() => setAlert(null)}
      >
        <Alert
          onClose={() => setAlert(null)}
          severity={alert?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {alert?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;