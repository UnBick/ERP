// src/components/admin/Finance/Fee/BankReconciliation.jsx
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

const BankReconciliation = () => {
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchReconciliations();
  }, []);

  const fetchReconciliations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/fees/reconciliations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reconciliations');
      }

      const data = await response.json();
      if (data.success) {
        setReconciliations(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch reconciliations');
      }
    } catch (error) {
      console.error('Error fetching reconciliations:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching reconciliations'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Bank Reconciliation
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reconciliations.map((reconciliation) => (
                <TableRow key={reconciliation.id}>
                  <TableCell>{reconciliation.transactionId}</TableCell>
                  <TableCell>{reconciliation.amount}</TableCell>
                  <TableCell>{reconciliation.date}</TableCell>
                  <TableCell>{reconciliation.status}</TableCell>
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
  );
};

export default BankReconciliation;