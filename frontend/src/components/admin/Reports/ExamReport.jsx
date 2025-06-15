// src/components/admin/Reports/ExamReports.jsx
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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { saveAs } from 'file-saver';

const ExamReports = () => {
  const [examReports, setExamReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [examType, setExamType] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const examTypes = [
    { value: 'weekly', label: 'Weekly Test' },
    { value: 'midSemester', label: 'Mid Semester' },
    { value: 'finalSemester', label: 'Final Semester' }
  ];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    // Reset selection when classes change
    if (classes.length > 0 && selectedClass) {
      const classExists = classes.some(cls => cls._id === selectedClass);
      if (!classExists) {
        setSelectedClass('');
      }
    }
  }, [classes, selectedClass]);

  useEffect(() => {
    // Reset section when class changes
    if (selectedClass) {
      setSelectedSection('');
      fetchSections(selectedClass);
    } else {
      setSections([]);
      setSelectedSection('');
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/admin/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Classes data:', data); // Debug log

      if (data.success && Array.isArray(data.data)) {
        setClasses(data.data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setAlert({
        severity: 'error',
        message: `Failed to load classes: ${error.message}`
      });
      setClasses([]); // Initialize with empty array on error
    }
  };

  const fetchSections = async (classId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1/admin/classes/${classId}/sections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch sections');

      const data = await response.json();
      if (data.success) {
        setSections(data.data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setAlert({
        severity: 'error',
        message: 'Failed to load sections'
      });
    }
  };

  const setAlertMessage = (severity, message) => {
    setAlert({ severity, message });
  };

  const fetchExamReports = async () => {
    if (!selectedClass || !examType) {
      setAlertMessage('error', 'Please select both class and exam type');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        classId: selectedClass,
        examType,
        ...(selectedSection && { sectionId: selectedSection })
      });

      console.log('Fetching exam reports with params:', Object.fromEntries(params));

      const response = await fetch(
        `http://localhost:5000/api/v1/admin/reports/exams?${params}`,
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
      console.log('Exam reports response:', data);

      if (data.success) {
        setExamReports(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch exam reports');
      }
    } catch (error) {
      console.error('Error fetching exam reports:', error);
      setAlertMessage('error', error.message || 'Error fetching exam reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setDetailDialogOpen(true);
  };

  const renderStudentsList = () => (
    <TableContainer>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Roll Number</TableCell>
                    <TableCell>Overall Percentage</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Status</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {examReports.map((student) => (
                    <TableRow 
                        key={student.id} 
                        onClick={() => handleStudentClick(student)}
                        sx={{ 
                            cursor: 'pointer', 
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor: student.marksStatus === 'Not Uploaded' ? 'warning.light' : 
                                    student.overallPercentage === '0.0' ? 'error.light' : 'inherit'
                        }}
                    >
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.rollNumber}</TableCell>
                        <TableCell>
                            {student.marksStatus === 'Not Uploaded' ? 
                                'Pending' : 
                                `${student.overallPercentage}%`
                            }
                        </TableCell>
                        <TableCell>
                            {student.marksStatus === 'Not Uploaded' ? 
                                'N/A' : 
                                student.overallGrade
                            }
                        </TableCell>
                        <TableCell>
                            <Typography
                                color={student.marksStatus === 'Not Uploaded' ? 
                                    'warning.main' : 'success.main'}
                            >
                                {student.marksStatus}
                            </Typography>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
);

const renderStudentDetailDialog = () => (
    <Dialog 
        open={detailDialogOpen} 
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
    >
        <DialogTitle>
            Student Exam Details
            {selectedStudent?.marksStatus === 'Not Uploaded' && (
                <Typography color="warning.main" variant="subtitle2">
                    Marks not yet uploaded
                </Typography>
            )}
        </DialogTitle>
        <DialogContent>
            {selectedStudent && (
                <>
                    {/* ...existing student info... */}
                    
                    {selectedStudent.marksStatus === 'Not Uploaded' ? (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography color="warning.main">
                                Exam marks have not been uploaded yet for this student
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Subject-wise Performance
                            </Typography>
                            <Table>
                                {/* ...existing subject table... */}
                            </Table>
                        </>
                    )}
                </>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
    </Dialog>
);

  const exportToCSV = () => {
    if (!examReports.length) {
      setAlertMessage('warning', 'No data to export');
      return;
    }

    // Create detailed report including both overall and subject-wise performance
    const csvData = examReports.flatMap(student => [
      {
        'Student Name': student.studentName,
        'Roll Number': student.rollNumber,
        'Class': student.className,
        'Section': student.sectionName,
        'Type': 'Overall',
        'Subject': 'All Subjects',
        'Marks': '-',
        'Total': '-',
        'Percentage': student.overallPercentage,
        'Grade': student.overallGrade
      },
      ...student.subjectWiseMarks.map(subject => ({
        'Student Name': student.studentName,
        'Roll Number': student.rollNumber,
        'Class': student.className,
        'Section': student.sectionName,
        'Type': 'Subject',
        'Subject': subject.subjectName,
        'Marks': subject.marksObtained,
        'Total': subject.totalMarks,
        'Percentage': subject.percentage,
        'Grade': subject.grade
      }))
    ]);

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers,
      ...csvData.map(row => headers.map(header => row[header]))
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `exam_reports_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const renderFilters = () => (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Select Class</InputLabel>
            <Select
              value={selectedClass || ''}
              onChange={(e) => {
                console.log('Selected class:', e.target.value);
                setSelectedClass(e.target.value);
              }}
              disabled={loading}
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
        </Grid>

        <Grid item xs={12} md={4}>
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
              <MenuItem value="">
                <em>All Sections</em>
              </MenuItem>
              {Array.isArray(sections) && sections.map((section) => (
                <MenuItem key={section._id} value={section._id}>
                  {section.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Exam Type</InputLabel>
            <Select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              disabled={loading}
            >
              <MenuItem value="">
                <em>Select exam type</em>
              </MenuItem>
              {examTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Exam Reports
        </Typography>

        {renderFilters()}

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="contained" onClick={fetchExamReports}>
            Generate Report
          </Button>
          <Button variant="contained" onClick={exportToCSV}>
            Export as CSV
          </Button>
        </Box>

        {renderStudentsList()}
        {renderStudentDetailDialog()}

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

export default ExamReports;