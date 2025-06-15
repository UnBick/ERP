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
} from '@mui/material';
import { Edit, Close, Add, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ExamManage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    examType: '',
    classes: [],
    duration: '',
    totalMarks: '',
    exceptions: []
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
            classes: exam.applicableClasses.map(c => c.name || ''),
            exceptions: exam.exceptions.map(e => ({
              subject: e.subject.name || '',
              totalMarks: e.totalMarks,
              duration: e.duration
            }))
          }));
          console.log('Transformed Exams:', transformedExams);
          setExams(transformedExams);
        }

        console.log('API Responses:', {
          classes: classesResponse.data,
          subjects: subjectsResponse.data
        });

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
        console.error('Error details:', {
          message: error.message,
          config: error.config,
          status: error.response?.status,
          data: error.response?.data
        });
      }
    };
    fetchData();
  }, []);

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
    console.log('Submitting form data:', formData);

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

      if (isEditing && selectedExam) {
        console.log('Updating exam:', selectedExam.id, transformedData);
        const response = await axios.put(`/api/exams/${selectedExam.id}`, transformedData);
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
        }
      } else {
        console.log('Sending transformed data:', transformedData);
        const response = await axios.post('/api/exams', transformedData);
        console.log('Create exam response:', response.data);
        if (response.data.success) {
          setExams([...exams, response.data.data]);
          resetForm();
          handleCloseDialog();
        }
      }
      resetForm();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving exam:', error);
    }
  };

  const handleAddException = () => {
    setFormData({
      ...formData,
      exceptions: [...formData.exceptions, { subject: '', marks: '', duration: '' }]
    });
  };

  const handleExamClick = (exam) => {
    setSelectedExam(exam);
    setOpenDialog(true);
  };

  const handleEdit = () => {
    console.log('Selected Exam for editing:', selectedExam);
    
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
    
    console.log('Transformed form data:', transformedFormData);
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
    setOpenCreateDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    resetForm();
  };

  const handleBack = () => {
    navigate('/admin/exams/schedule');
  };

  return (
    <Box sx={{ 
      p: 3,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <IconButton 
          onClick={handleBack} 
          sx={{ 
            mr: 2,
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: 'grey.100',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ 
          color: '#1a237e',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
        }}>
          Manage Examinations
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {exams.length > 0 ? (
          exams.map((exam) => (
            <Grid item xs={12} sm={6} md={4} key={exam.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    bgcolor: '#f8f9fa'
                  }
                }}
                onClick={() => handleExamClick(exam)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {exam.examType}
                  </Typography>
                  <Typography color="textSecondary">
                    Duration: {exam.duration} minutes
                  </Typography>
                  <Typography color="textSecondary">
                    Total Marks: {exam.totalMarks}
                  </Typography>
                  <Typography color="textSecondary" sx={{ mt: 1 }}>
                    Short Name: {exam.shortName}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary" align="center">
              No exams found. Click the + button to add a new exam.
            </Typography>
          </Grid>
        )}
      </Grid>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
          },
          transition: 'all 0.3s ease'
        }}
        onClick={handleCreateExam}
      >
        <Add />
      </Fab>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle>
          Exam Details
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={() => setOpenDialog(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedExam && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedExam.examType}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography>
                  Classes: {Array.isArray(selectedExam.classes) ? selectedExam.classes.join(', ') : ''}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Duration: {selectedExam.duration} minutes</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Total Marks: {selectedExam.totalMarks}</Typography>
              </Grid>
              {selectedExam.exceptions.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2 }}>Exceptions</Typography>
                  {selectedExam.exceptions.map((exception, index) => (
                    <Box key={index} sx={{ mt: 1 }}>
                      <Typography>
                        {exception.subject} - Marks: {exception.totalMarks}, 
                        Duration: {exception.duration} minutes
                      </Typography>
                    </Box>
                  ))}
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleEdit()}>Edit</Button>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openCreateDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle>
          {isEditing ? 'Edit Examination' : 'Create New Examination'}
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={handleCloseDialog}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Exam Type"
                  value={formData.examType}
                  onChange={(e) => setFormData({...formData, examType: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Classes</InputLabel>
                  <Select
                    multiple
                    value={formData.classes}
                    onChange={(e) => handleClassSelection(e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const cls = classes.find(c => c.id === value);
                          return <Chip key={value} label={cls ? cls.name : value} />;
                        })}
                      </Box>
                    )}
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
                />
              </Grid>
            </Grid>

            {formData.exceptions.map((exception, index) => (
              <Grid container spacing={2} sx={{ mt: 2 }} key={index}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Subject</InputLabel>
                    <Select
                      value={exception.subject}
                      onChange={(e) => {
                        const newExceptions = [...formData.exceptions];
                        newExceptions[index].subject = e.target.value;
                        setFormData({...formData, exceptions: newExceptions});
                      }}
                    >
                      {formData.classes.length > 0 && 
                        [...new Set(
                          formData.classes.flatMap(classId => 
                            getSubjectsForClass(classId)
                          )
                        )].map((subject) => (
                          <MenuItem key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Marks"
                    value={exception.marks}
                    onChange={(e) => {
                      const newExceptions = [...formData.exceptions];
                      newExceptions[index].marks = e.target.value;
                      setFormData({...formData, exceptions: newExceptions});
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Duration"
                    value={exception.duration}
                    onChange={(e) => {
                      const newExceptions = [...formData.exceptions];
                      newExceptions[index].duration = e.target.value;
                      setFormData({...formData, exceptions: newExceptions});
                    }}
                  />
                </Grid>
              </Grid>
            ))}

            <Button
              startIcon={<Add />}
              onClick={handleAddException}
              sx={{ mt: 2 }}
            >
              Add Exception
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {isEditing ? 'Submit' : 'Create Exam'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ExamManage;
