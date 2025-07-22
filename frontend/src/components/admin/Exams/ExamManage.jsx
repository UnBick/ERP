import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Fab,
  Alert,
  Snackbar,
  Paper,
  Divider,
  Avatar,
  Badge,
  Tooltip,
  CircularProgress,
  Skeleton,
  InputAdornment,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Edit,
  Close,
  Add,
  ArrowBack,
  School,
  AccessTime,
  Grade,
  Class,
  Search,
  FilterList,
  Visibility,
  Delete,
  Save,
  Cancel,
  Assignment,
  Dashboard,
  Settings,
  NavigateNext
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ExamManage = () => {
  const navigate = useNavigate();
  
  // State management
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  
  // Form data state
  const [formData, setFormData] = useState({
    examType: '',
    classes: [],
    duration: '',
    totalMarks: '',
    exceptions: []
  });
  
  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Data states
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  // Notification states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter exams based on search and filter criteria
  useEffect(() => {
    let filtered = exams;
    
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.examType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.shortName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterClass) {
      filtered = filtered.filter(exam =>
        exam.classes.includes(filterClass)
      );
    }
    
    setFilteredExams(filtered);
  }, [exams, searchTerm, filterClass]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Starting API calls...');
      
      const [classesResponse, subjectsResponse, examTypesResponse] = await Promise.all([
        axios.get('/api/exams/classes'),
        axios.get('/api/exams/subjects'),
        axios.get('/api/exams')
      ]);

      console.log('Exam Types Response:', examTypesResponse.data);

      if (examTypesResponse.data.success) {
        const transformedExams = examTypesResponse.data.data.map(exam => ({
          id: exam._id,
          examType: exam.name,
          shortName: exam.shortName,
          duration: exam.duration,
          totalMarks: exam.totalMarks,
          // Defensive: Only map class names if applicableClasses is an array and class object is not null
          classes: Array.isArray(exam.applicableClasses)
            ? exam.applicableClasses.map(c => (c && c.name ? c.name : ''))
            : [],
          exceptions: Array.isArray(exam.exceptions)
            ? exam.exceptions.map(e => ({
                subject: e.subject && e.subject.name ? e.subject.name : (typeof e.subject === 'string' ? e.subject : ''),
                totalMarks: e.totalMarks,
                duration: e.duration
              }))
            : [],
          isActive: exam.isActive,
          academicYear: exam.academicYear
        }));
        setExams(transformedExams);
      }

      if (classesResponse.data.success) {
        const transformedClasses = classesResponse.data.data.map(cls => ({
          id: cls._id,
          name: cls.name,
          level: cls.level
        }));
        setClasses(transformedClasses);
      }

      if (subjectsResponse.data.success) {
        const transformedSubjects = subjectsResponse.data.data.map(sub => ({
          id: sub._id,
          name: sub.name,
          code: sub.code,
          level: sub.level,
          department: sub.department
        }));
        setSubjects(transformedSubjects);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error loading data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const getSubjectsForClass = (classId) => {
    const selectedClass = classes.find(c => c.id === classId);
    if (!selectedClass) return [];
    
    return subjects.filter(subject => 
      subject.level === 'all' || 
      (Array.isArray(subject.level) && subject.level.includes(selectedClass.level))
    );
  };

  const handleClassSelection = (selectedClassIds) => {
    setFormData(prev => ({
      ...prev,
      classes: selectedClassIds,
      exceptions: prev.exceptions.map(exc => ({
        ...exc,
        subject: '' 
      }))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const transformedData = {
        name: formData.examType,
        shortName: formData.examType.substring(0, 3).toUpperCase(),
        totalMarks: parseInt(formData.totalMarks),
        duration: parseInt(formData.duration),
        applicableClasses: formData.classes,
        exceptions: formData.exceptions.map(exc => ({
          subject: exc.subject,
          totalMarks: parseInt(exc.marks),
          duration: parseInt(exc.duration)
        })),
        academicYear: '2024-2025',
        isActive: true
      };

      let response;
      if (isEditing && selectedExam) {
        response = await axios.put(`/api/exams/${selectedExam.id}`, transformedData);
        if (response.data.success) {
          setExams(prevExams => 
            prevExams.map(exam => 
              exam.id === selectedExam.id ? 
              { 
                ...exam,
                examType: transformedData.name,
                shortName: transformedData.shortName,
                duration: transformedData.duration,
                totalMarks: transformedData.totalMarks,
                classes: formData.classes.map(id => 
                  classes.find(c => c.id === id)?.name || ''
                )
              } : exam
            )
          );
          showSnackbar('Exam updated successfully!');
        }
      } else {
        response = await axios.post('/api/exams', transformedData);
        if (response.data.success) {
          setExams(prev => [...prev, response.data.data]);
          showSnackbar('Exam created successfully!');
        }
      }
      
      resetForm();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving exam:', error);
      showSnackbar('Error saving exam. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExam = async () => {
    try {
      const response = await axios.delete(`/api/exams/${selectedExam.id}`);
      if (response.data.success) {
        setExams(prev => prev.filter(exam => exam.id !== selectedExam.id));
        showSnackbar('Exam deleted successfully!');
        setOpenDeleteDialog(false);
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      showSnackbar('Error deleting exam. Please try again.', 'error');
    }
  };

  const handleAddException = () => {
    setFormData(prev => ({
      ...prev,
      exceptions: [...prev.exceptions, { subject: '', marks: '', duration: '' }]
    }));
  };

  const handleRemoveException = (index) => {
    setFormData(prev => ({
      ...prev,
      exceptions: prev.exceptions.filter((_, i) => i !== index)
    }));
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    setOpenDialog(true);
  };

  const handleEdit = () => {
    const transformedFormData = {
      examType: selectedExam.examType,
      classes: classes
        .filter(cls => selectedExam.classes.includes(cls.name))
        .map(cls => cls.id),
      duration: selectedExam.duration.toString(),
      totalMarks: selectedExam.totalMarks.toString(),
      exceptions: selectedExam.exceptions.map(exc => ({
        subject: typeof exc.subject === 'object' ? exc.subject._id : exc.subject,
        marks: exc.totalMarks ? exc.totalMarks.toString() : '',
        duration: exc.duration ? exc.duration.toString() : ''
      }))
    };
    
    setFormData(transformedFormData);
    setIsEditing(true);
    setOpenDialog(false);
    setOpenCreateDialog(true);
  };

  const resetForm = () => {
    setFormData({
      examType: '',
      classes: [],
      duration: '',
      totalMarks: '',
      exceptions: []
    });
    setIsEditing(false);
  };

  const handleCreateExam = () => {
    resetForm();
    setOpenCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    resetForm();
  };

  const handleBack = () => {
    navigate('/admin/exams/schedule');
  };

  const ExamCard = ({ exam }) => (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          borderColor: 'primary.main'
        },
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
      }}
      onClick={() => handleExamClick(exam)}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            <Assignment />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {exam.examType}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {exam.shortName}
            </Typography>
          </Box>
          <Badge 
            badgeContent={exam.classes.length} 
            color="secondary"
            sx={{ '& .MuiBadge-badge': { fontSize: '0.75rem' } }}
          >
            <Class color="action" />
          </Badge>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Duration</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {exam.duration}min
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Grade sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Total Marks</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {exam.totalMarks}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">Classes</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {exam.classes.slice(0, 3).map((className, index) => (
              <Chip 
                key={index}
                label={className}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {exam.classes.length > 3 && (
              <Chip 
                label={`+${exam.classes.length - 3}`}
                size="small"
                color="default"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>
        
        {exam.exceptions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`${exam.exceptions.length} Exception${exam.exceptions.length > 1 ? 's' : ''}`}
              size="small"
              color="warning"
              variant="outlined"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" width="100%" height={60} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ 
      p: 3,
      bgcolor: '#f5f7fa',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton 
              onClick={handleBack} 
              sx={{ 
                mr: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Examination Management
            </Typography>
            <Breadcrumbs 
              separator={<NavigateNext fontSize="small" />}
              sx={{ color: 'rgba(255,255,255,0.8)' }}
            >
              <Link color="inherit" href="/admin/exams/schedule" underline="hover">
                <School sx={{ mr: 0.5, fontSize: 16 }} />
                Exams
              </Link>
              <Typography color="inherit">Manage</Typography>
            </Breadcrumbs>
          </Box>
        </Box>
      </Paper>

      {/* Search and Filter Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search examinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Class</InputLabel>
              <Select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1, color: 'action.active' }} />}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">All Classes</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.name}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary" align="center">
              {filteredExams.length} exam{filteredExams.length !== 1 ? 's' : ''} found
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Exams Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : filteredExams.length > 0 ? (
        <Grid container spacing={3}>
          {filteredExams.map((exam) => (
            <Grid item xs={12} sm={6} md={4} key={exam.id}>
              <ExamCard exam={exam} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'divider'
          }}
        >
          <Assignment sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No examinations found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || filterClass ? 
              'Try adjusting your search or filter criteria' : 
              'Create your first examination to get started'
            }
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleCreateExam}
            sx={{ borderRadius: 2 }}
          >
            Create New Exam
          </Button>
        </Paper>
      )}

      {/* Floating Action Button */}
      <Tooltip title="Create New Exam">
        <Fab
          color="primary"
          aria-label="add"
          sx={{ 
            position: 'fixed', 
            bottom: 24, 
            right: 24,
            width: 64,
            height: 64,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={handleCreateExam}
        >
          <Add fontSize="large" />
        </Fab>
      </Tooltip>

      {/* Exam Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Visibility />
              </Avatar>
              <Box>
                <Typography variant="h6">Examination Details</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedExam?.examType}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setOpenDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedExam && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedExam.examType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Short Name: {selectedExam.shortName}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                  <AccessTime sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Duration</Typography>
                    <Typography variant="h6">{selectedExam.duration} minutes</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                  <Grade sx={{ mr: 2, color: 'success.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Marks</Typography>
                    <Typography variant="h6">{selectedExam.totalMarks}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Applicable Classes
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedExam.classes.map((className, index) => (
                    <Chip 
                      key={index}
                      label={className}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
              
              {selectedExam.exceptions.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Subject Exceptions
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedExam.exceptions.map((exception, index) => (
                      <Grid item xs={12} key={index}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {exception.subject}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Marks: {exception.totalMarks} | Duration: {exception.duration} minutes
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{ borderRadius: 2 }}
          >
            Edit Exam
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<Delete />}
            onClick={() => setOpenDeleteDialog(true)}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
          <Button 
            variant="contained"
            onClick={() => setOpenDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Exam Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: isEditing ? 'warning.main' : 'primary.main', mr: 2 }}>
                {isEditing ? <Edit /> : <Add />}
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {isEditing ? 'Edit Examination' : 'Create New Examination'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isEditing ? 'Update exam details' : 'Define exam parameters and settings'}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Examination Type"
                  value={formData.examType}
                  onChange={(e) => setFormData({...formData, examType: e.target.value})}
                  required
                  placeholder="e.g., Mid-term, Final, Unit Test"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Applicable Classes</InputLabel>
                  <Select
                    multiple
                    value={formData.classes}
                    onChange={(e) => handleClassSelection(e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const cls = classes.find(c => c.id === value);
                          return <Chip key={value} label={cls ? cls.name : value} size="small" />;
                        })}
                      </Box>
                    )}
                    sx={{ borderRadius: 2 }}
                  >
                    {classes.length > 0 ? (
                      classes.map((cls) => (
                        <MenuItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.level})
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No classes available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Duration (minutes)"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime />
                      </InputAdornment>
                    )
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Total Marks"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({...formData, totalMarks: e.target.value})}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Grade />
                      </InputAdornment>
                    )
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              {/* Exceptions Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Subject Exceptions
                </Typography>
                {formData.exceptions.map((exception, idx) => (
                  <Grid container spacing={2} key={idx} sx={{ mb: 1 }}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Subject</InputLabel>
                        <Select
                          value={exception.subject}
                          onChange={e => {
                            const newExceptions = [...formData.exceptions];
                            newExceptions[idx].subject = e.target.value;
                            setFormData(prev => ({ ...prev, exceptions: newExceptions }));
                          }}
                          label="Subject"
                        >
                          <MenuItem value="">Select Subject</MenuItem>
                          {subjects.map(sub => (
                            <MenuItem key={sub.id} value={sub.name}>{sub.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Marks"
                        value={exception.marks}
                        onChange={e => {
                          const newExceptions = [...formData.exceptions];
                          newExceptions[idx].marks = e.target.value;
                          setFormData(prev => ({ ...prev, exceptions: newExceptions }));
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Duration (min)"
                        value={exception.duration}
                        onChange={e => {
                          const newExceptions = [...formData.exceptions];
                          newExceptions[idx].duration = e.target.value;
                          setFormData(prev => ({ ...prev, exceptions: newExceptions }));
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        color="error"
                        variant="outlined"
                        size="small"
                        onClick={() => handleRemoveException(idx)}
                        startIcon={<Delete />}
                        sx={{ borderRadius: 2 }}
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleAddException}
                  startIcon={<Add />}
                  sx={{ mt: 1, borderRadius: 2 }}
                >
                  Add Exception
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} color="secondary" sx={{ borderRadius: 2 }} startIcon={<Cancel />}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : <Save />}
              sx={{ borderRadius: 2 }}
            >
              {saving ? 'Saving...' : isEditing ? 'Update Exam' : 'Create Exam'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Examination</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this examination?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">Cancel</Button>
          <Button onClick={handleDeleteExam} color="error" variant="contained" startIcon={<Delete />}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default ExamManage;