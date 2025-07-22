import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Select,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Divider,
  Chip,
  Stack,
  Container
} from '@mui/material';
import {
  Download,
  Description,
  Badge,
  Assignment,
  School,
  People,
  Person,
  Class,
  Business
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getApiUrl } from '../../../config/apiConfig';

const DOCUMENT_TYPES = {
  REPORT_CARD: {
    title: 'Report Card',
    icon: <Description />,
    description: 'Generate and download student report cards with grades and performance details',
    type: 'reportcard',
    color: '#1976d2'
  },
  TRANSFER_CERT: {
    title: 'Transfer Certificate',
    icon: <Assignment />,
    description: 'Generate official transfer certificates for student records',
    type: 'certificate',
    color: '#388e3c'
  },
  ID_CARD: {
    title: 'ID Card',
    icon: <Badge />,
    description: 'Generate student identification cards with photos and details',
    type: 'idcard',
    color: '#f57c00'
  },
  CHARACTER_CERT: {
    title: 'Character Certificate',
    icon: <School />,
    description: 'Generate character certificates for student conduct records',
    type: 'certificate',
    color: '#7b1fa2'
  }
};

const GENERATION_SCOPE = {
  INDIVIDUAL: {
    label: 'Individual Student',
    icon: <Person fontSize="small" />,
    description: 'Generate document for a single student'
  },
  SECTION: {
    label: 'Entire Section',
    icon: <People fontSize="small" />,
    description: 'Generate documents for all students in a section'
  },
  CLASS: {
    label: 'Entire Class',
    icon: <Class fontSize="small" />,
    description: 'Generate documents for all students in a class'
  },
  SCHOOL: {
    label: 'Entire School',
    icon: <Business fontSize="small" />,
    description: 'Generate documents for all students in the school'
  }
};

const ServiceCard = ({ title, icon, description, onRequest, color }) => (
  <Card 
    sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 3
      }
    }}
  >
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ color: color, mr: 2 }}>
          {icon}
        </Box>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
        {description}
      </Typography>
    </CardContent>
    <CardActions sx={{ p: 2, pt: 0 }}>
      <Button 
        variant="outlined" 
        onClick={onRequest}
        sx={{ 
          borderColor: color,
          color: color,
          '&:hover': {
            borderColor: color,
            backgroundColor: `${color}08`
          }
        }}
      >
        Generate Document
      </Button>
    </CardActions>
  </Card>
);

