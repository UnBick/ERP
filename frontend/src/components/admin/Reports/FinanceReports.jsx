// src/components/admin/Reports/FinanceReports.jsx
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
  MenuItem,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/lab';
import { saveAs } from 'file-saver';

const FinanceReports = () => {
  const [financeReports, setFinanceReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const reportTypes = ['Income', 'Expenditure', 'Fee Collection'];

  useEffect(() => {
    fetchFinanceReports();
  }, [selectedReportType, startDate, endDate]);

  const fetchFinanceReports = async () => {
    if (!selectedReportType || !startDate || !endDate) {
      setAlert({
        severity: 'warning',
        message: 'Please select report type and date range'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      // Update the endpoint URL to match backend route
      const response = await fetch(
        `/api/v1/admin/reports/finance?type=${selectedReportType}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Finance reports response:', data); // Debug log

      if (data.success && Array.isArray(data.data)) {
        setFinanceReports(data.data);
      } else {
        setFinanceReports([]); // Reset to empty array if no valid data
        throw new Error(data.message || 'Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching finance reports:', error);
      setAlert({
        severity: 'error',
        message: error.message || 'Error fetching finance reports'
      });
      setFinanceReports([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/v1/admin/reports/finance/export?type=${selectedReportType}&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to export report');

      const blob = await response.blob();
      saveAs(blob, `finance_report_${selectedReportType}_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      setAlert({
        severity: 'error',
        message: 'Failed to export report'
      });
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

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} />}
          />
        </Box>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" onClick={fetchFinanceReports}>
            Generate Report
          </Button>
          <Button variant="contained" onClick={exportToCSV}>
            Export as CSV
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