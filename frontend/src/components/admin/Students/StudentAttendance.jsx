// frontend/src/components/admin/Students/StudentAttendance.jsx

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useStudent } from './context/StudentContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentAttendance = () => {
  const { currentUser, currentDate } = useStudent();
  // Update initial state values to empty strings instead of undefined
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date(currentDate));
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [statistics, setStatistics] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
  });
  const [bulkAction, setBulkAction] = useState('present'); // Ensure initial value
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSections();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    }
  }, [selectedClass, selectedSection]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch('/api/v1/admin/academic/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/admin/academic/sections/class/${selectedClass}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }

      const data = await response.json();
      if (data.success) {
        setSections(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setError('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(
        `/api/v1/admin/attendance/students?classId=${selectedClass}&sectionId=${selectedSection}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      if (data.success) {
        setStudents(data.data || []);
        initializeAttendance(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const initializeAttendance = (studentList) => {
    const initialAttendance = {};
    studentList.forEach(student => {
      initialAttendance[student.id] = 'present';
    });
    setAttendance(initialAttendance);
  };

  const handleAttendanceChange = (studentId, value) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: value || 'present' // Ensure default value
    }));
  };

  const submitAttendance = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch('/api/v1/admin/attendance/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: attendanceDate,
          classId: selectedClass,
          sectionId: selectedSection,
          attendance,
          submittedBy: currentUser?._id
        })
      });

      const data = await response.json();
      if (data.success) {
        // Handle success
      } else {
        throw new Error(data.message || 'Failed to submit attendance');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  const applyBulkAction = () => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = bulkAction;
    });
    setAttendance(newAttendance);
  };

  const calculateStatistics = () => {
    const stats = {
      totalPresent: 0,
      totalAbsent: 0,
      totalLate: 0,
    };
    Object.values(attendance).forEach(status => {
      stats[`total${status.charAt(0).toUpperCase() + status.slice(1)}`]++;  // Dynamically capitalize the status for stats
    });
    setStatistics(stats);
  };

  useEffect(() => {
    calculateStatistics();
  }, [attendance]);

  const renderAttendanceChart = () => (
    <Box sx={{ mt: 4, height: 300 }}>
      <Bar
        data={{
          labels: ['Present', 'Absent', 'Late'],
          datasets: [{
            data: [statistics.totalPresent, statistics.totalAbsent, statistics.totalLate],
            backgroundColor: ['#4caf50', '#f44336', '#ff9800']
          }]
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Student Attendance
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClass || ''} // Ensure empty string if null/undefined
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <MenuItem value="">Select Class</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select
                value={selectedSection || ''} // Ensure empty string if null/undefined
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
              >
                <MenuItem value="">Select Section</MenuItem>
                {sections.map((section) => (
                  <MenuItem key={section._id} value={section._id}>
                    {section.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            {/* LocalizationProvider is wrapping DatePicker */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Attendance Date"
                value={attendanceDate}
                onChange={(newValue) => setAttendanceDate(newValue)}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200, mr: 2 }}>
            <InputLabel>Bulk Action</InputLabel>
            <Select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <MenuItem value="present">Mark All Present</MenuItem>
              <MenuItem value="absent">Mark All Absent</MenuItem>
              <MenuItem value="late">Mark All Late</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={applyBulkAction}>
            Apply to All
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, bgcolor: '#4caf50', color: 'white' }}>
              <Typography>Present: {statistics.totalPresent}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, bgcolor: '#f44336', color: 'white' }}>
              <Typography>Absent: {statistics.totalAbsent}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ p: 2, bgcolor: '#ff9800', color: 'white' }}>
              <Typography>Late: {statistics.totalLate}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {renderAttendanceChart()}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Roll No</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Attendance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.rollNo}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <Select
                      value={attendance[student.id] || 'present'} // Ensure default value
                      onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                      size="small"
                    >
                      <MenuItem value="present">Present</MenuItem>
                      <MenuItem value="absent">Absent</MenuItem>
                      <MenuItem value="late">Late</MenuItem>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={submitAttendance}
          >
            Submit Attendance
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentAttendance;
