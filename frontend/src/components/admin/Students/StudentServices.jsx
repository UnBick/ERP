// frontend/src/components/admin/Students/StudentServices.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent,
  CardActions, Button, Dialog, TextField, MenuItem,
  CircularProgress, Snackbar, Alert, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  List, ListItem, ListItemText, Select, FormControl,
  InputLabel, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { Download, Description, Badge, Assignment, School } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getApiUrl } from '../../../config/apiConfig';

const DOCUMENT_TYPES = {
  REPORT_CARD: {
    title: 'Report Card',
    icon: <Description />,
    description: 'Generate and download student report cards',
    type: 'reportcard'
  },
  TRANSFER_CERT: {
    title: 'Transfer Certificate',
    icon: <Assignment />,
    description: 'Generate transfer certificates for students',
    type: 'certificate'
  },
  ID_CARD: {
    title: 'ID Card',
    icon: <Badge />,
    description: 'Generate student ID cards',
    type: 'idcard'
  },
  CHARACTER_CERT: {
    title: 'Character Certificate',
    icon: <School />,
    description: 'Generate character certificates',
    type: 'certificate'
  }
};

const GENERATION_SCOPE = {
  INDIVIDUAL: 'Individual Student',
  SECTION: 'Entire Section',
  CLASS: 'Entire Class',
  SCHOOL: 'Entire School'
};

// Enhanced API utility function with better error handling
const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error - Status: ${response.status}, Response:`, errorText);
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (response.status === 403) {
        throw new Error('Access denied. You don\'t have permission for this action.');
      } else if (response.status === 404) {
        throw new Error('Requested resource not found.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(`Request failed with status ${response.status}`);
      }
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } else {
      // For file downloads or other content types
      return response;
    }
  } catch (error) {
    if (error.name === 'SyntaxError' && error.message.includes('Unexpected token')) {
      console.error('Received HTML instead of JSON. This usually indicates server error or authentication issue.');
      throw new Error('Server returned an error page. Please check your authentication and try again.');
    }
    throw error;
  }
};

const ServiceCard = ({ title, icon, description, onRequest }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small" onClick={onRequest}>
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
    try {
      setLoading(true);
      const data = await apiRequest(getApiUrl('/api/v1/settings/documents/class-data'));
      
      if (data.success) {
        setClasses(data.data.classes);
      } else {
        throw new Error(data.message || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      enqueueSnackbar(`Error fetching classes: ${error.message}`, { variant: 'error' });
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async (selectedClassId) => {
    try {
      setLoading(true);
      const data = await apiRequest(getApiUrl(`/api/v1/settings/sections/class/${selectedClassId}`));
      
      if (data.success) {
        setSections(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      enqueueSnackbar(`Error fetching sections: ${error.message}`, { variant: 'error' });
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId, sectionId) => {
    try {
      setLoading(true);
      const url = getApiUrl(`/api/v1/admin/students?classId=${classId}&sectionId=${sectionId}&populate=true`);
      const data = await apiRequest(url);
      
      if (data.success) {
        setStudents(data.data.students || []);
      } else {
        throw new Error(data.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      enqueueSnackbar(`Error fetching students: ${error.message}`, { variant: 'error' });
      setStudents([]);
    } finally {
      setLoading(false);
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
      setSectionId('');
      setStudentId('');
    } else {
      setSections([]);
    }
  }, [classId]);

  useEffect(() => {
    if (classId && sectionId) {
      fetchStudents(classId, sectionId);
      setStudentId('');
    } else {
      setStudents([]);
    }
  }, [classId, sectionId]);

  const handleClassChange = (event) => {
    setClassId(event.target.value);
  };

  const handleSectionChange = (event) => {
    setSectionId(event.target.value);
  };

  const handleSubmit = () => {
    // Validate required fields based on scope
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generate {title}
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Generation Scope
          </Typography>
          <RadioGroup
            value={scope}
            onChange={(e) => setScope(e.target.value)}
          >
            {Object.entries(GENERATION_SCOPE).map(([key, value]) => (
              <FormControlLabel 
                key={key} 
                value={key} 
                control={<Radio />} 
                label={value} 
              />
            ))}
          </RadioGroup>
        </FormControl>

        {scope !== 'SCHOOL' && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={classId}
              onChange={handleClassChange}
              label="Class"
              disabled={loading}
            >
              <MenuItem value="">Select Class</MenuItem>
              {Array.isArray(classes) && classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {(scope === 'SECTION' || scope === 'INDIVIDUAL') && classId && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Section</InputLabel>
            <Select
              value={sectionId}
              onChange={handleSectionChange}
              label="Section"
              disabled={loading}
            >
              <MenuItem value="">Select Section</MenuItem>
              {Array.isArray(sections) && sections.map((section) => (
                <MenuItem key={section._id} value={section._id}>
                  {section.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {scope === 'INDIVIDUAL' && classId && sectionId && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Student</InputLabel>
            <Select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              label="Student"
              disabled={loading}
            >
              <MenuItem value="">Select Student</MenuItem>
              {Array.isArray(students) && students.map((student) => (
                <MenuItem key={student._id} value={student._id}>
                  {`${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.trim() || 'Unnamed Student'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {(scope === 'SECTION' || scope === 'CLASS' || scope === 'SCHOOL') && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Output Format</InputLabel>
            <Select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              label="Output Format"
            >
              <MenuItem value="multiple">Multiple PDFs (ZIP file)</MenuItem>
              <MenuItem value="single">Single PDF (Multiple pages)</MenuItem>
            </Select>
          </FormControl>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid() || loading}
          >
            Generate
          </Button>
        </Box>
      </Box>
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

      console.log('Starting document generation with data:', data);

      // Fetch students based on scope
      const studentsData = await fetchStudentData({
        scope: data.scope,
        studentId: data.studentId,
        classId: data.classId,
        sectionId: data.sectionId,
        year: data.year
      });

      const students = Array.isArray(studentsData) ? studentsData : [studentsData];
      console.log(`Processing ${students.length} students`);

      if (students.length === 0) {
        throw new Error('No students found for the selected criteria');
      }

      // Fetch template
      const templateData = await apiRequest(
        getApiUrl(`/api/v1/settings/templates/type/${docType}?active=true`)
      );

      if (!templateData.success || !templateData.data.length) {
        throw new Error(`No active template found for ${DOCUMENT_TYPES[data.documentType].title}`);
      }

      const templateToUse = templateData.data[0];
      
      // Generate documents
      const response = await fetch(getApiUrl('/api/v1/settings/documents/generate-batch'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
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
        const errorText = await response.text();
        console.error('Document generation failed:', errorText);
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
      enqueueSnackbar(`Document generation failed: ${error.message}`, { variant: 'error' });
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

    console.log('Fetching student data from:', getApiUrl(endpoint));
    
    const responseData = await apiRequest(getApiUrl(endpoint));
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to fetch student data');
    }
    
    return scope === 'INDIVIDUAL' ? responseData.data : responseData.data.students;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Student Services
        </Typography>

        <Grid container spacing={3}>
          {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
            <Grid item xs={12} md={6} key={key}>
              <ServiceCard
                title={value.title}
                icon={value.icon}
                description={value.description}
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StudentServices;