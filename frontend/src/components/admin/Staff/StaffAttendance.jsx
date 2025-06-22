import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { QrCodeScanner, CloudUpload, Assessment } from '@mui/icons-material';
import { useStudent } from '../Students/context/StudentContext'; // Import useStudent context hook
import { getApiUrl } from '../../../config/apiConfig';

// Add necessary imports for MUI X DatePickers
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';


const StaffAttendance = () => {
  const { currentUser } = useStudent(); // Accessing current user from context
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alert, setAlert] = useState(null);
  const [biometricData, setBiometricData] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchStaff();
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/admin/staff/departments'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      const data = await response.json();
      if (data.success) {
        setDepartments(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch departments');
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching departments'
      });
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`/api/v1/admin/staff/department/${selectedDepartment}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch staff list');
      }

      const data = await response.json();
      if (data.success) {
        setStaff(data.data);
        initializeAttendance(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch staff');
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching staff'
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeAttendance = (staffList) => {
    const initialAttendance = {};
    staffList.forEach(staff => {
      initialAttendance[staff._id] = 'present'; // Use _id instead of id
    });
    setAttendance(initialAttendance);
  };

  const handleAttendanceChange = (staffId, value) => {
    setAttendance(prev => ({
      ...prev,
      [staffId]: value
    }));
  };

  const submitAttendance = async () => {
    if (!selectedDepartment) {
      setAlert({
        type: 'error',
        message: 'Please select a department'
      });
      return;
    }

    setLoading(true);
    try {
      const attendanceData = Object.entries(attendance).map(([staffId, status]) => ({
        staffId,
        status,
        date: attendanceDate
      }));

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/admin/staff/attendance/mark'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          department: selectedDepartment,
          date: attendanceDate,
          attendanceRecords: attendanceData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit attendance');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setAlert({
          type: 'success',
          message: 'Attendance marked successfully!'
        });
        
        // Immediately fetch updated statistics
        await fetchStatistics();
      } else {
        throw new Error(data.message || 'Failed to submit attendance');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error submitting attendance'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricScan = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/admin/staff/attendance/biometric-scan'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Biometric scan failed');
      }

      const data = await response.json();
      if (data.success) {
        setBiometricData(data.data);
        setAlert({
          type: 'success',
          message: 'Biometric scan completed successfully'
        });

        // Optionally update attendance based on scan
        if (data.data.staffDetails?.staffId) {
          handleAttendanceChange(data.data.staffDetails.staffId, 'present');
        }
      } else {
        throw new Error(data.message || 'Biometric scan failed');
      }
    } catch (error) {
      console.error('Biometric scan error:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Biometric scan failed'
      });
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('attendanceFile', file);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/admin/staff/attendance/bulk-upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Bulk upload failed');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setAlert({
          type: 'success',
          message: 'Bulk attendance uploaded successfully'
        });
        fetchStaff(); // Refresh data
      } else {
        throw new Error(data.message || 'Bulk upload failed');
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Bulk upload failed'
      });
    }
  };

  const fetchStatistics = async () => {
    if (!selectedDepartment) {
      setAlert({
        type: 'warning',
        message: 'Please select a department first'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const encodedDept = encodeURIComponent(selectedDepartment);
      const response = await fetch(getApiUrl(`/api/v1/admin/staff/attendance/statistics?department=${encodedDept}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      console.log('Statistics response:', data); // Debug log
      
      if (data.success) {
        setStatistics(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Statistics error:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Failed to fetch statistics'
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}> {/* Wrap component in LocalizationProvider */}
      <Box sx={{ width: '100%', p: 3 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Staff Attendance
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Attendance Date"
                value={attendanceDate}
                onChange={(newValue) => setAttendanceDate(newValue)}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<QrCodeScanner />}
                onClick={handleBiometricScan}
              >
                Biometric Scan
              </Button>
            </Grid>
            <Grid item>
              <input
                type="file"
                accept=".csv,.xlsx"
                style={{ display: 'none' }}
                id="bulk-upload"
                onChange={handleBulkUpload}
              />
              <label htmlFor="bulk-upload">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                >
                  Bulk Upload
                </Button>
              </label>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<Assessment />}
                onClick={fetchStatistics}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'View Statistics'}
              </Button>
            </Grid>
          </Grid>

          {statistics && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6">Today's Attendance Statistics</Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{statistics.totalStaff}</Typography>
                    <Typography>Total Staff</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{statistics.presentPercentage}%</Typography>
                    <Typography>Present ({statistics.rawCounts?.present || 0})</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{statistics.absentPercentage}%</Typography>
                    <Typography>Absent ({statistics.rawCounts?.absent || 0})</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4">{statistics.latePercentage}%</Typography>
                    <Typography>Late ({statistics.rawCounts?.late || 0})</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Attendance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staff.map((staffMember) => (
                  <TableRow key={staffMember._id}>
                    <TableCell>{staffMember.staffID || staffMember._id.substring(0, 8)}</TableCell>
                    <TableCell>{staffMember.name}</TableCell>
                    <TableCell>
                      <Select
                        value={attendance[staffMember._id] || 'present'}
                        onChange={(e) => handleAttendanceChange(staffMember._id, e.target.value)}
                      >
                        <MenuItem value="present">Present</MenuItem>
                        <MenuItem value="absent">Absent</MenuItem>
                        <MenuItem value="late">Late</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={submitAttendance}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Attendance'}
            </Button>
          </Box>

          <Snackbar
            open={success}
            autoHideDuration={6000}
            onClose={() => setSuccess(false)}
          >
            <Alert onClose={() => setSuccess(false)} severity="success">
              Attendance submitted successfully!
            </Alert>
          </Snackbar>

          {alert && (
            <Snackbar
              open={!!alert}
              autoHideDuration={6000}
              onClose={() => setAlert(null)}
            >
              <Alert 
                onClose={() => setAlert(null)} 
                severity={alert.type || 'error'}
              >
                {alert.message}
              </Alert>
            </Snackbar>
          )}
        </Paper>
      </Box>
    </LocalizationProvider> /* End of LocalizationProvider */
  );
};

export default StaffAttendance;