const DocumentGenerationDialog = ({ 
  open, 
  onClose, 
  onGenerate, 
  documentType,
  title,
  enqueueSnackbar
}) => {
  const [scope, setScope] = useState('INDIVIDUAL');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [year] = useState(new Date().getFullYear());
  const [outputFormat, setOutputFormat] = useState('single');
  const [loading, setLoading] = useState(false);

  const fetchClassData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/settings/documents/class-data'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch class data');

      const data = await response.json();
      if (data.success) {
        setClasses(data.data.classes);
      } else {
        throw new Error(data.message || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      enqueueSnackbar('Error fetching classes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (selectedClassId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`/api/v1/settings/sections/class/${selectedClassId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch sections');

      const data = await response.json();
      if (data.success) {
        setSections(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      enqueueSnackbar('Error fetching sections', { variant: 'error' });
      setSections([]);
    }
  };

  const fetchStudents = async (classId, sectionId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(
        `/api/v1/admin/students?classId=${classId}&sectionId=${sectionId}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch students');

      const data = await response.json();
      if (data.success) {
        setStudents(data.data.students || []);
      } else {
        throw new Error(data.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      enqueueSnackbar('Error fetching students', { variant: 'error' });
      setStudents([]);
    }
  };

  useEffect(() => {
    if (open) {
      fetchClassData();
    }
  }, [open]);

  useEffect(() => {
    if (classId) {
      fetchSections(classId);
    } else {
      setSections([]);
    }
  }, [classId]);

  useEffect(() => {
    if (classId && sectionId) {
      fetchStudents(classId, sectionId);
    }
  }, [classId, sectionId]);

  const handleClassChange = (event) => {
    const selectedClassId = event.target.value;
    setClassId(selectedClassId);
    setSectionId('');
    setStudentId('');
  };

  const handleSectionChange = (event) => {
    const selectedSectionId = event.target.value;
    setSectionId(selectedSectionId);
    setStudentId('');
  };

  const handleSubmit = () => {
    if (scope === 'INDIVIDUAL' && !studentId) {
      enqueueSnackbar('Please select a student', { variant: 'error' });
      return;
    }
    if ((scope === 'SECTION' || scope === 'INDIVIDUAL') && (!classId || !sectionId)) {
      enqueueSnackbar('Please select both class and section', { variant: 'error' });
      return;
    }
    if (scope === 'CLASS' && !classId) {
      enqueueSnackbar('Please select a class', { variant: 'error' });
      return;
    }

    onGenerate({
      documentType,
      scope,
      classId,
      sectionId,
      studentId,
      year,
      currentScope: scope,
      selectedClass: classId,
      selectedSection: sectionId,
      selectedStudent: studentId,
      academicYear: year,
      outputFormat
    });
    onClose();
  };

  const isFormValid = () => {
    switch (scope) {
      case 'INDIVIDUAL':
        return classId && sectionId && studentId;
      case 'SECTION':
        return classId && sectionId;
      case 'CLASS':
        return classId;
      case 'SCHOOL':
        return true;
      default:
        return false;
    }
  };

  const resetForm = () => {
    setScope('INDIVIDUAL');
    setClassId('');
    setSectionId('');
    setStudentId('');
    setOutputFormat('single');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Generate {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select generation scope and parameters
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          <Box>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
              Generation Scope
            </FormLabel>
            <RadioGroup
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              sx={{ gap: 1 }}
            >
              {Object.entries(GENERATION_SCOPE).map(([key, value]) => (
                <FormControlLabel 
                  key={key} 
                  value={key} 
                  control={<Radio size="small" />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {value.icon}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {value.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {value.description}
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ 
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    margin: 0,
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                />
              ))}
            </RadioGroup>
          </Box>

          {scope !== 'SCHOOL' && (
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select
                value={classId}
                onChange={handleClassChange}
                label="Class"
                disabled={loading}
              >
                {Array.isArray(classes) && classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {(scope === 'SECTION' || scope === 'INDIVIDUAL') && classId && (
            <FormControl fullWidth size="small">
              <InputLabel>Section</InputLabel>
              <Select
                value={sectionId}
                onChange={handleSectionChange}
                label="Section"
              >
                {Array.isArray(sections) && sections.map((section) => (
                  <MenuItem key={`section-${section._id}`} value={section._id}>
                    {section.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {scope === 'INDIVIDUAL' && classId && sectionId && (
            <FormControl fullWidth size="small">
              <InputLabel>Student</InputLabel>
              <Select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                label="Student"
              >
                {Array.isArray(students) && students.map((student) => (
                  <MenuItem key={`student-${student._id}`} value={student._id}>
                    {`${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {(scope === 'SECTION' || scope === 'CLASS' || scope === 'SCHOOL') && (
            <FormControl fullWidth size="small">
              <InputLabel>Output Format</InputLabel>
              <Select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                label="Output Format"
              >
                <MenuItem value="single">Single PDF (Multiple pages)</MenuItem>
                <MenuItem value="multiple">Multiple PDFs (ZIP file)</MenuItem>
              </Select>
            </FormControl>
          )}

          <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Academic Year:</strong> {year}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button 
          variant="contained"
          onClick={handleSubmit}
          disabled={!isFormValid() || loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Generate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const StudentServices = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleGenerateDocument = async (data) => {
    setLoading(true);
    try {
      const docType = DOCUMENT_TYPES[data.documentType]?.type;
      if (!docType) {
        throw new Error(`Invalid document type: ${data.documentType}`);
      }

      const studentsData = await fetchStudentData({
        scope: data.scope,
        studentId: data.studentId,
        classId: data.classId,
        sectionId: data.sectionId,
        year: data.year
      });

      const students = Array.isArray(studentsData) ? studentsData : [studentsData];
      console.log(`Processing ${students.length} students`);

      const templateResponse = await fetch(getApiUrl(`/api/v1/settings/templates/type/${docType}?active=true`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const templateData = await templateResponse.json();
      if (!templateData.success || !templateData.data.length) {
        throw new Error(`No active template found for ${DOCUMENT_TYPES[data.documentType].title}`);
      }

      const templateToUse = templateData.data[0];
      
      const response = await fetch(getApiUrl('/api/v1/settings/documents/generate-batch'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          documentType: docType,
          template: templateToUse.template,
          students: students.map(student => ({
            studentData: student,
            customData: {
              schoolName: 'Your School Name',
              schoolLogo: '/path/to/logo',
              studentName: `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim(),
              className: `${student.academicInfo?.class?.name || ''} ${student.academicInfo?.section?.name || ''}`.trim(),
              schoolYear: data.year || new Date().getFullYear(),
              teacherName: student.academicInfo?.classTeacher?.name || 'Not Assigned',
              subjects: student.grades || []
            }
          })),
          outputFormat: data.scope === 'INDIVIDUAL' ? 'single' : (data.outputFormat || 'single')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate documents');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docType}_documents_${Date.now()}.${data.outputFormat === 'multiple' ? 'zip' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar(`Successfully generated document${students.length > 1 ? 's' : ''}`, { variant: 'success' });
    } catch (error) {
      console.error('Document generation error:', error);
      enqueueSnackbar(error.message || 'Failed to generate document', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async (requestData) => {
    const { scope, studentId, classId, sectionId } = requestData;
    let endpoint = '/api/v1/admin/students';
    
    switch (scope) {
      case 'INDIVIDUAL':
        endpoint += `/${studentId}?populate=true`;
        break;
      case 'SECTION':
        endpoint += `?classId=${classId}&sectionId=${sectionId}&populate=true`;
        break;
      case 'CLASS':
        endpoint += `?classId=${classId}&populate=true`;
        break;
      case 'SCHOOL':
        endpoint += '?populate=true';
        break;
    }

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch student data');
    
    const responseData = await response.json();
    return responseData.success ? (scope === 'INDIVIDUAL' ? responseData.data : responseData.data.students) : null;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
            Student Services
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate and manage student documents and certificates
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
            <Grid item xs={12} sm={6} lg={3} key={key}>
              <ServiceCard
                title={value.title}
                icon={value.icon}
                description={value.description}
                color={value.color}
                onRequest={() => {
                  setSelectedDocument(key);
                  setOpenDialog(true);
                }}
              />
            </Grid>
          ))}
        </Grid>

        <DocumentGenerationDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onGenerate={handleGenerateDocument}
          documentType={selectedDocument}
          title={selectedDocument ? DOCUMENT_TYPES[selectedDocument].title : ''}
          enqueueSnackbar={enqueueSnackbar}
        />

        {loading && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mt: 4,
            p: 3
          }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Generating documents...
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default StudentServices;