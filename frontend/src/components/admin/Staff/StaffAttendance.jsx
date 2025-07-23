import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Visibility,
  Edit,
  Download,
  CalendarToday,
  AccessTime,
  People,
  Assignment,
  CheckCircle,
  Cancel,
  Schedule
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)'
}));

const StatCard = styled(Card)(({ theme, color }) => ({
  height: '100%',
  background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
  border: `1px solid ${color}30`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTab-root': {
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    minHeight: 48
  }
}));

const AdminAttendanceSystem = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittedAttendance, setSubmittedAttendance] = useState([]);
  const [absentTeachers, setAbsentTeachers] = useState([]);
  const [editDialog, setEditDialog] = useState({ open: false, teacher: null });
  const [stats, setStats] = useState({
    totalTeachers: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    submissionRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'present',
    entryTime: '',
    exitTime: '',
    remarks: ''
  });
  const [teacherData, setTeacherData] = useState([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (teacherData.length > 0) {
      fetchDailyAttendance();
    }
    // eslint-disable-next-line
  }, [selectedDate, teacherData]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAlert({ severity: 'error', message: 'No authentication token found. Please login again.' });
        return;
      }
      const res = await fetch('/api/v1/admin/staff', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        setAlert({ severity: 'error', message: 'Session expired. Please login again.' });
        return;
      }
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTeacherData(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      setAlert({ severity: 'error', message: `Failed to fetch teachers: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/admin/staff/attendance?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data = await res.json();
      console.log('Fetched attendance response:', data);
      setSubmittedAttendance(data.submitted || []);
      setAbsentTeachers(data.absent || []);
    } catch (error) {
      console.log('Error fetching attendance:', error);
      setAlert({ severity: 'error', message: 'Failed to fetch attendance data' });
      setSubmittedAttendance([]);
      setAbsentTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = () => {
    const total = teacherData.length; // This is always dynamic
    const present = submittedAttendance.filter(a => a.status === 'present').length;
    const late = submittedAttendance.filter(a => a.status === 'late').length;
    const absent = absentTeachers.length;
    const submitted = submittedAttendance.length;
    setStats({
      totalTeachers: total,
      presentCount: present,
      lateCount: late,
      absentCount: absent,
      submissionRate: total ? Math.round((submitted / total) * 100) : 0
    });
  };

  const handleEditAttendance = (teacher) => {
    setEditDialog({ open: true, teacher });
    setEditForm({
      status: teacher.status,
      entryTime: teacher.entryTime || '',
      exitTime: teacher.exitTime || '',
      remarks: teacher.remarks || ''
    });
  };

  const handleSaveEdit = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Check if we're editing an existing record or creating a new one
    const isExistingRecord = editDialog.teacher.id && editDialog.teacher.id !== editDialog.teacher.teacherId;
    
    if (isExistingRecord) {
      // Update existing attendance record
      const res = await fetch(`/api/v1/admin/staff/attendance/${editDialog.teacher.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editForm.status,
          entryTime: editForm.entryTime,
          exitTime: editForm.exitTime,
          remarks: editForm.remarks
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      const updatedRecord = json.data || json;
      
      // Update the submitted attendance array
      setSubmittedAttendance(prev => 
        prev.map(record => 
          record.id === editDialog.teacher.id ? updatedRecord : record
        )
      );

      // Remove from absent list if it was there
      const teacherId = updatedRecord.teacherId || updatedRecord.staffId;
      setAbsentTeachers(prev => 
        prev.filter(t => (t.teacherId || t.staffId) !== teacherId)
      );

    } else {
      // Create new attendance record for absent teacher
      const res = await fetch('/api/v1/admin/staff/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          staffId: editDialog.teacher.teacherId,
          staffModel: 'Teacher', // or 'Staff' based on your logic
          date: selectedDate,
          status: editForm.status,
          entryTime: editForm.entryTime,
          exitTime: editForm.exitTime,
          remarks: editForm.remarks,
          department: editDialog.teacher.teacher.department
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      const newRecord = json.data || json;
      
      // Add to submitted attendance
      setSubmittedAttendance(prev => [...prev, {
        id: newRecord._id || newRecord.id,
        teacherId: editDialog.teacher.teacherId,
        teacher: editDialog.teacher.teacher,
        status: editForm.status,
        entryTime: editForm.entryTime,
        exitTime: editForm.exitTime,
        remarks: editForm.remarks,
        submittedBy: 'admin',
        submittedAt: new Date().toLocaleTimeString()
      }]);

      // Remove from absent list
      setAbsentTeachers(prev => 
        prev.filter(t => t.teacherId !== editDialog.teacher.teacherId)
      );
    }

    setAlert({ severity: 'success', message: 'Attendance updated successfully' });
    setEditDialog({ open: false, teacher: null });
    
  } catch (error) {
    console.error('Error updating attendance:', error);
    setAlert({ 
      severity: 'error', 
      message: error.message || 'Failed to update attendance' 
    });
  } finally {
    setLoading(false);
  }
};
  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      const csvContent = [
        ['Teacher Name', 'Department', 'Status', 'Entry Time', 'Exit Time', 'Submitted By', 'Date'],
        ...submittedAttendance.map(record => [
          record.teacher.name,
          record.teacher.department,
          record.status,
          record.entryTime || 'N/A',
          record.exitTime || 'N/A',
          record.submittedBy,
          selectedDate
        ]),
        ...absentTeachers.map(record => [
          record.teacher.name,
          record.teacher.department,
          record.status,
          'N/A',
          'N/A',
          record.submittedBy,
          selectedDate
        ])
      ].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${selectedDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setAlert({ severity: 'success', message: 'Report downloaded successfully' });
    } catch (error) {
      console.log('Error generating report:', error);
      setAlert({ severity: 'error', message: 'Failed to generate report' });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString();
  };

  const isAfterCutoff = () => {
    const now = new Date();
    const cutoff = new Date();
    cutoff.setHours(12, 0, 0, 0);
    return now > cutoff;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle color="success" />;
      case 'late': return <Schedule color="warning" />;
      case 'absent': return <Cancel color="error" />;
      default: return null;
    }
  };

  useEffect(() => {
    updateStats();
  }, [submittedAttendance, absentTeachers, teacherData]);

  return (
    <Box sx={{ width: '100%', p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Staff Attendance Management
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
        Current Time: {getCurrentTime()} | 
        Submission Window: 8:00 AM - 12:00 PM | 
        Status: {isAfterCutoff() ? 'Closed' : 'Open'}
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="#1976d2">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {stats.totalTeachers}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Teachers
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: '#1976d2' }} />
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="#4caf50">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {stats.presentCount}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    Present
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="#ff9800">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                    {stats.lateCount}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    Late
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, color: '#ff9800' }} />
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="#f44336">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                    {stats.absentCount}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    Absent
                  </Typography>
                </Box>
                <Cancel sx={{ fontSize: 40, color: '#f44336' }} />
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      {/* Controls */}
      <StyledPaper sx={{ mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              type="date"
              label="Select Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownloadReport}
              fullWidth
              disabled={loading}
            >
              Download Report
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="textSecondary">
              Submission Rate: {stats.submissionRate}%
            </Typography>
          </Grid>
        </Grid>
      </StyledPaper>

      {/* Main Content */}
      <StyledPaper>
        <StyledTabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab 
            label={
              <Badge badgeContent={submittedAttendance.length} color="primary">
                Submitted Attendance
              </Badge>
            }
            icon={<Assignment />}
          />
          <Tab 
            label={
              <Badge badgeContent={absentTeachers.length} color="error">
                Pending/Absent
              </Badge>
            }
            icon={<Schedule />}
          />
        </StyledTabs>

        {/* Tab 1: Submitted Attendance */}
        {currentTab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Entry Time</TableCell>
                  <TableCell>Exit Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted By</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : submittedAttendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary">
                        No attendance records found for {selectedDate}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  submittedAttendance.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getStatusIcon(record.status)}
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {record.teacher.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {record.teacher.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{record.teacher.department}</TableCell>
                      <TableCell>{record.entryTime || 'N/A'}</TableCell>
                      <TableCell>{record.exitTime || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status.toUpperCase()}
                          color={getStatusColor(record.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.submittedBy.toUpperCase()}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Record">
                          <IconButton onClick={() => handleEditAttendance(record)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 2: Absent Teachers */}
        {currentTab === 1 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Auto-marked At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : absentTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="textSecondary">
                        No absent teachers for {selectedDate}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  absentTeachers.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getStatusIcon(record.status)}
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {record.teacher.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {record.teacher.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{record.teacher.department}</TableCell>
                      <TableCell>
                        <Chip
                          label="ABSENT"
                          color="error"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.submittedAt}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleEditAttendance(record)}
                          size="small"
                        >
                          Mark Present
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StyledPaper>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, teacher: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Attendance Record</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Teacher: {editDialog.teacher?.teacher?.name}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <MenuItem value="present">Present</MenuItem>
                    <MenuItem value="late">Late</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  type="time"
                  label="Entry Time"
                  value={editForm.entryTime}
                  onChange={(e) => setEditForm({ ...editForm, entryTime: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  type="time"
                  label="Exit Time"
                  value={editForm.exitTime}
                  onChange={(e) => setEditForm({ ...editForm, exitTime: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Remarks"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, teacher: null })}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      {alert && (
        <Snackbar
          open={!!alert}
          autoHideDuration={6000}
          onClose={() => setAlert(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setAlert(null)} severity={alert.severity}>
            {alert.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default AdminAttendanceSystem;