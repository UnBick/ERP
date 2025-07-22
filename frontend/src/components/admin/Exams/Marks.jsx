import React, { useState, useEffect, useMemo } from 'react';
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
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Card,
  CardContent,
  Avatar,
  Divider,
  TablePagination,
  InputAdornment,
  Skeleton
} from '@mui/material';
import {
  Save,
  Clear,
  Edit,
  FileDownload,
  FileUpload,
  Assessment,
  School,
  Group,
  MenuBook,
  CheckCircle,
  Error,
  Warning,
  Info,
  Search,
  Refresh,
  Analytics,
  TrendingUp,
  PersonAdd,
  FilterList
} from '@mui/icons-material';

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
  const [uploadErrors, setUploadErrors] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', action: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [saveProgress, setSaveProgress] = useState(0);

  // Filtered and paginated students
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const paginatedStudents = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredStudents.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredStudents, page, rowsPerPage]);

  // Statistics
  const statistics = useMemo(() => {
    if (!selectedSubject || !marks) return null;
    
    const marksArray = Object.values(marks).filter(m => m !== '' && m !== null && m !== undefined);
    if (marksArray.length === 0) return null;

    const numericMarks = marksArray.map(m => parseFloat(m));
    const total = numericMarks.reduce((sum, mark) => sum + mark, 0);
    const average = total / numericMarks.length;
    const highest = Math.max(...numericMarks);
    const lowest = Math.min(...numericMarks);
    const passed = numericMarks.filter(mark => mark >= (subjectTotalMarks * 0.4)).length;
    const failed = numericMarks.length - passed;

    return {
      total: numericMarks.length,
      average: average.toFixed(2),
      highest,
      lowest,
      passed,
      failed,
      passRate: ((passed / numericMarks.length) * 100).toFixed(1)
    };
  }, [marks, selectedSubject, subjectTotalMarks]);

  useEffect(() => {
    fetchExaminations();
  }, []);

  // Fetch examinations from backend
  const fetchExaminations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/exams', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error fetching examinations');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setExaminations(data.data.map(e => ({
          id: e._id,
          name: e.name || e.examType || '',
          totalMarks: e.totalMarks,
          duration: e.duration
        })));
      } else {
        setExaminations([]);
        setAlert({ severity: 'error', message: data.message || 'No examinations found' });
      }
    } catch (error) {
      setAlert({ severity: 'error', message: 'Error fetching examinations' });
      setExaminations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch exam details and classes for selected exam
  const fetchExamDetails = async (examId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Use the same endpoint and logic as in ExamManage.jsx/ScheduleExam.jsx
      // Instead of /api/exams/:id, fetch all exams and find the selected one
      const response = await fetch('/api/exams', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error fetching examinations');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        // Find the selected exam by id
        const exam = data.data.find(e => e._id === examId || e.id === examId);
        if (exam) {
          setExamDetails(exam);
          // Defensive: handle applicableClasses as array of objects or ids
          let classArray = [];
          if (Array.isArray(exam.applicableClasses) && exam.applicableClasses.length > 0) {
            classArray = exam.applicableClasses.map(cls =>
              typeof cls === 'object'
                ? { id: cls._id || cls.id, name: cls.name }
                : { id: cls, name: `Class ${cls}` }
            );
          } else if (Array.isArray(exam.classes) && exam.classes.length > 0) {
            classArray = exam.classes.map(cls =>
              typeof cls === 'object'
                ? { id: cls._id || cls.id, name: cls.name }
                : { id: cls, name: `Class ${cls}` }
            );
          }
          setClasses(classArray);
        } else {
          setClasses([]);
          setExamDetails(null);
          setAlert({ severity: 'error', message: 'Exam not found' });
        }
      } else {
        setClasses([]);
        setExamDetails(null);
        setAlert({ severity: 'error', message: data.message || 'No exam details found' });
      }
    } catch (error) {
      setAlert({ severity: 'error', message: 'Error fetching exam details' });
      setClasses([]);
      setExamDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sections and subjects for selected class
  const fetchClassData = async (classId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Fetch sections
      const secRes = await fetch(`/api/v1/admin/sections/class/${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const secData = await secRes.json();
      setSections(
        secData.success && Array.isArray(secData.data)
          ? secData.data.map(s => ({ id: s._id, name: s.name }))
          : []
      );
      // Fetch subjects
      const subjRes = await fetch(`/api/exams/subjects?classId=${classId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const subjData = await subjRes.json();
      setSubjects(
        subjData.success && Array.isArray(subjData.data)
          ? subjData.data.map(s => ({ id: s._id, name: s.name }))
          : []
      );
    } catch (error) {
      setAlert({ severity: 'error', message: 'Error fetching class data' });
      setSections([]);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for selected section
  const fetchStudents = async (sectionId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/students?sectionId=${sectionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data.students)) {
        setStudents(
          data.data.students.map((student, i) => ({
            id: student._id,
            rollNo: student.academicInfo?.rollNumber || `R${String(i + 1).padStart(3, '0')}`,
            name: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
            avatar: student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 1}`
          }))
        );
        // Initialize marks
        const initialMarks = {};
        data.data.students.forEach(student => {
          initialMarks[student._id] = '';
        });
        setMarks(initialMarks);
      } else {
        setStudents([]);
        setMarks({});
      }
    } catch (error) {
      setAlert({ severity: 'error', message: 'Error fetching students' });
      setStudents([]);
      setMarks({});
    } finally {
      setLoading(false);
    }
  };

  // Fetch subject details (e.g., total marks) for selected subject
  const handleSubjectChange = async (event) => {
    const subjectId = event.target.value;
    setSelectedSubject(subjectId);
    setIsEditing(false);
    setUploadErrors([]);
    if (subjectId) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/exams/subjects/${subjectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data) {
          setSubjectTotalMarks(data.data.totalMarks || 100);
        } else {
          setSubjectTotalMarks(100);
        }
        setExistingMarks(null);
        setIsEditing(true);
      } catch (error) {
        setAlert({ severity: 'error', message: 'Error fetching subject details' });
        setSubjectTotalMarks(100);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExamChange = async (event) => {
    const examId = event.target.value;
    setSelectedExam(examId);
    resetSelections(['class', 'section', 'subject']);
    if (examId) {
      await fetchExamDetails(examId);
    }
  };

  const handleClassChange = async (event) => {
    const classId = event.target.value;
    setSelectedClass(classId);
    resetSelections(['section', 'subject']);
    if (classId) {
      await fetchClassData(classId);
    }
  };

  const handleSectionChange = async (event) => {
    const sectionId = event.target.value;
    setSelectedSection(sectionId);
    resetSelections(['subject']);
    if (sectionId) {
      await fetchStudents(sectionId);
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

  const handleSaveMarks = async () => {
    setSaveProgress(0);
    setLoading(true);
    
    try {
      // Simulate progress
      const totalSteps = 10;
      for (let i = 0; i <= totalSteps; i++) {
        setSaveProgress((i / totalSteps) * 100);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setAlert({ 
        severity: 'success', 
        message: `Marks ${existingMarks ? 'updated' : 'saved'} successfully for ${filteredStudents.length} students` 
      });
      setIsEditing(false);
      setExistingMarks(marks);
      setConfirmDialog({ open: false, type: '', action: null });
    } catch (error) {
      setAlert({ 
        severity: 'error', 
        message: `Error ${existingMarks ? 'updating' : 'saving'} marks` 
      });
    } finally {
      setLoading(false);
      setSaveProgress(0);
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
    setPage(0);
    setSearchTerm('');
  };

  const downloadTemplate = () => {
    setAlert({ 
      severity: 'info', 
      message: 'Excel template downloaded successfully' 
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAlert({ 
        severity: 'success', 
        message: `File "${file.name}" uploaded successfully` 
      });
      // Simulate random marks
      const newMarks = {};
      students.forEach(student => {
        newMarks[student.id] = Math.floor(Math.random() * subjectTotalMarks);
      });
      setMarks(newMarks);
    }
    event.target.value = '';
  };

  const handleConfirmAction = (type, action) => {
    setConfirmDialog({ open: true, type, action });
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ 
      background: `linear-gradient(135deg, ${color === 'primary' ? '#667eea 0%, #764ba2 100%' : 
                                           color === 'success' ? '#11998e 0%, #38ef7d 100%' :
                                           color === 'error' ? '#f093fb 0%, #f5576c 100%' :
                                           '#4facfe 0%, #00f2fe 100%'})`,
      color: 'white',
      height: '100%',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
      }
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      width: '100%', 
      p: 3,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      <Paper elevation={24} sx={{ 
        p: 4,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 4,
          pb: 2,
          borderBottom: '2px solid #f0f0f0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              width: 48, 
              height: 48,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
              <Assessment />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{
                color: '#1a237e',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}>
                Results Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and track student examination results
              </Typography>
            </Box>
          </Box>
          <Chip 
            icon={<Analytics />} 
            label="Professional Edition" 
            color="primary" 
            variant="outlined" 
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none'
            }}
          />
        </Box>

        {/* Selection Form */}
        <Fade in={true}>
          <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School color="primary" />
                Examination Selection
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
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
                      startAdornment={<Assessment sx={{ mr: 1, color: 'primary.main' }} />}
                    >
                      <MenuItem value="">Select an exam</MenuItem>
                      {examinations.map((exam) => (
                        <MenuItem key={exam.id} value={exam.id}>
                          <Box>
                            <Typography variant="body1">{exam.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {exam.totalMarks} marks • {exam.duration}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {selectedExam && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Class</InputLabel>
                      <Select
                        value={selectedClass || ''}
                        onChange={handleClassChange}
                        label="Select Class"
                        startAdornment={<Group sx={{ mr: 1, color: 'primary.main' }} />}
                      >
                        <MenuItem value="">Select a class</MenuItem>
                        {classes.map((cls) => (
                          <MenuItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {selectedClass && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Section</InputLabel>
                      <Select
                        value={selectedSection || ''}
                        onChange={handleSectionChange}
                        label="Select Section"
                      >
                        <MenuItem value="">Select a section</MenuItem>
                        {sections.map((section) => (
                          <MenuItem key={section.id} value={section.id}>
                            {section.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {selectedSection && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Subject</InputLabel>
                      <Select
                        value={selectedSubject || ''}
                        onChange={handleSubjectChange}
                        label="Select Subject"
                        startAdornment={<MenuBook sx={{ mr: 1, color: 'primary.main' }} />}
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
                )}
              </Grid>
            </CardContent>
          </Card>
        </Fade>

        {/* Statistics Cards */}
        {statistics && (
          <Fade in={true}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp color="primary" />
                Performance Statistics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard title="Total Students" value={statistics.total} icon={<Group />} color="primary" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard title="Average Score" value={statistics.average} icon={<Assessment />} color="info" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard title="Pass Rate" value={`${statistics.passRate}%`} icon={<CheckCircle />} color="success" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard title="Highest Score" value={statistics.highest} icon={<TrendingUp />} color="warning" />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

        {/* Action Buttons */}
        {selectedSubject && students.length > 0 && (
          <Fade in={true}>
            <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<FileDownload />}
                    onClick={downloadTemplate}
                    sx={{ borderRadius: 2 }}
                  >
                    Download Template
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FileUpload />}
                    component="label"
                    sx={{ borderRadius: 2 }}
                  >
                    Upload Marks
                    <input
                      type="file"
                      hidden
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => handleConfirmAction('refresh', () => resetSelections(['subject']))}
                    sx={{ borderRadius: 2 }}
                  >
                    Refresh Data
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Search and Filter */}
        {students.length > 0 && (
          <Fade in={true}>
            <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterList color="primary" />
                    Search & Filter
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Search Students"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                      placeholder="Search by name or roll number"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Showing {paginatedStudents.length} of {filteredStudents.length} students
                      </Typography>
                      {existingMarks && !isEditing && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Marks Saved"
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {isEditing && (
                        <Chip
                          icon={<Edit />}
                          label="Editing Mode"
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Students Table */}
        {students.length > 0 && (
          <Fade in={true}>
            <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  '& .MuiTableHead-root': {
                    bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '& .MuiTableCell-head': {
                      fontWeight: 600,
                      color: 'white',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderBottom: 'none'
                    }
                  },
                  '& .MuiTableBody-root .MuiTableRow-root': {
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(102, 126, 234, 0.04)',
                      transform: 'scale(1.001)'
                    }
                  }
                }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Roll No</TableCell>
                        {selectedSubject && (
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              Marks {subjectTotalMarks && `(/${subjectTotalMarks})`}
                              {existingMarks && !isEditing && (
                                <Tooltip title="Edit marks">
                                  <IconButton
                                    size="small"
                                    onClick={() => setIsEditing(true)}
                                    sx={{ color: 'white' }}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        )}
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton variant="rectangular" height={40} /></TableCell>
                            <TableCell><Skeleton variant="text" /></TableCell>
                            <TableCell><Skeleton variant="rectangular" height={40} /></TableCell>
                            <TableCell><Skeleton variant="circular" width={40} height={40} /></TableCell>
                          </TableRow>
                        ))
                      ) : (
                        paginatedStudents.map((student) => {
                          const mark = marks[student.id];
                          const isPass = mark && mark >= (subjectTotalMarks * 0.4);
                          const isEmpty = mark === '' || mark === null || mark === undefined;
                          
                          return (
                            <TableRow key={student.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar 
                                    src={student.avatar} 
                                    sx={{ width: 40, height: 40 }}
                                  >
                                    {student.name.charAt(0)}
                                  </Avatar>
                                  <Typography variant="body1" fontWeight="medium">
                                    {student.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={student.rollNo} 
                                  size="small" 
                                  variant="outlined"
                                  color="primary"
                                />
                              </TableCell>
                              {selectedSubject && (
                                <TableCell>
                                  {existingMarks && !isEditing ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="h6" 
                                        color={isPass ? 'success.main' : 'error.main'}>
                                        {mark || '-'}
                                      </Typography>
                                      {!isEmpty && (
                                        <Typography variant="body2" color="text.secondary">
                                          ({((mark / subjectTotalMarks) * 100).toFixed(1)}%)
                                        </Typography>
                                      )}
                                    </Box>
                                  ) : (
                                    <TextField
                                      type="number"
                                      value={mark || ''}
                                      onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                      inputProps={{
                                        min: 0,
                                        max: subjectTotalMarks,
                                        step: "0.01"
                                      }}
                                      size="small"
                                      error={mark < 0 || mark > subjectTotalMarks}
                                      helperText={
                                        mark < 0 || mark > subjectTotalMarks
                                          ? `Must be 0-${subjectTotalMarks}`
                                          : null
                                      }
                                      sx={{
                                        width: 120,
                                        '& input': {
                                          textAlign: 'center',
                                          fontWeight: 'medium'
                                        }
                                      }}
                                    />
                                  )}
                                </TableCell>
                              )}
                              <TableCell>
                                {isEmpty ? (
                                  <Chip 
                                    icon={<Info />} 
                                    label="Pending" 
                                    size="small" 
                                    color="default"
                                  />
                                ) : isPass ? (
                                  <Chip 
                                    icon={<CheckCircle />} 
                                    label="Pass" 
                                    size="small" 
                                    color="success"
                                  />
                                ) : (
                                  <Chip 
                                    icon={<Error />} 
                                    label="Fail" 
                                    size="small" 
                                    color="error"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                {/* Save/Cancel Buttons */}
                {isEditing && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, p: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<Clear />}
                      onClick={() => setIsEditing(false)}
                      sx={{ borderRadius: 2 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      onClick={() => handleConfirmAction('save', handleSaveMarks)}
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                    >
                      Save Marks
                    </Button>
                  </Box>
                )}
                {/* Save Progress Bar */}
                {saveProgress > 0 && (
                  <LinearProgress variant="determinate" value={saveProgress} sx={{ mt: 2 }} />
                )}
                {/* Pagination */}
                <TablePagination
                  component="div"
                  count={filteredStudents.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={e => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[5, 10, 20, 50]}
                />
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({ open: false, type: '', action: null })}
        >
          <DialogTitle>Confirm {confirmDialog.type === 'save' ? 'Save' : 'Action'}</DialogTitle>
          <DialogContent>
            <Typography>
              {confirmDialog.type === 'save'
                ? 'Are you sure you want to save the entered marks?'
                : 'Are you sure you want to refresh/reset? Unsaved changes will be lost.'}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog({ open: false, type: '', action: null })} color="secondary">Cancel</Button>
            <Button
              onClick={() => {
                if (confirmDialog.action) confirmDialog.action();
                setConfirmDialog({ open: false, type: '', action: null });
              }}
              color="primary"
              variant="contained"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={!!alert}
          autoHideDuration={4000}
          onClose={() => setAlert(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {alert && (
            <Alert
              onClose={() => setAlert(null)}
              severity={alert.severity}
              sx={{ width: '100%' }}
            >
              {alert.message}
            </Alert>
          )}
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default Results;