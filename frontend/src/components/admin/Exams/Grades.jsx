// src/components/admin/exams/Grades.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Stack,
  Grid,
  Divider,
  alpha,
} from '@mui/material';
import { 
  Add, 
  Delete, 
  Edit, 
  ArrowBack, 
  GradeOutlined,
  TrendingUp,
  School,
  Assessment,
  Warning,
  CheckCircle,
  Cancel
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Grades = () => {
  const navigate = useNavigate();
  const [gradingSystem, setGradingSystem] = useState('letter');
  const [grades, setGrades] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentGrade, setCurrentGrade] = useState({
    grade: '',
    minMarks: '',
    maxMarks: '',
    gpaValue: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/exams/exam-grades');
      setGrades(response.data?.data || []);
    } catch (error) {
      showSnackbar('Error fetching grades', 'error');
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const validateGrade = () => {
    const newErrors = {};
    
    if (!currentGrade.grade.trim()) {
      newErrors.grade = 'Grade is required';
    }
    
    if (!currentGrade.minMarks || currentGrade.minMarks < 0 || currentGrade.minMarks > 100) {
      newErrors.minMarks = 'Minimum marks must be between 0 and 100';
    }
    
    if (!currentGrade.maxMarks || currentGrade.maxMarks < 0 || currentGrade.maxMarks > 100) {
      newErrors.maxMarks = 'Maximum marks must be between 0 and 100';
    }
    
    if (currentGrade.minMarks && currentGrade.maxMarks && 
        parseFloat(currentGrade.minMarks) >= parseFloat(currentGrade.maxMarks)) {
      newErrors.maxMarks = 'Maximum marks must be greater than minimum marks';
    }
    
    if (!currentGrade.gpaValue || currentGrade.gpaValue < 0 || currentGrade.gpaValue > 10) {
      newErrors.gpaValue = 'GPA value must be between 0 and 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGrade = () => {
    setCurrentGrade({
      grade: '',
      minMarks: '',
      maxMarks: '',
      gpaValue: ''
    });
    setErrors({});
    setOpenDialog(true);
  };

  const handleSaveGrade = async () => {
    if (!validateGrade()) return;

    setLoading(true);
    try {
      const gradeData = {
        grade: currentGrade.grade,
        minMarks: parseFloat(currentGrade.minMarks),
        maxMarks: parseFloat(currentGrade.maxMarks),
        gpaValue: parseFloat(currentGrade.gpaValue)
      };

      if (currentGrade.id) {
        await axios.put(`/api/exams/exam-grades/${currentGrade.id}`, gradeData);
        showSnackbar('Grade updated successfully');
      } else {
        await axios.post('/api/exams/exam-grades', gradeData);
        showSnackbar('Grade added successfully');
      }
      
      await fetchGrades();
      setOpenDialog(false);
    } catch (error) {
      if (error.response?.status === 400) {
        showSnackbar(error.response.data.message, 'error');
      } else {
        showSnackbar('Error saving grade. Please try again.', 'error');
      }
      console.error('Error saving grade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGrade = (grade) => {
    setCurrentGrade(grade);
    setErrors({});
    setOpenDialog(true);
  };

  const handleDeleteClick = (grade) => {
    setGradeToDelete(grade);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!gradeToDelete) return;

    setLoading(true);
    try {
      await axios.delete(`/api/exams/exam-grades/${gradeToDelete.id}`);
      showSnackbar('Grade deleted successfully');
      await fetchGrades();
    } catch (error) {
      showSnackbar('Error deleting grade', 'error');
      console.error('Error deleting grade:', error);
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setGradeToDelete(null);
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': '#4caf50', 'A': '#4caf50', 'A-': '#8bc34a',
      'B+': '#cddc39', 'B': '#ffeb3b', 'B-': '#ffc107',
      'C+': '#ff9800', 'C': '#ff5722', 'C-': '#f44336',
      'D': '#9c27b0', 'F': '#607d8b'
    };
    return colors[grade] || '#2196f3';
  };

  const getGradingSystemStats = () => {
    const totalGrades = grades.length;
    const avgGPA = grades.reduce((sum, grade) => sum + grade.gpaValue, 0) / totalGrades || 0;
    const highestGPA = Math.max(...grades.map(g => g.gpaValue), 0);
    
    return { totalGrades, avgGPA: avgGPA.toFixed(2), highestGPA };
  };

  const stats = getGradingSystemStats();

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GradeOutlined sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            Grade Configuration
          </Typography>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg,rgb(166, 178, 231) 0%, #764ba2 100%) !important',
            color: '#fff !important',
            boxShadow: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>Total Grades</Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ color: '#fff' }}>{grades.length}</Typography>
                </Box>
                <Assessment sx={{ fontSize: 48, opacity: 0.8, color: '#fff' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Configuration Card */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GradeOutlined color="primary" />
            Grading System Configuration
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Grading System</InputLabel>
                <Select
                  value={gradingSystem}
                  onChange={(e) => setGradingSystem(e.target.value)}
                  sx={{ bgcolor: 'white' }}
                >
                  <MenuItem value="letter">Letter Grades (A, B, C...)</MenuItem>
                  <MenuItem value="cgpa">CGPA (0.0 - 10.0)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddGrade}
                size="large"
                sx={{ 
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold'
                }}
              >
                Add Grade Range
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment color="primary" />
            Grade Ranges
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: 'grey.50' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Grade</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Minimum Marks (%)</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Maximum Marks (%)</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                      {gradingSystem === 'cgpa' ? 'CGPA Value' : 'Grade Points'}
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.map((grade) => (
                    <TableRow 
                      key={grade.id} 
                      sx={{ 
                        '&:hover': { bgcolor: alpha('#2196f3', 0.05) },
                        '&:nth-of-type(odd)': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                      }}
                    >
                      <TableCell>
                        <Chip 
                          label={grade.grade}
                          sx={{ 
                            bgcolor: getGradeColor(grade.grade),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>{grade.minMarks}%</TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>{grade.maxMarks}%</TableCell>
                      <TableCell sx={{ fontWeight: 'medium' }}>{grade.gpaValue}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit Grade">
                            <IconButton 
                              onClick={() => handleEditGrade(grade)}
                              sx={{ 
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' }
                              }}
                              size="small"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Grade">
                            <IconButton 
                              onClick={() => handleDeleteClick(grade)}
                              sx={{ 
                                bgcolor: 'error.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'error.dark' }
                              }}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {grades.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                          No grades configured yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Click "Add Grade Range" to get started
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Grade Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <GradeOutlined />
          {currentGrade.id ? 'Edit Grade Range' : 'Add Grade Range'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Grade"
                value={currentGrade.grade}
                onChange={(e) => setCurrentGrade({...currentGrade, grade: e.target.value})}
                fullWidth
                error={!!errors.grade}
                helperText={errors.grade}
                sx={{ bgcolor: 'grey.50' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={gradingSystem === 'cgpa' ? 'CGPA Value' : 'Grade Points'}
                type="number"
                value={currentGrade.gpaValue}
                onChange={(e) => setCurrentGrade({...currentGrade, gpaValue: e.target.value})}
                fullWidth
                error={!!errors.gpaValue}
                helperText={errors.gpaValue}
                sx={{ bgcolor: 'grey.50' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Minimum Marks (%)"
                type="number"
                value={currentGrade.minMarks}
                onChange={(e) => setCurrentGrade({...currentGrade, minMarks: e.target.value})}
                fullWidth
                error={!!errors.minMarks}
                helperText={errors.minMarks}
                sx={{ bgcolor: 'grey.50' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Maximum Marks (%)"
                type="number"
                value={currentGrade.maxMarks}
                onChange={(e) => setCurrentGrade({...currentGrade, maxMarks: e.target.value})}
                fullWidth
                error={!!errors.maxMarks}
                helperText={errors.maxMarks}
                sx={{ bgcolor: 'grey.50' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            startIcon={<Cancel />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveGrade} 
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <CheckCircle />}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Grade'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'error.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Warning />
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography>
            Are you sure you want to delete the grade "{gradeToDelete?.grade}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Grades;