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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { CloudUpload, Assessment } from '@mui/icons-material';
import { useStudent } from '../Students/context/StudentContext'; // Reusing context for simplicity

const StaffLeave = () => {
  const { currentUser } = useStudent();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newLeave, setNewLeave] = useState({
    staffId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveBalance();
  }, []);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch('/api/v1/admin/staff/leave-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setLeaveRequests(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch leave requests');
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching leave requests'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const staffId = currentUser?._id; // Get current user's ID
      const response = await fetch(`/api/v1/admin/staff/leave-balance?staffId=${staffId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setLeaveBalance(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch leave balance');
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Failed to fetch leave balance'
      });
    }
  };

  const handleFileUpload = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleAddLeave = async () => {
    const formData = new FormData();
    formData.append('leaveData', JSON.stringify(newLeave));
    selectedFiles.forEach(file => {
      formData.append('documents', file);
    });

    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch('/api/v1/admin/staff/leave/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setOpenDialog(false);
        setAlert({
          type: 'success',
          message: 'Leave request submitted successfully'
        });
        setNewLeave({
          staffId: '',
          leaveType: '',
          startDate: '',
          endDate: '',
          reason: '',
        });
        setSelectedFiles([]);
        fetchLeaveRequests(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to submit leave request');
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.message || 'Error submitting leave request'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Staff Leave Management
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
          >
            Add Leave Request
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Staff Name</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(leaveRequests) && leaveRequests.length > 0 ? (
                leaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>{request.staffName}</TableCell>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>{request.startDate}</TableCell>
                    <TableCell>{request.endDate}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>{request.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">No leave requests found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

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
              {alert.message || 'An error occurred'}
            </Alert>
          </Snackbar>
        )}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Leave Request</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Staff ID"
              value={newLeave.staffId}
              onChange={(e) => setNewLeave({ ...newLeave, staffId: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={newLeave.leaveType}
                onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
              >
                <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                <MenuItem value="Casual Leave">Casual Leave</MenuItem>
                <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
                <MenuItem value="Paternity Leave">Paternity Leave</MenuItem>
                <MenuItem value="Unpaid Leave">Unpaid Leave</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newLeave.startDate}
              onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newLeave.endDate}
              onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={3}
              value={newLeave.reason}
              onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
              sx={{ mb: 2 }}
            />
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              style={{ marginBottom: 16 }}
            />
            {selectedFiles.map(file => (
              <Chip
                key={file.name}
                label={file.name}
                onDelete={() => {
                  setSelectedFiles(files => 
                    files.filter(f => f.name !== file.name)
                  );
                }}
                sx={{ margin: 0.5 }}
              />
            ))}

            {leaveBalance && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Leave Balance
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(leaveBalance).map(([type, balance]) => (
                    <Grid item xs={4} key={type}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6">{type}</Typography>
                        <Typography variant="body1">
                          Total: {balance.total || 0}
                        </Typography>
                        <Typography variant="body1">
                          Used: {balance.used || 0}
                        </Typography>
                        <Typography variant="body1">
                          Remaining: {balance.remaining || 0}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAddLeave}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default StaffLeave;
