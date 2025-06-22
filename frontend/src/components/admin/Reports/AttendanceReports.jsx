// src/components/admin/Reports/AttendanceReports.jsx
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
  FormHelperText,
  Grid,
} from '@mui/material';
import { saveAs } from 'file-saver';
import { 
  PieChart, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie,
  Cell
} from 'recharts';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { getApiUrl } from '../../../config/apiConfig';

const AttendanceReports = () => {
  const [attendanceReports, setAttendanceReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportFormat, setReportFormat] = useState('table');
  const [reportScope, setReportScope] = useState('class');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSections, setSelectedSections] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [summaryData, setSummaryData] = useState(null);
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [sections, setSections] = useState([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    setSelectedDate(null);
    setSelectedMonth('');
    setSelectedYear('');
    setStartDate(null);
    setEndDate(null);
  }, [reportType]);

  useEffect(() => {
    if (classes.length > 0 && selectedClass) {
        const classExists = classes.some(cls => cls._id === selectedClass);
        if (!classExists) {
            setSelectedClass('');
            setSelectedSection('');
        }
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
    } else {
      setSections([]);
      setSelectedSection('');
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Fetching classes with token:', token ? 'Present' : 'Missing');

      const response = await fetch(getApiUrl('/api/v1/admin/classes'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Classes response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Classes data received:', data);

      if (data.success && Array.isArray(data.data)) {
        setClasses(data.data);
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setAlert({
        severity: 'error',
        message: `Failed to load classes: ${error.message}`
      });
      setClasses([]); // Initialize with empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (classId) => {
    try {
        const token = localStorage.getItem('token');
        console.log('Fetching sections for class:', classId); // Debug log

        const response = await fetch(
            getApiUrl(`/api/v1/admin/classes/${classId}/sections`),
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
        console.log('Sections data:', data); // Debug log

        if (data.success && Array.isArray(data.data)) {
            setSections(data.data);
        } else {
            throw new Error('Invalid sections data format');
        }
    } catch (error) {
        console.error('Error fetching sections:', error);
        setAlert({
            severity: 'error',
            message: 'Failed to load sections: ' + error.message
        });
        setSections([]); // Reset sections on error
    }
};

  const setAlertMessage = (severity, message) => {
    setAlert({ severity, message });
  };

  const fetchAttendanceReports = async () => {
    if (!selectedClass) {
        setAlertMessage('error', 'Please select a class first');
        return;
    }

    // Validate date selections based on report type
    if (reportType === 'daily' && !selectedDate) {
        setAlertMessage('error', 'Please select a date');
        return;
    }
    if (reportType === 'monthly' && (!selectedMonth || !selectedYear)) {
        setAlertMessage('error', 'Please select both month and year');
        return;
    }
    if (reportType === 'yearly' && !selectedYear) {
        setAlertMessage('error', 'Please select a year');
        return;
    }

    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
            classId: selectedClass,
            reportType,
            ...(selectedSection && { sectionId: selectedSection }),
            ...(reportType === 'daily' && { date: format(selectedDate, 'yyyy-MM-dd') }),
            ...(reportType === 'monthly' && { 
                month: selectedMonth,
                year: selectedYear
            }),
            ...(reportType === 'yearly' && { year: selectedYear })
        });

        const response = await fetch(
            getApiUrl(`/api/v1/admin/reports/attendance?${params}`), {
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
        console.log('Attendance data:', data);

        if (data.success) {
            setAttendanceReports(data.data);
        } else {
            throw new Error(data.message || 'Failed to fetch reports');
        }
    } catch (error) {
        console.error('Error fetching reports:', error);
        setAlertMessage('error', error.message || 'Error fetching attendance reports');
    } finally {
        setLoading(false);
    }
};

  const exportToCSV = () => {
    const csvData = attendanceReports.map(report => ({
      Date: report.date,
      'Student Name': report.studentName,
      Status: report.status,
    }));
    const csvContent = [
      ['Date', 'Student Name', 'Status'],
      ...csvData.map(row => [row.Date, row['Student Name'], row.Status])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'attendance_reports.csv');
  };

  const generateComparativeReport = async () => {
    // Implementation for comparing attendance between sections/classes
  };

  const calculateSummary = (data) => {
    // Add attendance calculation logic
  };

  const renderCharts = () => {
    if (!summaryData) return null;

    switch(viewMode) {
      case 'bar':
        return (
          <BarChart width={600} height={300} data={summaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" fill="#4caf50" />
            <Bar dataKey="absent" fill="#f44336" />
            <Bar dataKey="late" fill="#ff9800" />
          </BarChart>
        );
      case 'pie':
        // Add pie chart implementation
        break;
      default:
        return null;
    }
  };

  const renderVisualization = () => {
    switch(reportFormat) {
      case 'pie':
        return <PieChart data={transformDataForPieChart(attendanceReports)} />;
      case 'bar':
        return <BarChart data={transformDataForBarChart(attendanceReports)} />;
      default:
        return (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.studentName}</TableCell>
                    <TableCell>{report.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
    }
  };

  const renderClassSelect = () => (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass || ''}  // Add || '' here
              onChange={(e) => {
                console.log('Selected class:', e.target.value);
                console.log('Available classes:', classes.map(c => c._id));
                setSelectedClass(e.target.value);
              }}
              disabled={loading}
            >
              <MenuItem value=""><em>Select a class</em></MenuItem>
              {Array.isArray(classes) && classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Section (Optional)</InputLabel>
            <Select
              value={selectedSection || ''}  // Add || '' here
              onChange={(e) => {
                console.log('Selected section:', e.target.value);
                setSelectedSection(e.target.value);
              }}
              disabled={!selectedClass || loading}
            >
              <MenuItem value=""><em>All Sections</em></MenuItem>
              {Array.isArray(sections) && sections.map((section) => (
                <MenuItem key={section._id} value={section._id}>
                  {section.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );

  const renderReportTypeSelect = () => (
    <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Report Type</InputLabel>
        <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
        >
            <MenuItem value="daily">Daily Report</MenuItem>
            <MenuItem value="monthly">Monthly Report (Percentage)</MenuItem>
            <MenuItem value="yearly">Yearly Report (Percentage)</MenuItem>
        </Select>
    </FormControl>
  );

  const renderDateSelection = () => {
    switch(reportType) {
      case 'daily':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
              maxDate={new Date()}
            />
          </LocalizationProvider>
        );
      case 'monthly':
        return (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      case 'yearly':
        return (
          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      default:
        return null;
    }
  };

  const renderAttendanceTable = () => {
    switch(reportType) {
        case 'monthly':
            return renderMonthlyTable();
        case 'yearly':
            return renderYearlyTable();
        default:
            return renderDailyTable();
    }
  };

  const renderDailyTable = () => (
    <TableContainer>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Roll Number</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {Array.isArray(attendanceReports) && attendanceReports.map((report) => (
                    <TableRow key={report.id}>
                        <TableCell>{report.studentName}</TableCell>
                        <TableCell>{report.rollNumber}</TableCell>
                        <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Box
                                sx={{
                                    color: report.status === 'present' ? 'success.main' : 'error.main',
                                    fontWeight: 'medium'
                                }}
                            >
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </Box>
                        </TableCell>
                    </TableRow>
                ))}
                {(!Array.isArray(attendanceReports) || attendanceReports.length === 0) && (
                    <TableRow>
                        <TableCell colSpan={4} align="center">
                            No attendance records found for this date
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </TableContainer>
  );

  const renderMonthlyTable = () => (
    <TableContainer>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Roll Number</TableCell>
                    <TableCell>Month-Year</TableCell>
                    <TableCell>Present %</TableCell>
                    <TableCell>Absent %</TableCell>
                    <TableCell>Total Days</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {Array.isArray(attendanceReports) && attendanceReports.map((student) => (
                    <TableRow key={student.studentId}>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>{`${selectedMonth}-${selectedYear}`}</TableCell>
                        <TableCell>
                            {student.records && student.records.presentPercentage ? 
                                `${student.records.presentPercentage}%` : 'N/A'}
                        </TableCell>
                        <TableCell>
                            {student.records && student.records.absentPercentage ? 
                                `${student.records.absentPercentage}%` : 'N/A'}
                        </TableCell>
                        <TableCell>
                            {student.records ? student.records.totalDays : 'N/A'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
  );

  const renderYearlyTable = () => (
    <TableContainer>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Roll Number</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Present %</TableCell>
                    <TableCell>Absent %</TableCell>
                    <TableCell>Total Days</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {Array.isArray(attendanceReports) && attendanceReports.map((student) => (
                    <TableRow key={student.studentId}>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>{selectedYear}</TableCell>
                        <TableCell>
                            {student.records && student.records.presentPercentage ? 
                                `${student.records.presentPercentage}%` : 'N/A'}
                        </TableCell>
                        <TableCell>
                            {student.records && student.records.absentPercentage ? 
                                `${student.records.absentPercentage}%` : 'N/A'}
                        </TableCell>
                        <TableCell>
                            {student.records ? student.records.totalDays : 'N/A'}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Attendance Reports
        </Typography>

        {renderClassSelect()}
        {renderReportTypeSelect()}
        
        <Box sx={{ mb: 3 }}>
          {renderDateSelection()}
        </Box>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="contained" 
            onClick={() => fetchAttendanceReports(reportType)}
          >
            Generate Report
          </Button>
          <Button 
            variant="contained" 
            onClick={() => exportToCSV(reportType)}
          >
            Export as CSV
          </Button>
        </Box>

        {renderAttendanceTable()}

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
              severity={alert.severity}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default AttendanceReports;