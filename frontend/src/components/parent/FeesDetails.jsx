// src/components/parent/FeesDetails.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, Grid, Card, CardContent, LinearProgress, FormControl, InputLabel, Select, MenuItem, DialogTitle, DialogContent } from '@mui/material';
import { CloudDownload, Payment, Receipt, History } from '@mui/icons-material';
import { PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { getApiUrl } from '../../config/apiConfig';


const FeesDetails = () => {
  const [feesDetails, setFeesDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    show: false,
    severity: 'info',
    message: ''
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [receiptDialog, setReceiptDialog] = useState(null);
  const [summary, setSummary] = useState({
    totalDue: 0,
    totalPaid: 0,
    nextDueDate: null
  });

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchFeesDetails(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        getApiUrl('/api/v1/parent/children'),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStudents(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedStudent(response.data.data[0].id);
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      handleAlert('error', error.response?.data?.message || 'Error fetching students list');
    }
  };

  const fetchFeesDetails = async (studentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        getApiUrl(`/api/v1/parent/fees/${studentId}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const { fees, payments, summary } = response.data.data;
        setFeesDetails(fees);
        setPaymentHistory(payments);
        setSummary(summary);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      handleAlert('error', error.response?.data?.message || 'Error fetching fees details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (fee) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.pendingAmount);
    setPaymentDialogOpen(true);
  };

  const processPayment = async () => {
    try {
      // Initiate payment
      const initResponse = await axios.post(getApiUrl('/api/v1/parent/fees/initiate-payment'), {
        studentId: selectedStudent,
        feeId: selectedFee._id,
        amount: paymentAmount
      });

      // Here you would handle the payment gateway integration
      // For demonstration, we'll simulate a successful payment
      const paymentIntent = initResponse.data.data.paymentIntent;

      // Confirm payment
      await axios.post(getApiUrl('/api/v1/parent/fees/confirm-payment'), {
        studentId: selectedStudent,
        feeId: selectedFee._id,
        paymentIntentId: paymentIntent.id,
        amount: paymentAmount
      });

      setPaymentDialogOpen(false);
      fetchFeesDetails(selectedStudent);
      handleAlert('success', 'Payment processed successfully');
    } catch (error) {
      handleAlert('error', 'Payment failed');
    }
  };

  const downloadReceipt = async (feeId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        getApiUrl(`/api/v1/parent/fees/receipt/${feeId}`),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${feeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      handleAlert('error', 'Error downloading receipt');
    }
  };

  const handleAlert = (severity, message) => {
    setAlert({
      show: true,
      severity,
      message
    });
  };

  const renderSummary = () => (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total Due</Typography>
            <Typography variant="h4">${summary.totalDue}</Typography>
            <LinearProgress 
              variant="determinate" 
              value={(summary.totalPaid / (summary.totalPaid + summary.totalDue)) * 100} 
            />
          </CardContent>
        </Card>
      </Grid>
      {/* Add more summary cards */}
    </Grid>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Student</InputLabel>
        <Select
          value={selectedStudent || ''}
          onChange={(e) => setSelectedStudent(e.target.value)}
        >
          {students.map((student) => (
            <MenuItem key={student.id} value={student.id}>
              {student.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="h6" gutterBottom>
        Fees Details
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : feesDetails.length ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feesDetails.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>{new Date(fee.date).toLocaleDateString()}</TableCell>
                  <TableCell>{fee.description}</TableCell>
                  <TableCell>{fee.amount}</TableCell>
                  <TableCell>{fee.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">No fees details available</Typography>
      )}
      <Snackbar 
        open={alert.show} 
        autoHideDuration={6000} 
        onClose={() => setAlert(prev => ({ ...prev, show: false }))}
      >
        <Alert 
          onClose={() => setAlert(prev => ({ ...prev, show: false }))} 
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
      {renderSummary()}
      
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button startIcon={<History />}>
          Payment History
        </Button>
        <Button startIcon={<CloudDownload />}>
          Download All Receipts
        </Button>
      </Box>

      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          {/* Add payment form */}
        </DialogContent>
      </Dialog>

      {/* Add receipt preview dialog */}
    </Box>
  );
};

export default FeesDetails;