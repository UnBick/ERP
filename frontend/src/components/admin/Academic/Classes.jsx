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
  MenuItem,
  Tooltip,
  IconButton,
  Chip,
  FormHelperText
} from '@mui/material';
import { 
  Add, Edit, Delete, People, Schedule, MenuBook,
  CloudUpload, Download
} from '@mui/icons-material';
import { academicLevels, academicYears, validateClassData } from '../../../utils/academicUtils';
import { useAlert } from '../../common/AlertProvider';

const Classes = () => {
  const { showAlert } = useAlert();
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [classDetails, setClassDetails] = useState({
    name: '',
    level: '',
    academicYear: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleError = (message) => {
    showAlert(message, 'error');
  };

  const handleSuccess = (message) => {
    showAlert(message, 'success');
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/admin/academic/classes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Classes data received:', result);

      if (result.success && Array.isArray(result.data)) {
        setClasses(result.data);
      } else {
        throw new Error('Invalid data structure received');
      }
    } catch (error) {
      handleError(`Error fetching classes: ${error.message}`);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = () => {
    setSelectedClass(null);
    setOpenDialog(true);
  };

  const handleEditClass = (classItem) => {
    setSelectedClass(classItem);
    setOpenDialog(true);
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await fetch(`/api/admin/academic/classes/${classId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchClasses();
        handleSuccess('Class deleted successfully');
      } catch (error) {
        handleError('Error deleting class');
      }
    }
  };

  const handleSaveClass = async () => {
    const errors = validateClassData(classDetails);
    if (Object.keys(errors).length > 0) {
      console.log('Frontend validation errors:', errors);
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const url = selectedClass 
        ? `/api/v1/admin/academic/classes/${selectedClass.id}`
        : '/api/v1/admin/academic/classes';
      
      const requestBody = {
        ...classDetails
      };
      console.log('Request body:', requestBody);
        
      const response = await fetch(url, {
        method: selectedClass ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Server response details:', {
        status: response.status,
        data: data,
        errors: data.errors
      });

      if (!response.ok) {
        if (data.errors) {
          const validationErrors = {};
          data.errors.forEach(error => {
            console.log('Validation error:', error);
            validationErrors[error.path || error.param] = error.msg;
          });
          setFormErrors(validationErrors);
          throw new Error('Validation failed');
        }
        throw new Error(data.message || 'Failed to save class');
      }

      setOpenDialog(false);
      setSelectedClass(null);
      setClassDetails({
        name: '',
        level: '',
        academicYear: '',
        description: '',
        isActive: true
      });
      fetchClasses();
      handleSuccess('Class saved successfully');
    } catch (error) {
      handleError(`Failed to save class: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/academic/classes/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `classes-data.${format}`;
      a.click();
      window.URL.revokeObjectURL(url); // Clean up
    } catch (error) {
      handleError('Error exporting data: ' + error.message);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Classes Management
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddClass}
              sx={{ mr: 1 }}
            >
              Add Class
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExportData('xlsx')}
              sx={{ mr: 1 }}
            >
              Export Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExportData('pdf')}
            >
              Export PDF
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Academic Year</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(classes) && classes.map((classItem) => (
                <TableRow key={classItem.id}>
                  <TableCell>{classItem.name}</TableCell>
                  <TableCell>{classItem.level}</TableCell>
                  <TableCell>{classItem.academicYear}</TableCell>
                  <TableCell>
                    <Chip
                      label={classItem.isActive ? 'Active' : 'Inactive'}
                      color={classItem.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Class">
                      <IconButton onClick={() => handleEditClass(classItem)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Schedule">
                      <IconButton color="primary">
                        <Schedule />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Subjects">
                      <IconButton color="secondary">
                        <MenuBook />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Class">
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteClass(classItem.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
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
            {selectedClass ? 'Edit Class' : 'Add New Class'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Class Name"
                  name="name"
                  value={classDetails.name}
                  onChange={(e) => setClassDetails({ ...classDetails, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!formErrors.level}>
                  <InputLabel>Academic Level</InputLabel>
                  <Select
                    value={classDetails.level}
                    onChange={(e) => setClassDetails({ ...classDetails, level: e.target.value })}
                    label="Academic Level"
                  >
                    {academicLevels.map((level) => (
                      <MenuItem key={level} value={level}>
                        {level}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.level && (
                    <FormHelperText>{formErrors.level}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!formErrors.academicYear}>
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={classDetails.academicYear}
                    onChange={(e) => setClassDetails({ ...classDetails, academicYear: e.target.value })}
                    label="Academic Year"
                  >
                    {academicYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.academicYear && (
                    <FormHelperText>{formErrors.academicYear}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={classDetails.description}
                  onChange={(e) => setClassDetails({ ...classDetails, description: e.target.value })}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveClass}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Classes;
