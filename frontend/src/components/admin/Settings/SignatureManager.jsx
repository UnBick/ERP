import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  AlertTitle, // Add this import
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Add, Delete, Edit, Refresh, Error, CheckCircle } from '@mui/icons-material';
import { getApiUrl, API_ENDPOINTS } from '../../../config/apiConfig';

const SIGNATURE_TYPES = {
  PRINCIPAL: { label: 'Principal', required: true },
  VICE_PRINCIPAL: { label: 'Vice Principal', required: true },
  EXAM_CONTROLLER: { label: 'Exam Controller', required: true },
  ADMIN_OFFICER: { label: 'Administrative Officer', required: true },
  FINANCE_OFFICER: { label: 'Finance Officer', required: true },
  ACADEMIC_HEAD: { label: 'Academic Head', required: true }
};

const DOCUMENT_TYPES = {
  TRANSFER_CERTIFICATE: ['PRINCIPAL', 'ADMIN_OFFICER'],
  REPORT_CARD: ['PRINCIPAL', 'CLASS_TEACHER'],
  CHARACTER_CERTIFICATE: ['PRINCIPAL', 'VICE_PRINCIPAL'],
  BONAFIDE_CERTIFICATE: ['PRINCIPAL', 'ADMIN_OFFICER'],
  FEE_RECEIPT: ['FINANCE_OFFICER'],
  MARKSHEET: ['PRINCIPAL', 'EXAM_CONTROLLER', 'CLASS_TEACHER'] // Updated to include CLASS_TEACHER
};

