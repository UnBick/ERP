// src/components/admin/Finance/Fee/FeeWaivers.jsx
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
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getApiUrl } from '../../../config/apiConfig';

const FeeWaivers = () => {
  const [feeWaivers, setFeeWaivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWaiver, setSelectedWaiver] = useState(null);
  const [waiverDetails, setWaiverDetails] = useState({
    studentId: '',
    amount: '',
    reason: '',
  });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchFeeWaivers();
    fetchStudents();
  }, []);

  const fetchFeeWaivers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/v1/admin/fees/waivers'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch fee waivers');
      }

      const data = await response.json();
      if (data.success) {
        setFeeWaivers(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch fee waivers');
      }
    } catch (error) {
      console.error('Error fetching fee waivers:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching fee waivers'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/admin/students'));
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setAlert('Error fetching students');
    }
  };

  const handleAddEditWaiver = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedWaiver
        ? `/api/v1/admin/fees/waivers/${selectedWaiver.id}`
        : '/api/v1/admin/fees/waivers';

      const response = await fetch(url, {
        method: selectedWaiver ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(waiverDetails),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save fee waiver');
      }

      const data = await response.json();
      if (data.success) {
        setAlert({
          type: 'success',
          message: `Fee waiver ${selectedWaiver ? 'updated' : 'added'} successfully`
        });
        await fetchFeeWaivers();
        setOpenDialog(false);
        setSelectedWaiver(null);
        setWaiverDetails({
          studentId: '',
          amount: '',
          reason: '',
        });
      } else {
        throw new Error(data.message || 'Failed to save fee waiver');
      }
    } catch (error) {
      console.error('Error saving fee waiver:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error saving fee waiver'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditWaiver = (waiver) => {
    setSelectedWaiver(waiver);
    setWaiverDetails({
      studentId: waiver.studentId,
      amount: waiver.amount,
      reason: waiver.reason,
    });
    setOpenDialog(true);
  };

  const handleDeleteWaiver = async (waiverId) => {
    if (!window.confirm('Are you sure you want to delete this fee waiver?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/v1/admin/fees/waivers/${waiverId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete fee waiver');
      }

      const data = await response.json();
      if (data.success) {
        setAlert({
          type: 'success',
          message: 'Fee waiver deleted successfully'
        });
        await fetchFeeWaivers();
      } else {
        throw new Error(data.message || 'Failed to delete fee waiver');
      }
    } catch (error) {
      console.error('Error deleting fee waiver:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error deleting fee waiver'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Fee Waivers Management
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add Fee Waiver
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeWaivers.map((waiver) => (
                <TableRow key={waiver.id}>
                  <TableCell>{waiver.studentName}</TableCell>
                  <TableCell>{waiver.amount}</TableCell>
                  <TableCell>{waiver.reason}</TableCell>
                  <TableCell>{new Date(waiver.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button startIcon={<Edit />} onClick={() => handleEditWaiver(waiver)}>
                      Edit
                    </Button>
                    <Button startIcon={<Delete />} color="error" onClick={() => handleDeleteWaiver(waiver.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {alert && (
          <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert onClose={() => setAlert(null)} severity={alert.type}>
              {alert.message}
            </Alert>
          </Snackbar>
        )}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{selectedWaiver ? 'Edit Fee Waiver' : 'Add New Fee Waiver'}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Student</InputLabel>
              <Select
                value={waiverDetails.studentId}
                onChange={(e) => setWaiverDetails({ ...waiverDetails, studentId: e.target.value })}
              >
                {students.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={waiverDetails.amount}
              onChange={(e) => setWaiverDetails({ ...waiverDetails, amount: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Reason"
              value={waiverDetails.reason}
              onChange={(e) => setWaiverDetails({ ...waiverDetails, reason: e.target.value })}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddEditWaiver} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default FeeWaivers;