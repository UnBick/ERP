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
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { getApiUrl } from '../../../config/apiConfig';

const ScheduleExam = () => {
  const navigate = useNavigate();
  const [examTypes, setExamTypes] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    fetchExamTypes();
  }, []);

  const fetchExamTypes = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/exams'));
      console.log('Exam types response:', response.data);

      if (response.data.success) {
        const transformedExams = response.data.data.map(exam => ({
          id: exam._id,
          examType: exam.name,
          classes: exam.applicableClasses.map(c => c.name || ''),
          exceptions: exam.exceptions || []
        }));
        setExamTypes(transformedExams);
      }
    } catch (error) {
      console.error('Error fetching exam types:', error);
    }
  };

  const handleExamTypeChange = async (examId) => {
    try {
      const exam = examTypes.find(e => e.id === examId);
      setSelectedExam(exam);
      setSelectedClass('');
      setSubjects([]);
      setSchedule([]);
    } catch (error) {
      console.error('Error setting exam type:', error);
    }
  };

  const handleClassChange = async (classId) => {
    try {
      setSelectedClass(classId);
      const response = await axios.get(getApiUrl(`/api/v1/subjects/${classId}`));
      const subjectsWithSchedule = response.data.map(subject => {
        const exception = selectedExam.exceptions.find(e => e.subject === subject.id);
        return {
          ...subject,
          duration: exception ? exception.duration : selectedExam.duration,
          date: null,
          startTime: null,
          endTime: null
        };
      });
      setSubjects(subjectsWithSchedule);
      setSchedule(subjectsWithSchedule);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        alert('Please select both date and time for the exam');
        return;
      }

      const formattedSchedule = schedule.map(item => ({
        ...item,
        date: selectedDate,
        startTime: selectedTime,
        endTime: new Date(selectedTime.getTime() + item.duration * 60000)
      }));

      const response = await axios.post(getApiUrl('/api/v1/exam-schedule'), {
        examId: selectedExam.id,
        classId: selectedClass,
        schedule: formattedSchedule
      });

      if (response.data.success) {
        alert('Schedule created successfully');
        navigate('/admin/exams/schedule');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.message || 'Invalid schedule. Please check your inputs.');
      } else {
        alert('Error creating schedule. Please try again.');
      }
      console.error('Error saving schedule:', error);
    }
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
          Schedule Examination
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl 
            fullWidth
            sx={{
              bgcolor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                }
              }
            }}
          >
            <InputLabel>Exam Type</InputLabel>
            <Select
              value={selectedExam?.id || ''}
              onChange={(e) => handleExamTypeChange(e.target.value)}
            >
              {Array.isArray(examTypes) && examTypes.length > 0 ? (
                examTypes.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.examType}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No exam types available</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>

        {selectedExam && (
          <Grid item xs={12} md={6}>
            <FormControl 
              fullWidth
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }}
            >
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
              >
                {selectedExam.classes.map((cls) => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {selectedExam && selectedClass && (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Exam Date"
                  value={selectedDate}
                  onChange={setSelectedDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={new Date()} // Cannot select past dates
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Start Time"
                  value={selectedTime}
                  onChange={setSelectedTime}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minutesStep={5}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        )}

        {subjects.length > 0 && selectedDate && selectedTime && (
          <Paper sx={{ 
            mt: 3, 
            p: 3,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            bgcolor: 'white'
          }}>
            <Typography variant="h6" gutterBottom>Schedule Preview</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>End Time</TableCell>
                    <TableCell>Duration (mins)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule.map((subject) => {
                    const endTime = new Date(selectedTime.getTime() + subject.duration * 60000);
                    return (
                      <TableRow key={subject.id}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{selectedDate?.toLocaleDateString()}</TableCell>
                        <TableCell>{selectedTime?.toLocaleTimeString()}</TableCell>
                        <TableCell>{endTime.toLocaleTimeString()}</TableCell>
                        <TableCell>{subject.duration}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Grid>

      {subjects.length > 0 && selectedDate && selectedTime && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            sx={{
              mt: 3,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
              }
            }}
            onClick={handleSubmit}
          >
            Save Schedule
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ScheduleExam;