const SignatureCard = ({ signature, onDelete, onUpdate }) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardMedia
      component="img"
      height="100"
      image={signature.imageUrl}
      alt={`${signature.title}'s Signature`}
      sx={{ 
        objectFit: 'contain', 
        p: 2,
        backgroundColor: '#f5f5f5'
      }}
    />
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" gutterBottom>
        {signature.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {signature.name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Last Updated: {new Date(signature.updatedAt).toLocaleDateString()}
      </Typography>
    </CardContent>
    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
      <Tooltip title="Update Signature">
        <IconButton onClick={() => onUpdate(signature)}>
          <Edit />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete Signature">
        <IconButton color="error" onClick={() => onDelete(signature._id)}>
          <Delete />
        </IconButton>
      </Tooltip>
    </Box>
  </Card>
);

const SignatureManager = () => {
  const [signatures, setSignatures] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState(null);
  const [newSignature, setNewSignature] = useState({
    title: '',
    name: '',
    image: null,
    imagePreview: null
  });
  const [error, setError] = useState('');
  const [staffSignatures, setStaffSignatures] = useState({});
  const [documentRequirements, setDocumentRequirements] = useState({});
  const [missingSignatures, setMissingSignatures] = useState([]);

  useEffect(() => {
    fetchSignatures();
    fetchStaffSignatures();
    checkRequiredSignatures();
  }, []);

  const fetchSignatures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(API_ENDPOINTS.SETTINGS.SIGNATURES), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch signatures');
      }

      const data = await response.json();
      if (data.success) {
        setSignatures(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch signatures');
      }
    } catch (error) {
      console.error('Error fetching signatures:', error);
      setError('Failed to load signatures');
    }
  };

  const fetchStaffSignatures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(API_ENDPOINTS.STAFF.SIGNATURES), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff signatures');
      }

      const data = await response.json();
      if (data.success) {
        setStaffSignatures(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch staff signatures');
      }
    } catch (error) {
      console.error('Error fetching staff signatures:', error);
      setError('Failed to load staff signatures');
    }
  };

  const checkRequiredSignatures = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(API_ENDPOINTS.SETTINGS.SIGNATURES_REQUIREMENTS), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check signature requirements');
      }

      const data = await response.json();
      if (data.success) {
        setDocumentRequirements(data.data.requirements);
        setMissingSignatures(data.data.missing);
      } else {
        throw new Error(data.message || 'Failed to check signature requirements');
      }
    } catch (error) {
      console.error('Error checking signature requirements:', error);
      setError('Failed to check signature requirements');
    }
  };

  const getClassTeacherSignature = (classId, sectionId) => {
    const classTeacherId = staffSignatures.classTeachers?.[`${classId}-${sectionId}`];
    return staffSignatures.signatures?.[classTeacherId];
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        setError('Image size should be less than 1MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSignature(prev => ({
          ...prev,
          image: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newSignature.title);
      formData.append('name', newSignature.name);
      formData.append('signatureImage', newSignature.image);

      // Fix endpoint URL
      const url = selectedSignature 
        ? getApiUrl(`${API_ENDPOINTS.SETTINGS.SIGNATURES}/${selectedSignature._id}`)
        : getApiUrl(API_ENDPOINTS.SETTINGS.SIGNATURES);

      console.log('Submitting to:', url); // Debug log

      const response = await fetch(url, {
        method: selectedSignature ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save signature');
      }

      const data = await response.json();
      if (data.success) {
        setAlert({
          severity: 'success',
          message: 'Signature saved successfully'
        });
        fetchSignatures();
        handleCloseDialog();
      } else {
        throw new Error(data.message || 'Failed to save signature');
      }
    } catch (error) {
      console.error('Error saving signature:', error);
      setError(error.message || 'Failed to save signature');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.SETTINGS.SIGNATURES}/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete signature');
      }

      const data = await response.json();
      if (data.success) {
        fetchSignatures();
      } else {
        throw new Error(data.message || 'Failed to delete signature');
      }
    } catch (error) {
      console.error('Error deleting signature:', error);
      setError(error.message || 'Failed to delete signature');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSignature(null);
    setNewSignature({
      title: '',
      name: '',
      image: null,
      imagePreview: null
    });
    setError('');
  };

  const handleUpdate = (signature) => {
    setSelectedSignature(signature);
    setNewSignature({
      title: signature.title,
      name: signature.name,
      image: null,
      imagePreview: signature.imageUrl
    });
    setOpenDialog(true);
  };

  const handleSignatureRequest = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(API_ENDPOINTS.SETTINGS.SIGNATURES_REQUEST), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        setAlert({
          type: 'success',
          message: 'Signature request sent successfully'
        });
      }
    } catch (error) {
      setError('Failed to send signature request');
    }
  };

  const renderRequirementStatus = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Signature Requirements Status
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(DOCUMENT_TYPES).map(([docType, requiredSignatures]) => (
          <Grid item xs={12} sm={6} md={4} key={docType}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  {docType.replace(/_/g, ' ')}
                </Typography>
                {requiredSignatures.map(sigType => (
                  <Box 
                    key={sigType} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: missingSignatures.includes(sigType) ? 'error.main' : 'success.main'
                    }}
                  >
                    {missingSignatures.includes(sigType) ? (
                      <Error fontSize="small" />
                    ) : (
                      <CheckCircle fontSize="small" />
                    )}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {SIGNATURE_TYPES[sigType]?.label}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Signature Management</Typography>
          <Box>
            <Button
              startIcon={<Refresh />}
              onClick={fetchSignatures}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
            >
              Add New Signature
            </Button>
          </Box>
        </Box>

        {renderRequirementStatus()}

        {missingSignatures.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Missing Required Signatures</AlertTitle>
            The following signatures are required but not yet uploaded:
            <List>
              {missingSignatures.map(type => (
                <ListItem key={type}>
                  <ListItemText 
                    primary={SIGNATURE_TYPES[type]?.label}
                    secondary="Required for official documents"
                  />
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => handleSignatureRequest(type)}
                  >
                    Request Signature
                  </Button>
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Administrative Signatures */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Administrative Signatures
        </Typography>
        <Grid container spacing={3}>
          {signatures.map((signature) => (
            <Grid item xs={12} sm={6} md={4} key={signature._id}>
              <SignatureCard
                signature={signature}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            </Grid>
          ))}
        </Grid>

        {/* Class Teacher Signatures */}
        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
          Class Teacher Signatures
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(staffSignatures.classTeachers || {}).map(([key, teacherId]) => {
            const [classId, sectionId] = key.split('-');
            const signature = getClassTeacherSignature(classId, sectionId);
            if (!signature) return null;

            return (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="100"
                    image={signature.imageUrl}
                    alt={`Class Teacher Signature`}
                    sx={{ 
                      objectFit: 'contain', 
                      p: 2,
                      backgroundColor: '#f5f5f5'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Class Teacher
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {signature.teacherName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {signature.className} - Section {signature.sectionName}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedSignature ? 'Update Signature' : 'Add New Signature'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                select
                label="Title"
                value={newSignature.title}
                onChange={(e) => setNewSignature({ ...newSignature, title: e.target.value })}
                sx={{ mb: 2 }}
              >
                {Object.entries(SIGNATURE_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </TextField>
              
              <TextField
                fullWidth
                label="Name"
                value={newSignature.name}
                onChange={(e) => setNewSignature({ ...newSignature, name: e.target.value })}
                sx={{ mb: 2 }}
              />

              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mb: 2 }}
              >
                Upload Signature Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>

              {newSignature.imagePreview && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img
                    src={newSignature.imagePreview}
                    alt="Signature Preview"
                    style={{ maxWidth: '100%', maxHeight: 200 }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!newSignature.title || !newSignature.name || (!newSignature.image && !selectedSignature)}
            >
              {selectedSignature ? 'Update' : 'Add'} Signature
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default SignatureManager;