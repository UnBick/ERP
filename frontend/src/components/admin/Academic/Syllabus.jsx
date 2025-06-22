// frontend/src/components/admin/Academic/SyllabusManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, FormControl, 
  InputLabel, Select, MenuItem, Button, Table,
  TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, 
  Snackbar, Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getApiUrl } from '../../../config/apiConfig';

const SyllabusManagement = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    classId: '',
    subjectId: '',
    content: '',
    academicYear: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchSyllabi();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/academic/classes'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error fetching classes'
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/academic/subjects'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error fetching subjects'
      });
    }
  };

  const fetchSyllabi = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/academic/syllabi'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch syllabi');

      const data = await response.json();
      setSyllabi(data.data);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error fetching syllabi'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSyllabus = () => {
    setFormData({
      id: null,
      classId: '',
      subjectId: '',
      content: '',
      academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1).toString().substr(-2)
    });
    setOpenDialog(true);
  };

  const handleEditSyllabus = (syllabus) => {
    setFormData({
      id: syllabus.id,
      classId: syllabus.classId,
      subjectId: syllabus.subjectId,
      content: syllabus.content,
      academicYear: syllabus.academicYear
    });
    setOpenDialog(true);
  };

  const handleSaveSyllabus = async () => {
    setLoading(true);
    try {
      const url = formData.id
        ? `/api/admin/academic/syllabi/${formData.id}`
        : '/api/admin/academic/syllabi';

      const response = await fetch(url, {
        method: formData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save syllabus');
      }

      setOpenDialog(false);
      await fetchSyllabi();
      setAlert({
        type: 'success',
        message: `Syllabus ${formData.id ? 'updated' : 'created'} successfully`
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Error saving syllabus: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSyllabus = async (syllabusId) => {
    if (window.confirm('Are you sure you want to delete this syllabus?')) {
      try {
        const response = await fetch(getApiUrl(`/api/admin/academic/syllabi/${syllabusId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to delete syllabus');

        await fetchSyllabi();
        setAlert({
          type: 'success',
          message: 'Syllabus deleted successfully'
        });
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Error deleting syllabus'
        });
      }
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Syllabus Management
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddSyllabus}
          >
            Add Syllabus
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Class</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Academic Year</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                syllabi.map((syllabus) => (
                  <TableRow key={syllabus.id}>
                    <TableCell>{syllabus.className}</TableCell>
                    <TableCell>{syllabus.subjectName}</TableCell>
                    <TableCell>{syllabus.academicYear}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<Edit />}
                        onClick={() => handleEditSyllabus(syllabus)}
                      >
                        Edit
                      </Button>
                      <Button
                        startIcon={<Delete />}
                        color="error"
                        onClick={() => handleDeleteSyllabus(syllabus.id)}
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
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {formData.id ? 'Edit Syllabus' : 'Add New Syllabus'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    label="Class"
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    label="Subject"
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Syllabus Content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveSyllabus}
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

export default SyllabusManagement;