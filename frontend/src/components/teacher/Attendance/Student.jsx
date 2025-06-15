// src/components/teacher/Attendance/Student.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  ButtonGroup,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, Cancel, RadioButtonUnchecked, Save } from '@mui/icons-material';

// Add styled components
const AttendanceWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3),
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)'
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  padding: theme.spacing(1, 3),
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const StyledTable = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold'
  },
  '& .MuiTableRow-root': {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover
    },
    '&:hover': {
      backgroundColor: theme.palette.action.selected
    }
  }
}));

const StudentAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    severity: 'info',
    message: ''
  });
  const [teacherRole, setTeacherRole] = useState(null);

  useEffect(() => {
    fetchStudents();
    checkAccess();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/v1/teacher/attendance/students', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched students:', data);
        
        if (data.success) {
            setStudents(data.data || []);
        } else {
            throw new Error(data.message || 'Failed to fetch students');
        }
    } catch (error) {
        console.error('Error fetching students:', error);
        setAlert({
            open: true,
            severity: 'error',
            message: 'Error fetching students: ' + error.message
        });
    } finally {
        setLoading(false);
    }
};

const checkAccess = async () => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/v1/teacher/attendance/teacher-role', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            setTeacherRole(data.data);
        } else {
            throw new Error(data.message || 'Failed to check teacher role');
        }
    } catch (error) {
        console.error('Error checking access:', error);
        setAlert({
            open: true,
            severity: 'error',
            message: 'Error checking access permissions: ' + error.message
        });
    }
};

  const handleAttendanceChange = (studentId, value) => {
    setAttendance({
      ...attendance,
      [studentId]: value,
    });
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach((student) => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const handleSubmitAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/teacher/attendance/student', { // Updated endpoint
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendance),
      });

      if (!response.ok) {
        throw new Error('Failed to submit attendance');
      }

      const data = await response.json();
      
      setAlert({
        open: true,
        severity: 'success',
        message: data.message || 'Attendance submitted successfully'
      });
      
      // Clear attendance after successful submission
      setAttendance({});
      
    } catch (error) {
      setAlert({
        open: true,
        severity: 'error',
        message: error.message || 'Error submitting attendance'
      });
    } finally {
      setLoading(false);
    }
};

  return (
    <AttendanceWrapper>
      <StyledPaper elevation={3}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Student Attendance
          </Typography>
          {students.length > 0 && (
            <ButtonGroup variant="outlined" size="small">
              <ActionButton 
                onClick={() => handleMarkAll(true)} 
                color="success"
                startIcon={<CheckCircle />}
              >
                Mark All Present
              </ActionButton>
              <ActionButton 
                onClick={() => handleMarkAll(false)} 
                color="error"
                startIcon={<Cancel />}
              >
                Mark All Absent
              </ActionButton>
            </ButtonGroup>
          )}
        </Box>

        <StyledTable>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="60%">Student Name</TableCell>
                <TableCell align="center">Attendance Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {student.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {student.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Roll No: {student.rollNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={attendance[student.id] || false}
                        onChange={(e) => handleAttendanceChange(student.id, e.target.checked)}
                        color="primary"
                        icon={<RadioButtonUnchecked />}
                        checkedIcon={<CheckCircle />}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    <Box sx={{ py: 4 }}>
                      {loading ? (
                        <CircularProgress size={40} />
                      ) : (
                        <Typography color="textSecondary">
                          No students found
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </StyledTable>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mt: 4 
        }}>
          <ActionButton
            variant="contained"
            onClick={handleSubmitAttendance}
            disabled={loading || students.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </ActionButton>
        </Box>

        <Snackbar 
          open={alert.open} 
          autoHideDuration={6000} 
          onClose={() => setAlert(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            onClose={() => setAlert(prev => ({ ...prev, open: false }))} 
            severity={alert.severity}
            variant="filled"
            elevation={6}
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </StyledPaper>
    </AttendanceWrapper>
  );
};

export default StudentAttendance;