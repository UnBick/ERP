// src/components/teacher/Reports.jsx
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
  Grid,
  Select,
  MenuItem,
} from '@mui/material';
import { getApiUrl } from '../../config/apiConfig';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [reportType, setReportType] = useState('academic');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filters, setFilters] = useState({
    class: 'all',
    subject: 'all',
  });
  const [teacherRole, setTeacherRole] = useState(null);

  const reportTypes = [
    { value: 'academic', label: 'Academic Performance' },
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'behavior', label: 'Behavioral Report' },
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/teacher/reports'));
      const data = await response.json();
      setReports(data);
    } catch (error) {
      setAlert('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const requestBody = {
        type: reportType,
        dateRange,
        filters,
        templateId: getTemplateIdForReportType(reportType), // Add template selection
      };

      const response = await fetch(getApiUrl('/api/v1/teacher/generate-report'), {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to generate report');

      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportType}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setAlert({ type: 'success', message: 'Report generated successfully' });
    } catch (error) {
      setAlert({ type: 'error', message: 'Error generating report' });
    } finally {
      setLoading(false);
    }
  };

  const getTemplateIdForReportType = (type) => {
    switch (type) {
      case 'academic':
        return 'reportcard';
      case 'attendance':
        return 'attendance';
      case 'behavior':
        return 'behavior';
      default:
        return 'reportcard';
    }
  };

  const canDownloadCompleteReport = (classId, sectionId) => {
    return teacherRole?.classTeacherFor?.some(
      (item) => item.classId === classId && item.sectionId === sectionId
    );
  };

  const getAvailableSubjects = (classId, sectionId) => {
    const subjects = new Set();

    if (teacherRole?.isClassTeacher) {
      teacherRole.classTeacherFor
        .filter((item) => item.classId === classId && item.sectionId === sectionId)
        .forEach((item) => item.subjects.forEach((sub) => subjects.add(sub)));
    }

    if (teacherRole?.isSubjectTeacher) {
      teacherRole.subjectTeacherFor
        .filter((item) => item.classId === classId && item.sectionId === sectionId)
        .forEach((item) => subjects.add(item.subjectId));
    }

    return Array.from(subjects);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Generate Reports
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              fullWidth
            >
              {reportTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          {/* Add date range pickers and filters */}
        </Grid>

        <Button variant="contained" onClick={handleGenerateReport} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Generate Report'}
        </Button>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Date Generated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{new Date(report.dateGenerated).toLocaleDateString()}</TableCell>
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

        <Grid container spacing={2}>
          <Grid item xs={12}>
            {canDownloadCompleteReport(selectedClass, selectedSection) && (
              <Button onClick={() => handleDownloadCompleteReport()}>
                Download Complete Report Card
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Reports;