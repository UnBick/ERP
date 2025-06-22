// frontend/src/components/admin/Academic/Subjects.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getApiUrl } from '../../../config/apiConfig';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    code: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/v1/admin/academic/subjects'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data?.data) {
        setSubjects(data.data);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Error fetching subjects: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = () => {
    setFormData({
      id: null,
      name: '',
      code: '',
      description: '',
      isActive: true
    });
    setOpenDialog(true);
  };

  const handleEditSubject = (subject) => {
    setFormData({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      isActive: subject.isActive
    });
    setOpenDialog(true);
  };

  const handleDeleteSubject = async (subjectId) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        const response = await fetch(getApiUrl(`/api/v1/admin/academic/subjects/${subjectId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to delete subject');
        
        await fetchSubjects();
        setAlert({
          type: 'success',
          message: 'Subject deleted successfully'
        });
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Error deleting subject'
        });
      }
    }
  };

  const handleSaveSubject = async () => {
    setLoading(true);
    try {
      const url = formData.id
        ? `/api/admin/academic/subjects/${formData.id}`
        : '/api/admin/academic/subjects';

      const response = await fetch(url, {
        method: formData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          description: formData.description,
          isActive: formData.isActive
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save subject');
      }

      setOpenDialog(false);
      await fetchSubjects();
      setAlert({
        type: 'success',
        message: `Subject ${formData.id ? 'updated' : 'created'} successfully`
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Error saving subject: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Subjects Management
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddSubject}
          >
            Add Subject
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.description}</TableCell>
                    <TableCell>{subject.isActive ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<Edit />}
                        onClick={() => handleEditSubject(subject)}
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<Delete />}
                        color="error"
                        onClick={() => handleDeleteSubject(subject.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {formData.id ? 'Edit Subject' : 'Add New Subject'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject Code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveSubject}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {alert && (
          <Snackbar
            open={Boolean(alert)}
            autoHideDuration={6000}
            onClose={() => setAlert(null)}
          >
            <Alert
              onClose={() => setAlert(null)}
              severity={alert.type}
              sx={{ width: '100%' }}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default Subjects;
