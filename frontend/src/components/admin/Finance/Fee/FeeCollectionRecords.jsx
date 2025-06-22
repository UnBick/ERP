// src/components/admin/Finance/Fee/FeeCollectionRecords.jsx
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
} from '@mui/material';
import { getApiUrl } from '../../../../config/apiConfig';


const FeeCollectionRecords = () => {
  const [feeCollectionRecords, setFeeCollectionRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchFeeCollectionRecords();
  }, []);

  const fetchFeeCollectionRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/v1/admin/fees/collections'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch fee collection records');
      }

      const data = await response.json();
      if (data.success) {
        const formattedRecords = data.data.map(record => ({
          id: record._id,
          studentName: record.student?.name || 'N/A',
          className: record.student?.class?.name || 'N/A',
          amount: record.amount,
          date: new Date(record.createdAt).toLocaleDateString(),
          paymentMode: record.paymentMode,
          receiptNumber: record.receiptNumber
        }));
        setFeeCollectionRecords(formattedRecords);
      } else {
        throw new Error(data.message || 'Failed to fetch fee collection records');
      }
    } catch (error) {
      console.error('Error fetching fee collection records:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching fee collection records'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Fee Collection Records
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Receipt No.</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Mode</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeCollectionRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.receiptNumber}</TableCell>
                  <TableCell>{record.studentName}</TableCell>
                  <TableCell>{record.className}</TableCell>
                  <TableCell>{record.amount}</TableCell>
                  <TableCell>{record.paymentMode}</TableCell>
                  <TableCell>{record.date}</TableCell>
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
              {alert.message}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default FeeCollectionRecords;