// src/components/teacher/Attendance/Self.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  ButtonGroup,
} from '@mui/material';
import { 
  LocationOn, 
  AccessTime, 
  CalendarToday,
  History
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Add styled components
const AttendanceWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh'
}));

const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
  color: 'white',
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2
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
  padding: theme.spacing(1.5, 4),
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const StyledTable = styled(TableContainer)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 'bold'
  },
  '& .MuiTableRow-root': {
    transition: 'background-color 0.2s',
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover
    },
    '&:hover': {
      backgroundColor: theme.palette.action.selected
    }
  }
}));

const StatCard = styled(Card)(({ theme, color }) => ({
  height: '100%',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(3)
  },
  borderLeft: `4px solid ${color || theme.palette.primary.main}`
}));

const SelfAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [location, setLocation] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [stats, setStats] = useState({
    totalDays: 0,
    presentDays: 0,
    leaveDays: 0,
    attendance_percentage: 0
  });
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'sick' // sick, casual, emergency
  });
  const [attendanceType, setAttendanceType] = useState('checkIn'); // Add this state

  useEffect(() => {
    fetchAttendanceHistory();
    fetchAttendanceStats();
    initializeGeolocation();
  }, []);

  const initializeGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setAlert({ severity: 'error', message: 'Error getting location' });
        }
      );
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/teacher/attendance/self/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const result = await response.json();
      console.log('History response:', result);

      if (result.success) {
        setAttendanceHistory(result.data || []);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('History fetch error:', error);
      setAlert({
        open: true,
        severity: 'error',
        message: 'Error fetching attendance history'
      });
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/teacher/attendance/self/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setAlert({ severity: 'error', message: 'Error fetching attendance stats' });
    }
  };

  const handleMarkAttendance = async () => {
    setLoading(true);
    try {
        if (!location) {
            throw new Error('Location not available');
        }

        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/v1/teacher/attendance/self/mark', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
                location,
                timestamp: new Date().toISOString(),
                type: attendanceType
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to mark attendance');
        }

        setAlert({ 
            open: true,
            severity: 'success', 
            message: data.message
        });
        
        // Refresh data after successful marking
        await fetchAttendanceHistory();
        await fetchAttendanceStats();
        
    } catch (error) {
        console.error('Attendance error:', error);
        setAlert({
            open: true,
            severity: 'error',
            message: error.message
        });
    } finally {
        setLoading(false);
    }
};

  const handleLeaveRequest = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/teacher/attendance/leave/request', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(leaveRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to submit leave request');
      }

      const data = await response.json();
      setAlert({ 
        severity: 'success', 
        message: data.message || 'Leave request submitted successfully' 
      });
      setLeaveDialog(false);
      fetchAttendanceStats();
    } catch (error) {
      setAlert({ 
        severity: 'error', 
        message: error.message || 'Failed to submit leave request' 
      });
    }
  };

  return (
    <AttendanceWrapper>
      <Grid container spacing={3}>
        {/* Stats Section */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {[
              { title: 'Total Days', value: stats.totalDays, icon: <CalendarToday />, color: '#4CAF50' },
              { title: 'Present Days', value: stats.presentDays, icon: <AccessTime />, color: '#2196F3' },
              { title: 'Leave Days', value: stats.leaveDays, icon: <History />, color: '#FF9800' },
              { title: 'Attendance', value: `${stats.attendance_percentage}%`, icon: <LocationOn />, color: '#9C27B0' }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard color={stat.color}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {React.cloneElement(stat.icon, { sx: { color: stat.color, fontSize: 32, mr: 1 } })}
                      <Typography variant="h6" color="textSecondary">
                        {stat.title}
                      </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <StyledPaper elevation={3}>
            <Typography variant="h5" gutterBottom>Self Attendance</Typography>
            
            <Box sx={{ mb: 4 }}>
              {/* Attendance Type Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Select Attendance Type:
                </Typography>
                <ButtonGroup variant="outlined">
                  <Button
                    onClick={() => setAttendanceType('checkIn')}
                    variant={attendanceType === 'checkIn' ? 'contained' : 'outlined'}
                    startIcon={<AccessTime />}
                    color="primary"
                  >
                    Check In
                  </Button>
                  <Button
                    onClick={() => setAttendanceType('checkOut')}
                    variant={attendanceType === 'checkOut' ? 'contained' : 'outlined'}
                    startIcon={<AccessTime />}
                    color="secondary"
                  >
                    Check Out
                  </Button>
                </ButtonGroup>
              </Box>

              {/* Confirm Attendance Button */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleMarkAttendance}
                  disabled={loading || !location}
                  startIcon={<LocationOn />}
                  color={attendanceType === 'checkIn' ? 'primary' : 'secondary'}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    `Confirm ${attendanceType === 'checkIn' ? 'Check In' : 'Check Out'}`
                  )}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setLeaveDialog(true)}
                  startIcon={<CalendarToday />}
                >
                  Request Leave
                </Button>
              </Box>
            </Box>

            <StyledTable>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceHistory.length > 0 ? (
                    attendanceHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{record.checkIn}</TableCell>
                        <TableCell>{record.checkOut}</TableCell>
                        <TableCell>
                          <Chip 
                            label={record.status}
                            color={record.status === 'present' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="textSecondary">
                          No attendance records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </StyledTable>
          </StyledPaper>
        </Grid>

        {/* Actions Panel */}
        <Grid item xs={12} md={4}>
          <StyledPaper elevation={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Attendance Statistics</Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography>Total Working Days: {stats.totalDays}</Typography>
                  <Typography>Present Days: {stats.presentDays}</Typography>
                  <Typography>Leave Days: {stats.leaveDays}</Typography>
                  <Typography>Attendance: {stats.attendance_percentage}%</Typography>
                </Box>
              </CardContent>
            </Card>
          </StyledPaper>
        </Grid>
      </Grid>

      <Dialog open={leaveDialog} onClose={() => setLeaveDialog(false)}>
        <DialogTitle>Request Leave</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={leaveRequest.startDate}
            onChange={(e) => setLeaveRequest({...leaveRequest, startDate: e.target.value})}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={leaveRequest.endDate}
            onChange={(e) => setLeaveRequest({...leaveRequest, endDate: e.target.value})}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason"
            value={leaveRequest.reason}
            onChange={(e) => setLeaveRequest({...leaveRequest, reason: e.target.value})}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialog(false)}>Cancel</Button>
          <Button onClick={handleLeaveRequest} variant="contained" color="primary">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {alert && (
        <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
          <Alert onClose={() => setAlert(null)} severity={alert.severity}>
            {alert.message}
          </Alert>
        </Snackbar>
      )}
    </AttendanceWrapper>
  );
};

export default SelfAttendance;