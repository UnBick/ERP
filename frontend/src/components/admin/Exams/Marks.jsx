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
  Grid,
  Fade,
  IconButton,
} from '@mui/material';
import { Save, Clear, Edit } from '@mui/icons-material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import * as XLSX from 'xlsx';
import axios from 'axios';

const Results = () => {
  // State declarations
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [examinations, setExaminations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marks, setMarks] = useState({});
  const [existingMarks, setExistingMarks] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [examDetails, setExamDetails] = useState(null);
  const [subjectTotalMarks, setSubjectTotalMarks] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);

  useEffect(() => {
    fetchExaminations();
  }, []);

  // Fetch functions
  const fetchExaminations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/exams/examinations');
      if (response.data.success) {
        const transformedExams = response.data.data.map(exam => ({
          id: exam._id,
          name: exam.name,
          totalMarks: exam.totalMarks,
          duration: exam.duration,
          applicableClasses: exam.applicableClasses || [],
          exceptions: exam.exceptions || []
        }));
        setExaminations(transformedExams);
      }
    } catch (error) {
      setAlert({ severity: 'error', message: 'Error fetching examinations' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamDetails = async (examId) => {
    try {
      const response = await axios.get(`/api/exams/examinations/${examId}`);
      if (response.data.success) {
        const examDetails = response.data.data;
        setClasses(examDetails.applicableClasses.map(cls => ({
          id: cls.id,
          name: cls.name
        })));
        setExamDetails(examDetails);
      }
    } catch (error) {
      setAlert({ severity: 'error', message: 'Error fetching exam details' });
    }
  };

  const fetchExistingMarks = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/marks/${selectedExam}/${selectedClass}/${selectedSection}/${selectedSubject}`
      );
      const data = await response.json();
      if (data && Object.keys(data).length > 0) {
        setExistingMarks(data);
        setMarks(data);
      } else {
        setExistingMarks(null);
        initializeMarks(students);
      }
    } catch (error) {
      setAlert({ severity: 'error', message: 'Error fetching existing marks' });
      setExistingMarks(null);
    } finally {
      setLoading(false);
    }
  };

  const initializeMarks = (studentList) => {
    const initialMarks = {};
    studentList.forEach(student => {
      initialMarks[student.id] = '';
    });
    setMarks(initialMarks);
  };

  // Handle change functions
  const handleExamChange = async (event) => {
    const examId = event.target.value;
    setSelectedExam(examId);
    resetSelections(['class', 'section', 'subject']);
    if (examId) {
      setLoading(true);
      try {
        await fetchExamDetails(examId);
      } catch (error) {
        setAlert({ severity: 'error', message: 'Error fetching data' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClassChange = async (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
    resetSelections(['section', 'subject']);
    if (classId) {
      setLoading(true);
      try {
        const [sectionsRes, subjectsRes] = await Promise.all([
          axios.get(`/api/exams/classes/${classId}/sections`),
          axios.get(`/api/exams/classes/${classId}/subjects`)
        ]);

        if (sectionsRes.data.success) {
          setSections(sectionsRes.data.data.map(section => ({
            id: section._id,
            name: section.name
          })));
        }

        if (subjectsRes.data.success) {
          setSubjects(subjectsRes.data.data);
        }
      } catch (error) {
        setAlert({ severity: 'error', message: 'Error fetching class data' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSectionChange = async (event) => {
    const sectionId = event.target.value;
    setSelectedSection(sectionId);
    if (sectionId) {
      setLoading(true);
      try {
        const [studentsResponse, subjectsResponse] = await Promise.all([
          axios.get(`/api/exams/classes/${selectedClass}/sections/${sectionId}/students`),
          axios.get(`/api/exams/subjects`)
        ]);

        if (studentsResponse.data.success) {
          setStudents(studentsResponse.data.data);
        }

        if (subjectsResponse.data.success) {
          setSubjects(subjectsResponse.data.data);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setAlert({ 
          severity: 'error', 
          message: 'Error fetching data. Please try again.' 
        });
        setStudents([]);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubjectChange = async (event) => {
    const subjectId = event.target.value;
    setSelectedSubject(subjectId);
    setIsEditing(false);
    setUploadErrors([]); // Clear any existing upload errors

    if (subjectId) {
      setLoading(true);
      try {
        // Get subject's total marks from exam configuration
        const exception = examDetails?.exceptions?.find(e => e.subject === subjectId);
        const totalMarks = exception ? exception.totalMarks : examDetails?.totalMarks;
        setSubjectTotalMarks(totalMarks);

        // Fetch existing marks if any
        const marksResponse = await axios.get(
          `/api/exams/marks/${selectedExam}/${selectedClass}/${selectedSection}/${subjectId}`
        );

        if (marksResponse.data.success && marksResponse.data.data) {
          setExistingMarks(marksResponse.data.data);
          setMarks(marksResponse.data.data);
          setIsEditing(false);
        } else {
          setExistingMarks(null);
          // Initialize marks only for this subject
          const initialMarks = {};
          students.forEach(student => {
            initialMarks[student.id] = '';
          });
          setMarks(initialMarks);
          setIsEditing(true);
        }
      } catch (error) {
        console.error('Error:', error);
        setAlert({
          severity: 'error',
          message: 'Error fetching marks data'
        });
        setExistingMarks(null);
        initializeMarks(students);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkChange = (studentId, value) => {
    if (value === '' || (value >= 0 && value <= subjectTotalMarks)) {
      setMarks(prev => ({
        ...prev,
        [studentId]: value
      }));
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveMarks = async () => {
    setLoading(true);
    try {
      await fetch('/api/admin/marks', {
        method: existingMarks ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examinationId: selectedExam,
          classId: selectedClass,
          sectionId: selectedSection,
          subjectId: selectedSubject,
          marks: marks
        }),
      });
      setAlert({ 
        severity: 'success', 
        message: `Marks ${existingMarks ? 'updated' : 'saved'} successfully` 
      });
      setIsEditing(false);
      fetchExistingMarks();
    } catch (error) {
      setAlert({ 
        severity: 'error', 
        message: `Error ${existingMarks ? 'updating' : 'saving'} marks` 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSelections = (items) => {
    if (items.includes('class')) {
      setSelectedClass('');
      setClasses([]);
    }
    if (items.includes('section')) {
      setSelectedSection('');
      setSections([]);
      setStudents([]);
    }
    if (items.includes('subject')) {
      setSelectedSubject('');
      setSubjects([]);
      setMarks({});
      setExistingMarks(null);
      setIsEditing(false);
    }
  };

  const downloadTemplate = () => {
    try {
      const currentSubject = subjects.find(s => s.id === selectedSubject);
      const filename = `marks_template_${currentSubject?.name || 'subject'}_${selectedClass}_${selectedSection}.xlsx`;
      
      const wsData = [
        ['Roll No', 'Student Name', `Marks (out of ${subjectTotalMarks})`],
        ...students.map(student => [student.rollNo, student.name, ''])
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Marks Template');

      // Add headers to identify the subject and max marks
      ws['A1'].c = [{ a: 'Subject: ' + currentSubject?.name }];
      ws['B1'].c = [{ a: `Maximum Marks: ${subjectTotalMarks}` }];

      XLSX.writeFile(wb, filename);
    } catch (error) {
      setAlert({
        severity: 'error',
        message: 'Error generating template'
      });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        if (!selectedSubject) {
          setAlert({
            severity: 'error',
            message: 'Please select a subject before uploading marks'
          });
          return;
        }

        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Remove header row
        data.shift();

        const errors = [];
        const newMarks = { ...marks }; // Preserve existing marks for other subjects

        data.forEach((row, index) => {
          const [rollNo, name, mark] = row;
          const student = students.find(s => s.rollNo === rollNo);
          
          if (!student) {
            errors.push(`Row ${index + 2}: Student with Roll No ${rollNo} not found`);
            return;
          }

          const markValue = parseFloat(mark);
          if (isNaN(markValue)) {
            errors.push(`Row ${index + 2}: Invalid mark value`);
            return;
          }

          if (markValue < 0 || markValue > subjectTotalMarks) {
            errors.push(`Row ${index + 2}: Mark value out of range (0-${subjectTotalMarks})`);
          }

          newMarks[student.id] = markValue;
        });

        setUploadErrors(errors);
        if (errors.length === 0) {
          setMarks(newMarks);
          setAlert({
            severity: 'success',
            message: `Marks uploaded successfully for ${subjects.find(s => s.id === selectedSubject)?.name}`
          });
        }

      } catch (error) {
        setAlert({
          severity: 'error',
          message: 'Error processing file'
        });
      }
    };

    reader.readAsBinaryString(file);
    // Reset file input
    event.target.value = '';
  };

  return (
    <Box sx={{ 
      width: '100%', 
      p: 3,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
      minHeight: '100vh'
    }}>
      <Paper elevation={3} sx={{ 
        p: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
      }}>
        <Typography variant="h5" sx={{
          color: '#1a237e',
          fontWeight: 600,
          mb: 4,
          letterSpacing: '0.5px',
          textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
        }}>
          Exam Results Management
        </Typography>

        <Fade in={true}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#f8f9fa',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    }
                  }
                }
              }}>
                <InputLabel>Select Examination</InputLabel>
                <Select
                  value={selectedExam || ''}
                  onChange={handleExamChange}
                  label="Select Examination"
                >
                  <MenuItem value="" key="none">Select an exam</MenuItem>
                  {examinations.map((exam) => (
                    <MenuItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Fade>

        {selectedExam && (
          <Fade in={true}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#f8f9fa',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      }
                    }
                  }
                }}>
                  <InputLabel>Select Class</InputLabel>
                  <Select
                    value={selectedClass || ''}
                    onChange={handleClassChange}
                    label="Select Class"
                  >
                    <MenuItem value="" key="none">Select a class</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {selectedClass && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#f8f9fa',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        }
                      }
                    }
                  }}>
                    <InputLabel>Select Section</InputLabel>
                    <Select
                      value={selectedSection || ''}
                      onChange={handleSectionChange}
                      label="Select Section"
                    >
                      <MenuItem value="" key="none">Select a section</MenuItem>
                      {sections.map((section) => (
                        <MenuItem key={section.id} value={section.id}>
                          {section.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Fade>
        )}

        {selectedSection && (
          <Fade in={true}>
            <Box>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#f8f9fa',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        }
                      }
                    }
                  }}>
                    <InputLabel>Select Subject</InputLabel>
                    <Select
                      value={selectedSubject || ''}
                      onChange={handleSubjectChange}
                      label="Select Subject"
                    >
                      <MenuItem value="">Select a subject</MenuItem>
                      {subjects.map((subject) => (
                        <MenuItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {students.length > 0 && (
                <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={downloadTemplate}
                  >
                    Download Template
                  </Button>
                  {selectedSubject && (
                    <Button
                      variant="outlined"
                      startIcon={<FileUploadIcon />}
                      component="label"
                    >
                      Upload Marks
                      <input
                        type="file"
                        hidden
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                      />
                    </Button>
                  )}
                </Box>
              )}

              {uploadErrors.length > 0 && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Please correct the following errors:
                  </Typography>
                  <ul>
                    {uploadErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              {students.length > 0 && (
                <TableContainer component={Paper} sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '& .MuiTableHead-root': {
                    bgcolor: '#f8f9fa',
                    '& .MuiTableCell-head': {
                      fontWeight: 600,
                      color: '#1a237e'
                    }
                  },
                  '& .MuiTableBody-root .MuiTableRow-root:hover': {
                    bgcolor: 'rgba(0,0,0,0.01)'
                  },
                  '& .MuiTableCell-root': {
                    borderColor: 'rgba(224, 224, 224, 0.4)'
                  }
                }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Roll No</TableCell>
                        <TableCell>Student Name</TableCell>
                        {selectedSubject && (
                          <TableCell>
                            Marks {subjectTotalMarks && `(out of ${subjectTotalMarks})`}
                            {existingMarks && !isEditing && (
                              <IconButton
                                size="small"
                                onClick={() => setIsEditing(true)}
                                sx={{ 
                                  ml: 1,
                                  color: 'primary.main',
                                  '&:hover': {
                                    color: 'primary.dark',
                                    bgcolor: 'rgba(0,0,0,0.04)'
                                  }
                                }}
                              >
                                <Edit />
                              </IconButton>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.rollNo}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          {selectedSubject && (
                            <TableCell>
                              {existingMarks && !isEditing ? (
                                <Typography>{marks[student.id] || '-'}</Typography>
                              ) : (
                                <TextField
                                  type="number"
                                  value={marks[student.id] || ''}
                                  onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                  inputProps={{
                                    min: 0,
                                    max: subjectTotalMarks,
                                    step: "0.01"
                                  }}
                                  size="small"
                                  error={marks[student.id] < 0 || marks[student.id] > subjectTotalMarks}
                                  helperText={
                                    marks[student.id] < 0 || marks[student.id] > subjectTotalMarks
                                      ? `Mark must be between 0-${subjectTotalMarks}`
                                      : `Max: ${subjectTotalMarks}`
                                  }
                                  sx={{
                                    '& input': {
                                      bgcolor: marks[student.id] < 0 || marks[student.id] > subjectTotalMarks
                                        ? 'error.lighter'
                                        : 'white'
                                    }
                                  }}
                                />
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {(isEditing || !existingMarks) && selectedSubject && (
                <Box sx={{ 
                  mt: 3, 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: 'flex-end' 
                }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveMarks}
                    disabled={loading}
                    startIcon={<Save />}
                    sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    {existingMarks ? 'Update Marks' : 'Save Marks'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      if (existingMarks) {
                        setMarks(existingMarks);
                        setIsEditing(false);
                      } else {
                        initializeMarks(students);
                      }
                    }}
                    startIcon={<Clear />}
                    sx={{
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(211, 47, 47, 0.04)'
                      }
                    }}
                  >
                    {existingMarks ? 'Cancel' : 'Clear All'}
                  </Button>
                </Box>
              )}
            </Box>
          </Fade>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        <Snackbar
          open={!!alert}
          autoHideDuration={6000}
          onClose={() => setAlert(null)}
        >
          <Alert 
            onClose={() => setAlert(null)} 
            severity={alert?.severity || 'error'}
          >
            {alert?.message || alert}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default Results;