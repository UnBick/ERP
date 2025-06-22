// src/components/admin/Finance/Reports/FinanceReports.jsx
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { getApiUrl } from '../../../config/apiConfig';

const FinanceReports = () => {
  const [financeReports, setFinanceReports] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState('');
  const reportTypes = ['Income', 'Expenditure', 'Fee Collection'];

  useEffect(() => {
    if (selectedReportType) {
      fetchFinanceReports();
    }
  }, [selectedReportType]);

  const fetchFinanceReports = async () => {
    if (!selectedReportType) {
      setAlert({
        severity: 'warning',
        message: 'Please select a report type'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/v1/admin/financeReports?type=${selectedReportType}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Finance reports response:', data); // Debug log

      if (data.success && Array.isArray(data.data)) {
        setFinanceReports(data.data);
      } else {
        setFinanceReports([]); // Reset to empty array if invalid data
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching finance reports:', error);
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to fetch reports'
      });
      setFinanceReports([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Finance Reports
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Report Type</InputLabel>
          <Select
            value={selectedReportType}
            onChange={(e) => setSelectedReportType(e.target.value)}
          >
            {reportTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={fetchFinanceReports}>
            Generate Report
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(financeReports) && financeReports.length > 0 ? (
                financeReports.map((report) => (
                  <TableRow key={report.id || report._id}>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.description}</TableCell>
                    <TableCell>{report.amount}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    {loading ? 'Loading...' : 'No reports available'}
                  </TableCell>
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
          <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert onClose={() => setAlert(null)} severity={alert.severity}>
              {alert.message}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default FinanceReports;