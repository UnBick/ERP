// src/components/admin/Reports/StudentReports.jsx
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
import { getApiUrl } from '../../../config/apiConfig';

const StudentReports = () => {
  const [studentReports, setStudentReports] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/v1/admin/classes'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const result = await response.json();
      console.log('Classes data:', result); // Debug log

      if (result.success && Array.isArray(result.data)) {
        setClasses(result.data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setAlert({
        severity: 'error',
        message: 'Error fetching classes'
      });
      setClasses([]); // Initialize with empty array on error
    }
  };

  const fetchStudentReports = async () => {
    if (!selectedClass || !startDate || !endDate) {
      setAlert({
        severity: 'warning',
        message: 'Please select class and date range'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const response = await fetch(
        getApiUrl(`/api/v1/admin/studentReports?classId=${selectedClass}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`),
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
      console.log('Student reports response:', data); // Debug log

      if (data.success && Array.isArray(data.data)) {
        setStudentReports(data.data);
      } else {
        setStudentReports([]); // Reset to empty array if no valid data
        throw new Error(data.message || 'Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching student reports:', error);
      setAlert({
        severity: 'error',
        message: error.message || 'Error fetching student reports'
      });
      setStudentReports([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = studentReports.map(report => ({
      'Student Name': report.studentName,
      Class: report.className,
      Exam: report.examName,
      Marks: report.marks,
      Grade: report.grade,
    }));
    const csvContent = [
      ['Student Name', 'Class', 'Exam', 'Marks', 'Grade'],
      ...csvData.map(row => [row['Student Name'], row.Class, row.Exam, row.Marks, row.Grade])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'student_reports.csv');
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Student Reports
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Class</InputLabel>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <MenuItem value="">
              <em>Select a class</em>
            </MenuItem>
            {Array.isArray(classes) && classes.map((cls) => (
              <MenuItem key={cls._id} value={cls._id}>
                {cls.name}
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
          <Button variant="contained" onClick={fetchStudentReports}>
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
                <TableCell>Student Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Exam</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Grade</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(studentReports) && studentReports.length > 0 ? (
                studentReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.studentName}</TableCell>
                    <TableCell>{report.className}</TableCell>
                    <TableCell>{report.examName}</TableCell>
                    <TableCell>{report.marks}</TableCell>
                    <TableCell>{report.grade}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
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
          <Snackbar 
            open={!!alert} 
            autoHideDuration={6000} 
            onClose={() => setAlert(null)}
          >
            <Alert 
              onClose={() => setAlert(null)} 
              severity={alert.severity || 'error'}
            >
              {alert.message || 'An error occurred'}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default StudentReports;