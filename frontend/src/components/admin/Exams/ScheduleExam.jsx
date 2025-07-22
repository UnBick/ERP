import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Paper,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Skeleton,
  Fade,
  Slide,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Tooltip,
  LinearProgress,
  Snackbar
} from '@mui/material';
import { 
  ArrowBack, 
  Schedule, 
  Assignment, 
  Class, 
  AccessTime, 
  CheckCircle,
  School,
  CalendarMonth,
  Save,
  Preview
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';

// Mock data for demonstration
const mockExamTypes = [
  {
    id: '1',
    examType: 'Midterm Examination',
    classes: ['Class 10', 'Class 11', 'Class 12'],
    exceptions: [],
    duration: 180
  },
  {
    id: '2',
    examType: 'Final Examination',
    classes: ['Class 9', 'Class 10', 'Class 11'],
    exceptions: [],
    duration: 120
  },
  {
    id: '3',
    examType: 'Unit Test',
    classes: ['Class 8', 'Class 9', 'Class 10'],
    exceptions: [],
    duration: 90
  }
];

const mockSubjects = [
  { id: '1', name: 'Mathematics', duration: 180 },
  { id: '2', name: 'Physics', duration: 180 },
  { id: '3', name: 'Chemistry', duration: 180 },
  { id: '4', name: 'Biology', duration: 180 },
  { id: '5', name: 'English', duration: 180 }
];

const ScheduleExam = () => {
  const navigate = useNavigate();
  const [examTypes, setExamTypes] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExamTypes();
  }, []);

  // Fetch exam types from backend (ensure correct API and data mapping)
  const fetchExamTypes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/exams', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error fetching exam types');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        // Map backend data to expected structure for dropdown
        setExamTypes(
          data.data.map(exam => ({
            id: exam._id,
            examType: exam.name || exam.examType || '',
            classes: Array.isArray(exam.applicableClasses)
              ? exam.applicableClasses.map(c => (c && c.name ? c.name : ''))
              : [],
            exceptions: exam.exceptions || [],
            duration: exam.duration || 60
          }))
        );
      } else {
        setExamTypes([]);
        setError(data.message || 'No exam types found');
      }
    } catch (error) {
      setError('Error fetching exam types');
      setExamTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes for selected exam type
  const handleExamTypeChange = async (examId) => {
    try {
      // Use .id for frontend, ._id for backend data
      const exam = examTypes.find(e => e.id === examId || e._id === examId);
      setSelectedExam(exam || null);
      setSelectedClass('');
      setSubjects([]);
      setSchedule([]);
      setActiveStep(1);
    } catch (error) {
      setError('Error setting exam type');
    }
  };

  // Fetch subjects for selected class (ensure correct API and data mapping)
  const handleClassChange = async (classId) => {
    try {
      setSelectedClass(classId);
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/exams/subjects?classId=${classId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error fetching subjects');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setSubjects(
          data.data.map(subject => ({
            ...subject,
            duration: selectedExam?.duration || 60,
            date: null,
            startTime: null,
            endTime: null
          }))
        );
        setSchedule(
          data.data.map(subject => ({
            ...subject,
            duration: selectedExam?.duration || 60,
            date: null,
            startTime: null,
            endTime: null
          }))
        );
        setActiveStep(2);
      } else {
        setSubjects([]);
        setSchedule([]);
        setError(data.message || 'No subjects found');
      }
    } catch (error) {
      setError('Error fetching subjects');
      setSubjects([]);
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateTimeChange = () => {
    if (selectedDate && selectedTime) {
      setActiveStep(3);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        setError('Please select both date and time for the exam');
        return;
      }
      setLoading(true);

      const formattedSchedule = schedule.map(item => ({
        ...item,
        date: selectedDate,
        startTime: selectedTime,
        endTime: new Date(selectedTime.getTime() + item.duration * 60000)
      }));

      // Save schedule to backend
      const token = localStorage.getItem('token');
      const response = await fetch('/api/exams/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          examId: selectedExam?._id,
          classId: selectedClass,
          schedule: formattedSchedule
        })
      });
      if (!response.ok) throw new Error('Error saving schedule');
      const data = await response.json();
      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/admin/exams/schedule');
        }, 2000);
      } else {
        setError(data.message || 'Error saving schedule');
      }
    } catch (error) {
      setError('Error creating schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/exams/schedule');
  };

  const steps = [
    { label: 'Select Exam Type', icon: Assignment },
    { label: 'Choose Class', icon: Class },
    { label: 'Set Date & Time', icon: AccessTime },
    { label: 'Review & Save', icon: CheckCircle }
  ];

  const StepIcon = ({ step, active }) => {
    const IconComponent = steps[step].icon;
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: active ? 'primary.main' : 'grey.300',
          color: active ? 'white' : 'grey.600',
          transition: 'all 0.3s ease',
          boxShadow: active ? '0 4px 12px rgba(25, 118, 210, 0.3)' : 'none'
        }}
      >
        <IconComponent fontSize="small" />
      </Box>
    );
  };

  return (
    <Box sx={{ 
      p: 3,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 25% 25%, #fff 2px, transparent 2px)',
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Header */}
      <Slide direction="down" in={true} mountOnEnter unmountOnExit>
        <Card sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Go back">
                <IconButton 
                  onClick={handleBack}
                  sx={{ 
                    mr: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ArrowBack />
                </IconButton>
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ 
                    color: 'primary.main',
                    fontWeight: 700,
                    letterSpacing: '0.5px'
                  }}>
                    Schedule Examination
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Create and manage examination schedules efficiently
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Slide>

      {/* Progress Steps */}
      <Fade in={true} timeout={800}>
        <Card sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {steps.map((step, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <StepIcon step={index} active={index <= activeStep} />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography variant="body2" sx={{ 
                      fontWeight: index <= activeStep ? 600 : 400,
                      color: index <= activeStep ? 'primary.main' : 'text.secondary'
                    }}>
                      {step.label}
                    </Typography>
                  </Box>
                  {index < steps.length - 1 && (
                    <Divider 
                      sx={{ 
                        flex: 1, 
                        mx: 2,
                        borderColor: index < activeStep ? 'primary.main' : 'grey.300',
                        transition: 'all 0.3s ease'
                      }} 
                    />
                  )}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} lg={8}>
          <Fade in={true} timeout={1000}>
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  {/* Exam Type Selection */}
                  <Grid item xs={12} md={6}>
                    <FormControl 
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          },
                          '&.Mui-focused': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                          }
                        }
                      }}
                    >
                      <InputLabel>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Assignment sx={{ mr: 1, fontSize: 20 }} />
                          Exam Type
                        </Box>
                      </InputLabel>
                      <Select
                        value={selectedExam?.id || selectedExam?._id || ''}
                        onChange={(e) => handleExamTypeChange(e.target.value)}
                        disabled={loading}
                      >
                        {loading ? (
                          <MenuItem disabled>
                            <Skeleton width={200} />
                          </MenuItem>
                        ) : (
                          examTypes.map((exam) => (
                            <MenuItem key={exam.id || exam._id} value={exam.id || exam._id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Typography>{exam.examType}</Typography>
                                <Chip 
                                  label={`${exam.duration} min`} 
                                  size="small" 
                                  color="primary" 
                                  variant="outlined"
                                />
                              </Box>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Class Selection */}
                  {selectedExam && (
                    <Grid item xs={12} md={6}>
                      <Slide direction="left" in={true} mountOnEnter unmountOnExit>
                        <FormControl 
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              },
                              '&.Mui-focused': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                              }
                            }
                          }}
                        >
                          <InputLabel>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <School sx={{ mr: 1, fontSize: 20 }} />
                              Class
                            </Box>
                          </InputLabel>
                          <Select
                            value={selectedClass}
                            onChange={(e) => handleClassChange(e.target.value)}
                            disabled={loading}
                          >
                            {selectedExam.classes.map((cls) => (
                              <MenuItem key={cls} value={cls}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Class sx={{ mr: 1, color: 'primary.main' }} />
                                  {cls}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Slide>
                    </Grid>
                  )}

                  {/* Date and Time Selection */}
                  {selectedExam && selectedClass && (
                    <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                      <Grid container spacing={3} sx={{ mt: 2, px: 3 }}>
                        <Grid item xs={12} md={6}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CalendarMonth sx={{ mr: 1, fontSize: 20 }} />
                                  Exam Date
                                </Box>
                              }
                              value={selectedDate}
                              onChange={(date) => {
                                setSelectedDate(date);
                                handleDateTimeChange();
                              }}
                              renderInput={(params) => 
                                <TextField 
                                  {...params} 
                                  fullWidth 
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                      },
                                      '&.Mui-focused': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                                      }
                                    }
                                  }}
                                />
                              }
                              minDate={new Date()}
                            />
                          </LocalizationProvider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <TimePicker
                              label={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AccessTime sx={{ mr: 1, fontSize: 20 }} />
                                  Start Time
                                </Box>
                              }
                              value={selectedTime}
                              onChange={(time) => {
                                setSelectedTime(time);
                                handleDateTimeChange();
                              }}
                              renderInput={(params) => 
                                <TextField 
                                  {...params} 
                                  fullWidth 
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                      },
                                      '&.Mui-focused': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                                      }
                                    }
                                  }}
                                />
                              }
                              minutesStep={5}
                            />
                          </LocalizationProvider>
                        </Grid>
                      </Grid>
                    </Slide>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Summary Section */}
        <Grid item xs={12} lg={4}>
          <Fade in={!!selectedExam} timeout={1000}>
            <Card sx={{ 
              borderRadius: 3,
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'sticky',
              top: 20
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Preview sx={{ mr: 1 }} />
                  Summary
                </Typography>
                
                {selectedExam && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Exam Type</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedExam.examType}
                    </Typography>
                  </Box>
                )}

                {selectedClass && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Class</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedClass}
                    </Typography>
                  </Box>
                )}

                {selectedDate && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Date</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedDate.toLocaleDateString()}
                    </Typography>
                  </Box>
                )}

                {selectedTime && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Time</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedTime.toLocaleTimeString()}
                    </Typography>
                  </Box>
                )}

                {subjects.length > 0 && (
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>Subjects</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {subjects.length} subjects
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* Schedule Preview */}
      {subjects.length > 0 && selectedDate && selectedTime && (
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Card sx={{ 
            mt: 4,
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: 'primary.main',
                fontWeight: 600
              }}>
                <Schedule sx={{ mr: 2 }} />
                Schedule Preview
              </Typography>
              
              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>
                        Subject
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>
                        Date
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>
                        Start Time
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>
                        End Time
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: 'primary.main', color: 'white' }}>
                        Duration
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedule.map((subject, index) => {
                      const endTime = new Date(selectedTime.getTime() + subject.duration * 60000);
                      return (
                        <TableRow 
                          key={subject.id}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: 'rgba(25, 118, 210, 0.04)',
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>{subject.name}</TableCell>
                          <TableCell>{selectedDate?.toLocaleDateString()}</TableCell>
                          <TableCell>{selectedTime?.toLocaleTimeString()}</TableCell>
                          <TableCell>{endTime.toLocaleTimeString()}</TableCell>
                          <TableCell>
                            <Chip 
                              label={`${subject.duration} min`} 
                              size="small" 
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Slide>
      )}

      {/* Action Buttons */}
      {subjects.length > 0 && selectedDate && selectedTime && (
        <Fade in={true} timeout={1200}>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                borderRadius: 3,
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 32px rgba(25, 118, 210, 0.4)',
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
                },
                '&:disabled': {
                  background: 'grey.300'
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress sx={{ mr: 2, width: 100 }} />
                  Processing...
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Save sx={{ mr: 2 }} />
                  Save Schedule
                </Box>
              )}
            </Button>
          </Box>
        </Fade>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Schedule created successfully! Redirecting...
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScheduleExam;