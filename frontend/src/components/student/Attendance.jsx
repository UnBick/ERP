// src/components/student/Attendance.jsx
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
  Button,
  TextField,
  Chip,
} from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Add styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  height: '100%',
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)'
  }
}));

const StyledTableContainer = styled(TableContainer)({
  maxHeight: '60vh',
  '&::-webkit-scrollbar': {
    width: '8px'
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1'
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px',
    '&:hover': {
      background: '#555'
    }
  }
});

const StyledTableRow = styled(TableRow)(({ theme, status }) => ({
  '& td': { 
    padding: theme.spacing(2) 
  },
  backgroundColor: status === 'present' 
    ? 'rgba(76, 175, 80, 0.08)'
    : status === 'absent'
    ? 'rgba(244, 67, 54, 0.08)'
    : status === 'late'
    ? 'rgba(255, 152, 0, 0.08)'
    : 'inherit',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(1.5, 4),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-2px)'
  }
}));

const StatBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.default,
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [stats, setStats] = useState({});
  const [leaveDialog, setLeaveDialog] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({ from: '', to: '', reason: '' });

  useEffect(() => {
    fetchAttendance();
    fetchStats();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/student/attendance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch attendance');
      
      const data = await response.json();
      if (data.success) {
        setAttendance(data.data);
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: 'Error fetching attendance records'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/student/attendance/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: 'Error fetching statistics'
      });
    }
  };

  const submitLeaveRequest = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/v1/student/attendance/leave-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leaveRequest)
      });

      if (!response.ok) throw new Error('Failed to submit leave request');

      const data = await response.json();
      setLeaveDialog(false);
      setAlert({
        severity: 'success',
        message: 'Leave request submitted successfully'
      });
      setLeaveRequest({ from: '', to: '', reason: '' });
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Error submitting leave request'
      });
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      p: 3,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <StyledPaper>
            <Typography variant="h5" gutterBottom sx={{ 
              fontWeight: 600,
              color: theme => theme.palette.primary.main,
              mb: 3
            }}>
              Attendance Records
            </Typography>

            <StyledTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendance.map((record) => (
                    <StyledTableRow key={record._id} status={record.status}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={
                            record.status === 'present' ? 'success' :
                            record.status === 'absent' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Statistics
              </Typography>
              <StatBox>
                <Typography variant="body1">Present Days</Typography>
                <Typography variant="h6" color="success.main">
                  {stats.presentDays || 0}
                </Typography>
              </StatBox>
              <StatBox>
                <Typography variant="body1">Absent Days</Typography>
                <Typography variant="h6" color="error.main">
                  {stats.absentDays || 0}
                </Typography>
              </StatBox>
              <StatBox>
                <Typography variant="body1">Attendance Rate</Typography>
                <Typography variant="h6" color="primary.main">
                  {stats.attendanceRate || 0}%
                </Typography>
              </StatBox>
              <StyledButton
                variant="contained"
                onClick={() => setLeaveDialog(true)}
                fullWidth
                sx={{ mt: 2 }}
              >
                Request Leave
              </StyledButton>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      <Dialog open={leaveDialog} onClose={() => setLeaveDialog(false)}>
        <DialogTitle>Request Leave</DialogTitle>
        <DialogContent>
          <TextField
            label="From Date"
            type="date"
            value={leaveRequest.from}
            onChange={(e) => setLeaveRequest({ ...leaveRequest, from: e.target.value })}
            sx={{ mt: 2 }}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="To Date"
            type="date"
            value={leaveRequest.to}
            onChange={(e) => setLeaveRequest({ ...leaveRequest, to: e.target.value })}
            sx={{ mt: 2 }}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Reason"
            multiline
            rows={4}
            value={leaveRequest.reason}
            onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
            sx={{ mt: 2 }}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialog(false)}>Cancel</Button>
          <Button onClick={submitLeaveRequest} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance;