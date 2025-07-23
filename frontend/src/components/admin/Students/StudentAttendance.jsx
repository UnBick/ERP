// frontend/src/components/admin/Students/StudentAttendance.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  ButtonGroup,
  Avatar,
  Chip,
  Card,
  CardContent,
  Fade,
  Zoom,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useStudent } from './context/StudentContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  CheckCircle,
  Cancel,
  Schedule,
  Save,
  Analytics,
  Group,
  School,
  Today
} from '@mui/icons-material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Styled Components
const AttendanceWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: '0 20px 40px 0 rgba(31, 38, 135, 0.2)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  background: 'rgba(255, 255, 255, 0.95)'
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[8]
  }
}));

const StyledTable = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  '& .MuiTableCell-head': {
    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold',
    fontSize: '1rem'
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.2s',
    '&:nth-of-type(odd)': {
      backgroundColor: 'rgba(102, 126, 234, 0.04)'
    },
    '&:hover': {
      backgroundColor: 'rgba(102, 126, 234, 0.08)',
      transform: 'scale(1.01)'
    }
  }
}));

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px) scale(1.02)',
    boxShadow: theme.shadows[12]
  }
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)'
}));

const StudentAttendance = () => {
  // Initialize with fallback if useStudent hook fails
  const studentContext = useStudent ? useStudent() : { currentUser: null, currentDate: new Date().toISOString() };
  const { currentUser, currentDate } = studentContext || { currentUser: null, currentDate: new Date().toISOString() };
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date(currentDate || new Date()));
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [statistics, setStatistics] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
  });
  const [bulkAction, setBulkAction] = useState('present');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    severity: 'info',
    message: ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSections();
      setSelectedSection(''); // Reset section when class changes
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    calculateStatistics();
  }, [attendance]);

  const showAlert = (severity, message) => {
    setAlert({
      open: true,
      severity,
      message
    });
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/v1/admin/academic/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();
      if (data.success) {
        setClasses(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      showAlert('error', 'Failed to load classes: ' + error.message);
      setClasses([]); // Ensure classes is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`/api/v1/admin/academic/sections/class/${selectedClass}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();
      if (data.success) {
        setSections(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || 'Failed to fetch sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      showAlert('error', 'Failed to load sections: ' + error.message);
      setSections([]); // Ensure sections is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        `/api/v1/admin/attendance/students?classId=${selectedClass}&sectionId=${selectedSection}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();
      if (data.success) {
        const studentList = Array.isArray(data.data) ? data.data : [];
        setStudents(studentList);
        initializeAttendance(studentList);
        showAlert('success', `Loaded ${studentList.length} students successfully`);
      } else {
        throw new Error(data.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showAlert('error', 'Failed to load students: ' + error.message);
      setStudents([]); // Ensure students is always an array
    } finally {
      setLoading(false);
    }
  };

  const initializeAttendance = (studentList) => {
    const initialAttendance = {};
    if (Array.isArray(studentList)) {
      studentList.forEach(student => {
        if (student && student.id) {
          initialAttendance[student.id] = 'present';
        }
      });
    }
    setAttendance(initialAttendance);
  };

  const handleAttendanceChange = (studentId, value) => {
    if (!studentId) return;
    
    setAttendance(prev => ({
      ...prev,
      [studentId]: value || 'present'
    }));
  };

  const submitAttendance = async () => {
    if (!selectedClass || !selectedSection || students.length === 0) {
      showAlert('warning', 'Please select class, section and ensure students are loaded');
      return;
    }

    if (!attendanceDate || isNaN(attendanceDate.getTime())) {
      showAlert('warning', 'Please select a valid attendance date');
      return;
    }

    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('/api/v1/admin/attendance/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: attendanceDate.toISOString(),
          classId: selectedClass,
          sectionId: selectedSection,
          attendance,
          submittedBy: currentUser?._id || null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();
      if (data.success) {
        showAlert('success', 'Attendance submitted successfully!');
        // Reset form after successful submission
        setTimeout(() => {
          setSelectedClass('');
          setSelectedSection('');
          setStudents([]);
          setAttendance({});
        }, 1500);
      } else {
        throw new Error(data.message || 'Failed to submit attendance');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      showAlert('error', 'Failed to submit attendance: ' + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const applyBulkAction = () => {
    if (students.length === 0) {
      showAlert('warning', 'No students available for bulk action');
      return;
    }

    const newAttendance = {};
    students.forEach(student => {
      if (student && student.id) {
        newAttendance[student.id] = bulkAction;
      }
    });
    setAttendance(newAttendance);
    
    const actionText = bulkAction === 'present' ? 'Present' : 
                     bulkAction === 'absent' ? 'Absent' : 'Late';
    showAlert('info', `Marked all students as ${actionText}`);
  };

  const calculateStatistics = () => {
    const stats = {
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
    };
    
    Object.values(attendance).forEach(status => {
      if (status === 'present') stats.totalPresent++;
      else if (status === 'absent') stats.totalAbsent++;
      else if (status === 'late') stats.totalLate++;
    });
    
    setStatistics(stats);
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'absent': return 'error';
      case 'late': return 'warning';
      default: return 'default';
    }
  };

  const getAttendanceStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle />;
      case 'absent': return <Cancel />;
      case 'late': return <Schedule />;
      default: return <CheckCircle />;
    }
  };

  const handleDateChange = (newDate) => {
    if (newDate && !isNaN(newDate.getTime())) {
      setAttendanceDate(newDate);
    }
  };

  const renderStatistics = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={3}>
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <StatCard sx={{ background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)' }}>
            <CardContent sx={{ color: 'white', textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {statistics.totalPresent}
              </Typography>
              <Typography variant="body2">Present</Typography>
            </CardContent>
          </StatCard>
        </Zoom>
      </Grid>
      <Grid item xs={12} md={3}>
        <Zoom in={true} style={{ transitionDelay: '200ms' }}>
          <StatCard sx={{ background: 'linear-gradient(45deg, #f44336 30%, #ef5350 90%)' }}>
            <CardContent sx={{ color: 'white', textAlign: 'center' }}>
              <Cancel sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {statistics.totalAbsent}
              </Typography>
              <Typography variant="body2">Absent</Typography>
            </CardContent>
          </StatCard>
        </Zoom>
      </Grid>
      <Grid item xs={12} md={3}>
        <Zoom in={true} style={{ transitionDelay: '300ms' }}>
          <StatCard sx={{ background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)' }}>
            <CardContent sx={{ color: 'white', textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {statistics.totalLate}
              </Typography>
              <Typography variant="body2">Late</Typography>
            </CardContent>
          </StatCard>
        </Zoom>
      </Grid>
      <Grid item xs={12} md={3}>
        <Zoom in={true} style={{ transitionDelay: '400ms' }}>
          <StatCard sx={{ background: 'linear-gradient(45deg, #2196f3 30%, #42a5f5 90%)' }}>
            <CardContent sx={{ color: 'white', textAlign: 'center' }}>
              <Group sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight="bold">
                {students.length}
              </Typography>
              <Typography variant="body2">Total Students</Typography>
            </CardContent>
          </StatCard>
        </Zoom>
      </Grid>
    </Grid>
  );

  const renderAttendanceCharts = () => {
    const total = statistics.totalPresent + statistics.totalAbsent + statistics.totalLate;
    if (total === 0) return null;

    const barData = {
      labels: ['Present', 'Absent', 'Late'],
      datasets: [{
        label: 'Students',
        data: [statistics.totalPresent, statistics.totalAbsent, statistics.totalLate],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(255, 152, 0, 0.8)'
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(255, 152, 0, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    };

    const doughnutData = {
      labels: ['Present', 'Absent', 'Late'],
      datasets: [{
        data: [statistics.totalPresent, statistics.totalAbsent, statistics.totalLate],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(255, 152, 0, 0.8)'
        ],
        borderWidth: 3,
        borderColor: '#fff'
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          cornerRadius: 8
        }
      }
    };

    return (
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <ChartContainer>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Analytics sx={{ mr: 1 }} />
              Attendance Overview
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar data={barData} options={chartOptions} />
            </Box>
          </ChartContainer>
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartContainer>
            <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
              Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut data={doughnutData} options={chartOptions} />
            </Box>
          </ChartContainer>
        </Grid>
      </Grid>
    );
  };

  const formatDateForDisplay = (date) => {
    if (!date || isNaN(date.getTime())) return 'Select Date';
    return date.toLocaleDateString();
  };

  return (
    <AttendanceWrapper>
      <Fade in={true} timeout={800}>
        <StyledPaper elevation={3}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <School sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  Student Attendance Management
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Admin Dashboard - Mark attendance for any class
                </Typography>
              </Box>
            </Box>
            <Chip 
              icon={<Today />} 
              label={formatDateForDisplay(attendanceDate)} 
              color="primary" 
              variant="outlined"
              sx={{ fontSize: '1rem', padding: '8px' }}
            />
          </Box>

          {/* Selection Controls */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select
                  value={selectedClass || ''}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="">Select Class</MenuItem>
                  {Array.isArray(classes) && classes.map((cls) => (
                    <MenuItem key={cls._id || cls.id} value={cls._id || cls.id}>
                      {cls.name} - {cls.grade || 'N/A'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select
                  value={selectedSection || ''}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  disabled={!selectedClass || loading}
                >
                  <MenuItem value="">Select Section</MenuItem>
                  {Array.isArray(sections) && sections.map((section) => (
                    <MenuItem key={section._id || section.id} value={section._id || section.id}>
                      {section.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Attendance Date"
                  value={attendanceDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!attendanceDate || isNaN(attendanceDate.getTime())}
                      helperText={(!attendanceDate || isNaN(attendanceDate.getTime())) ? 'Please select a valid date' : ''}
                    />
                  )}
                  maxDate={new Date()}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                {loading && <CircularProgress size={30} />}
              </Box>
            </Grid>
          </Grid>

          {/* Bulk Actions */}
          {students.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Bulk Action</InputLabel>
                <Select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                >
                  <MenuItem value="present">Mark All Present</MenuItem>
                  <MenuItem value="absent">Mark All Absent</MenuItem>
                  <MenuItem value="late">Mark All Late</MenuItem>
                </Select>
              </FormControl>
              <ActionButton 
                variant="outlined" 
                onClick={applyBulkAction}
                startIcon={getAttendanceStatusIcon(bulkAction)}
                color={getAttendanceStatusColor(bulkAction)}
              >
                Apply to All
              </ActionButton>
            </Box>
          )}

          {/* Statistics */}
          {students.length > 0 && renderStatistics()}

          {/* Charts */}
          {students.length > 0 && renderAttendanceCharts()}

          {/* Students Table */}
          {students.length > 0 && (
            <StyledTable>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Information</TableCell>
                    <TableCell align="center">Roll Number</TableCell>
                    <TableCell align="center">Attendance Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student, index) => {
                    const studentId = student.id || student._id || index;
                    const studentName = student.name || student.fullName || 'Unknown Student';
                    const rollNumber = student.rollNo || student.rollNumber || student.roll || 'N/A';
                    
                    return (
                      <TableRow key={studentId}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                mr: 2, 
                                bgcolor: 'primary.main',
                                width: 45,
                                height: 45
                              }}
                            >
                              {studentName.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="600">
                                {studentName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                ID: {studentId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={rollNumber} 
                            size="small" 
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Select
                            value={attendance[studentId] || 'present'}
                            onChange={(e) => handleAttendanceChange(studentId, e.target.value)}
                            size="small"
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="present">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                                Present
                              </Box>
                            </MenuItem>
                            <MenuItem value="absent">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Cancel sx={{ mr: 1, color: 'error.main' }} />
                                Absent
                              </Box>
                            </MenuItem>
                            <MenuItem value="late">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Schedule sx={{ mr: 1, color: 'warning.main' }} />
                                Late
                              </Box>
                            </MenuItem>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </StyledTable>
          )}

          {/* Empty State */}
          {!loading && students.length === 0 && selectedClass && selectedSection && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              borderRadius: 2,
              mt: 3
            }}>
              <Group sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No Students Found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                There are no students in the selected class and section.
              </Typography>
            </Box>
          )}

         {/* Submit Button */}
          {students.length > 0 && (
            <Box sx={{ 
              mt: 4, 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: 2
            }}>
              <ActionButton
                variant="outlined"
                onClick={() => {
                  setSelectedClass('');
                  setSelectedSection('');
                  setStudents([]);
                  setAttendance({});
                }}
                disabled={submitLoading}
              >
                Reset
              </ActionButton>
              <ActionButton
                variant="contained"
                onClick={submitAttendance}
                disabled={submitLoading || students.length === 0 || !attendanceDate || isNaN(attendanceDate.getTime())}
                startIcon={submitLoading ? <CircularProgress size={20} /> : <Save />}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  color: 'white',
                  minWidth: 150
                }}
              >
                {submitLoading ? 'Submitting...' : 'Submit Attendance'}
              </ActionButton>
            </Box>
          )}

          {/* Snackbar for Alerts */}
          <Snackbar
            open={alert.open}
            autoHideDuration={6000}
            onClose={() => setAlert({ ...alert, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setAlert({ ...alert, open: false })}
              severity={alert.severity}
              variant="filled"
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
              }}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        </StyledPaper>
      </Fade>
    </AttendanceWrapper>
  );
};

export default StudentAttendance;