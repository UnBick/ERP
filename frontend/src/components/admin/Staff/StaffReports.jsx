// frontend/src/components/admin/Staff/StaffReports.jsx
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
import { Download, Print, Share } from '@mui/icons-material';
import { useStudent } from '../Students/context/StudentContext'; // Reusing context for simplicity
import { formatDateTime } from '../../../utils/dateUtils';

const StaffReports = () => {
  const { currentUser } = useStudent();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('attendance');
  const [reportPeriod, setReportPeriod] = useState('current');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const reportTypes = [
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'performance', label: 'Performance Evaluation' },
    { value: 'leave', label: 'Leave Report' },
    { value: 'payroll', label: 'Payroll Report' },
  ];

  useEffect(() => {
    fetchReports();
  }, [reportType, reportPeriod]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/staff/generate-report?type=${reportType}&period=${reportPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reports');
      }

      console.log('Report data:', data); // Debug log

      if (data.success) {
        setReports(Array.isArray(data.data) ? data.data : []);
      } else {
        throw new Error(data.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId, format = 'pdf') => {
    try {
      if (!reportId) {
        throw new Error('Report ID is required');
      }

      console.log('Downloading report:', { reportId, format }); // Debug log
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/staff/reports/${reportId}/download?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to download report');
    }
  };

  const handleShare = async (reportId) => {
    try {
      const response = await fetch(`/api/admin/staff/reports/${reportId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sharedBy: currentUser,
          shareDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to share report');
      }

      setSuccess('Report shared successfully');
    } catch (err) {
      setError('Failed to share report');
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Staff Reports
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
              >
                <MenuItem value="current">Current Month</MenuItem>
                <MenuItem value="previous">Previous Month</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Generated Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell>{report.name}</TableCell>
                    <TableCell>{formatDateTime(report.generatedDate)}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<Download />}
                        onClick={() => handleDownload(report._id, 'pdf')}
                        sx={{ mr: 1 }}
                      >
                        PDF
                      </Button>
                      <Button
                        startIcon={<Download />}
                        onClick={() => handleDownload(report._id, 'excel')}
                        sx={{ mr: 1 }}
                      >
                        Excel
                      </Button>
                      <Button
                        startIcon={<Print />}
                        onClick={() => window.print()}
                        sx={{ mr: 1 }}
                      >
                        Print
                      </Button>
                      <Button
                        startIcon={<Share />}
                        onClick={() => handleShare(report._id)}
                      >
                        Share
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {success && (
          <Snackbar
            open={true}
            autoHideDuration={6000}
            onClose={() => setSuccess(null)}
          >
            <Alert onClose={() => setSuccess(null)} severity="success">
              {success}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default StaffReports;