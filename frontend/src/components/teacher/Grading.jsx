// src/components/teacher/Grading.jsx
import React, { useState, useEffect } from 'react';
import { TEACHER_ROLES, EXAM_TYPES, AUTO_PUBLISH_EXAMS } from '../../types/teacherTypes';
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
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import { CloudUpload, CloudDownload, Preview } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { styled } from '@mui/material/styles';
import { getApiUrl } from '../../config/apiConfig';

const StyledBox = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)'
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '& .MuiTableHead-root': {
    '& .MuiTableCell-head': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      fontWeight: 'bold'
    }
  },
  '& .MuiTableBody-root': {
    '& .MuiTableRow-root': {
      transition: 'background-color 0.2s',
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover
      },
      '&:hover': {
        backgroundColor: theme.palette.action.selected
      }
    }
  }
}));

const GradeTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    },
    '&.Mui-focused': {
      boxShadow: '0 0 0 2px ' + theme.palette.primary.main
    }
  }
}));

const MarkInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    width: '100px',
    height: '40px',
    '& input': {
      textAlign: 'center',
      padding: '8px'
    }
  }
}));

const Grading = () => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examType, setExamType] = useState('');
  const [examDate, setExamDate] = useState('');
  const [subject, setSubject] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [teacherRole, setTeacherRole] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [previewErrors, setPreviewErrors] = useState([]);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [classSubjects, setClassSubjects] = useState([]);

  useEffect(() => {
    fetchExamTypes();
    fetchTeacherRole();
  }, []);

  const fetchExamTypes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/teacher/grading/exam-types'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exam types');
      }

      const data = await response.json();
      if (data.success) {
        setExamTypes(data.data);
      }
    } catch (error) {
      setAlert({ severity: 'error', message: 'Error fetching exam types' });
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
        if (!selectedClass || !selectedSection) {
            setStudents([]);
            return;
        }

        console.log('Fetching students with:', {
            classId: selectedClass,
            sectionId: selectedSection
        });

        const token = localStorage.getItem('authToken');
        const response = await fetch(
            getApiUrl(`/api/v1/teacher/grading/students?classId=${selectedClass}&sectionId=${selectedSection}`),
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = await response.json();
        console.log('Server response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch students');
        }

        if (data.success) {
            setStudents(data.data || []);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching students:', error);
        setAlert({
            severity: 'error',
            message: error.message || 'Error fetching students'
        });
        setStudents([]);
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    }
  }, [selectedClass, selectedSection]);

  const fetchTeacherRole = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/teacher/grading/teacher-role'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teacher role');
      }

      const data = await response.json();
      console.log('Teacher role data:', data);

      if (data.success) {
        setTeacherRole(data.data);
        setAvailableClasses(data.data.availableClasses || []);
      }
    } catch (error) {
      setAlert({ 
        severity: 'error', 
        message: error.message || 'Error fetching teacher role' 
      });
    }
  };

  const getAvailableClasses = (role) => {
    const classes = new Set();
    if (role.isClassTeacher) {
      role.classTeacherFor.forEach(item => classes.add(item.classId));
    }
    if (role.isSubjectTeacher) {
      role.subjectTeacherFor.forEach(item => classes.add(item.classId));
    }
    return Array.from(classes);
  };

  const canEditGrades = (subjectId, examType) => {
    if (!teacherRole) return false;
    
    // Handle case when user has auto-publish permissions
    if (AUTO_PUBLISH_EXAMS.includes(examType)) {
        return true;
    }
    
    // Safely check subjectTeacherFor array
    return teacherRole.subjectTeacherFor?.some?.(
        item => item.subjectId === subjectId
    ) || false;
};

  const handleGradeChange = (studentId, value) => {
    const numValue = parseInt(value) || '';
    if (numValue === '' || (numValue >= 0 && numValue <= maxMarks)) {
      setGrades(prev => ({
        ...prev,
        [studentId]: numValue
      }));
    }
  };

  const handleSubmitGrades = async () => {
    setLoading(true);
    try {
      const examConfig = EXAM_TYPES[examType];
      const gradeData = {
        examType,
        examDate,
        subject,
        maxMarks,
        grades,
        autoPublish: examConfig.autoPublish
      };

      const response = await fetch(getApiUrl('/api/teacher/grades'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData),
      });

      if (!response.ok) throw new Error('Failed to submit grades');

      setAlert({
        severity: 'success',
        message: examConfig.autoPublish ? 
          'Grades submitted and published automatically' : 
          'Grades submitted for approval'
      });
    } catch (error) {
      setAlert({ severity: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = {
      headers: ['Student ID', 'Student Name', 'Marks', 'Comments'],
      data: students.map(student => [
        student.id,
        student.name,
        '',
        ''
      ])
    };

    const ws = XLSX.utils.aoa_to_sheet([
      template.headers,
      ...template.data
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Grades');
    XLSX.writeFile(wb, `grades_template_${selectedClass}_${subject}.xlsx`);
  };

  const validateData = (data) => {
    const errors = [];
    data.forEach((row, index) => {
      if (!row.studentId || !row.marks) {
        errors.push({
          row: index + 1,
          message: 'Missing required fields'
        });
      }
      if (isNaN(row.marks) || row.marks < 0 || row.marks > maxMarks) {
        errors.push({
          row: index + 1,
          message: `Invalid marks: ${row.marks}`
        });
      }
    });
    return errors;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        const errors = validateData(data);
        setPreviewErrors(errors);
        setPreviewData(data);
        setPreviewDialog(true);
      } catch (error) {
        setAlert({
          severity: 'error',
          message: 'Error processing file'
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmUpload = () => {
    if (previewErrors.length === 0) {
      const newGrades = {};
      previewData.forEach(row => {
        newGrades[row.studentId] = row.marks;
      });
      setGrades(newGrades);
      setPreviewDialog(false);
    }
  };

  const handleClassChange = (event) => {
    const classId = event.target.value;
    const selectedClassData = availableClasses.find(cls => cls.id === classId);
    
    setSelectedClass(classId);
    setSelectedSection('');
    setSubject('');
    setGrades({});

    if (selectedClassData) {
        setAvailableSections(selectedClassData.sections || []);
    }
  };

  const handleSubjectChange = (event) => {
    setSubject(event.target.value);
  };

  const fetchSections = async (classId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`/api/v1/teacher/grading/sections/${classId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }

      const data = await response.json();
      console.log('Fetched sections:', data);

      if (data.success) {
        setAvailableSections(data.data || []);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setAlert({
        severity: 'error',
        message: 'Error fetching sections'
      });
    }
  };

  const fetchSubjectsForClass = async (classId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`/api/v1/teacher/subjects/${classId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const data = await response.json();
      setClassSubjects(data.data || []);
    } catch (error) {
      setAlert({
        severity: 'error',
        message: 'Error fetching subjects'
      });
    }
  };

  return (
    <StyledBox>
      <StyledPaper>
        <Grid container spacing={3}>
          {/* Class Selection */}
          <Grid item xs={12} md={4}>
            <StyledFormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select
                value={selectedClass}
                onChange={handleClassChange}
                displayEmpty
              >
                <MenuItem value="" disabled>Select Class</MenuItem>
                {availableClasses.map(cls => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          </Grid>

          {/* Section Selection */}
          <Grid item xs={12} md={4}>
            <StyledFormControl fullWidth>
              <InputLabel>Section</InputLabel>
              <Select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
              >
                <MenuItem value="" disabled>Select Section</MenuItem>
                {availableSections.map(section => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          </Grid>

          {/* Subject Selection */}
          <Grid item xs={12} md={4}>
            <StyledFormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={subject}
                onChange={handleSubjectChange}
                disabled={!selectedSection}
              >
                {classSubjects.filter(sub => canEditGrades(sub.id))
                  .map(sub => (
                    <MenuItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </MenuItem>
                  ))}
              </Select>
            </StyledFormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
            Provide Marks and Grades
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <ActionButton
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={downloadTemplate}
            >
              Download Template
            </ActionButton>
            <ActionButton
              variant="contained"
              component="label"
              startIcon={<CloudUpload />}
            >
              Upload Grades
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </ActionButton>
          </Box>
        </Box>

        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="50%">Student Name</TableCell>
                <TableCell width="25%">Roll Number</TableCell>
                <TableCell width="25%" align="center">Marks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell align="center">
                    <MarkInput
                      type="number"
                      variant="outlined"
                      size="small"
                      value={grades[student.id] || ''}
                      onChange={(e) => handleGradeChange(student.id, e.target.value)}
                      inputProps={{ 
                        min: 0,
                        max: maxMarks,
                        style: { textAlign: 'center' }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <ActionButton 
            variant="contained" 
            onClick={handleSubmitGrades} 
            disabled={loading}
            sx={{ minWidth: 150 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Grades'}
          </ActionButton>
        </Box>

        {alert && (
          <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert onClose={() => setAlert(null)} severity={alert.severity}>
              {alert.message}
            </Alert>
          </Snackbar>
        )}

        <Dialog
          open={previewDialog}
          onClose={() => setPreviewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Preview Uploaded Grades</DialogTitle>
          <DialogContent>
            {previewErrors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {previewErrors.length} errors found in uploaded data
              </Alert>
            )}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Marks</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData?.map((row, index) => (
                    <TableRow 
                      key={row.studentId}
                      sx={{
                        backgroundColor: previewErrors.some(e => e.row === index + 1)
                          ? '#ffebee'
                          : 'inherit'
                      }}
                    >
                      <TableCell>{row.studentId}</TableCell>
                      <TableCell>{row.studentName}</TableCell>
                      <TableCell>{row.marks}</TableCell>
                      <TableCell>
                        {previewErrors.find(e => e.row === index + 1)?.message || 'Valid'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmUpload}
              disabled={previewErrors.length > 0}
              variant="contained"
            >
              Confirm Upload
            </Button>
          </DialogActions>
        </Dialog>
      </StyledPaper>
    </StyledBox>
  );
};

export default Grading;