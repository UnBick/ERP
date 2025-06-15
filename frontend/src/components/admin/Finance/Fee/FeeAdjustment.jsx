// src/components/admin/Finance/Fee/FeeAdjustments.jsx
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

const FeeAdjustments = () => {
  const [feeAdjustments, setFeeAdjustments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [adjustmentDetails, setAdjustmentDetails] = useState({
    studentId: '',
    amount: '',
    reason: '',
  });
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchFeeAdjustments();
    fetchStudents();
  }, []);

  const fetchFeeAdjustments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/feeAdjustments');
      const data = await response.json();
      setFeeAdjustments(data);
    } catch (error) {
      setAlert('Error fetching fee adjustments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setAlert('Error fetching students');
    }
  };

  const handleAddEditAdjustment = async () => {
    setLoading(true);
    try {
      const method = selectedAdjustment ? 'PUT' : 'POST';
      const url = selectedAdjustment
        ? `/api/admin/feeAdjustments/${selectedAdjustment.id}`
        : '/api/admin/feeAdjustments';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adjustmentDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to save fee adjustment');
      }

      fetchFeeAdjustments();
      setOpenDialog(false);
      setSelectedAdjustment(null);
      setAdjustmentDetails({
        studentId: '',
        amount: '',
        reason: '',
      });
    } catch (error) {
      setAlert('Error saving fee adjustment');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAdjustment = (adjustment) => {
    setSelectedAdjustment(adjustment);
    setAdjustmentDetails({
      studentId: adjustment.studentId,
      amount: adjustment.amount,
      reason: adjustment.reason,
    });
    setOpenDialog(true);
  };

  const handleDeleteAdjustment = async (adjustmentId) => {
    if (window.confirm('Are you sure you want to delete this fee adjustment?')) {
      setLoading(true);
      try {
        await fetch(`/api/admin/feeAdjustments/${adjustmentId}`, {
          method: 'DELETE',
        });

        fetchFeeAdjustments();
      } catch (error) {
        setAlert('Error deleting fee adjustment');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Fee Adjustments Management
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add Fee Adjustment
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
              {feeAdjustments.map((adjustment) => (
                <TableRow key={adjustment.id}>
                  <TableCell>{adjustment.studentName}</TableCell>
                  <TableCell>{adjustment.amount}</TableCell>
                  <TableCell>{adjustment.reason}</TableCell>
                  <TableCell>{new Date(adjustment.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button startIcon={<Edit />} onClick={() => handleEditAdjustment(adjustment)}>
                      Edit
                    </Button>
                    <Button startIcon={<Delete />} color="error" onClick={() => handleDeleteAdjustment(adjustment.id)}>
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
            <Alert onClose={() => setAlert(null)} severity="error">
              {alert}
            </Alert>
          </Snackbar>
        )}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{selectedAdjustment ? 'Edit Fee Adjustment' : 'Add New Fee Adjustment'}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Student</InputLabel>
              <Select
                value={adjustmentDetails.studentId}
                onChange={(e) => setAdjustmentDetails({ ...adjustmentDetails, studentId: e.target.value })}
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
              value={adjustmentDetails.amount}
              onChange={(e) => setAdjustmentDetails({ ...adjustmentDetails, amount: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Reason"
              value={adjustmentDetails.reason}
              onChange={(e) => setAdjustmentDetails({ ...adjustmentDetails, reason: e.target.value })}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddEditAdjustment} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default FeeAdjustments;