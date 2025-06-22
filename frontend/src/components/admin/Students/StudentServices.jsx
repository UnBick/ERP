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
    type: 'reportcard'  // Add this type field to match the template type
  },
  TRANSFER_CERT: {
    title: 'Transfer Certificate',
    icon: <Assignment />,
    description: 'Generate transfer certificates for students',
    type: 'certificate'  // Add type field
  },
  ID_CARD: {
    title: 'ID Card',
    icon: <Badge />,
    description: 'Generate student ID cards',
    type: 'idcard'  // Add type field
  },
  CHARACTER_CERT: {
    title: 'Character Certificate',
    icon: <School />,
    description: 'Generate character certificates',
    type: 'certificate'  // Add type field
  }
};

const GENERATION_SCOPE = {
  INDIVIDUAL: 'Individual Student',
  SECTION: 'Entire Section',
  CLASS: 'Entire Class',
  SCHOOL: 'Entire School'
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
  const [outputFormat, setOutputFormat] = useState('single'); // Changed default to 'single'

  const fetchClassData = async () => {
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

  useEffect(() => {
    fetchClassData();
  }, []);

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

  const fetchStudents = async (classId, sectionId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(
        getApiUrl(`/api/v1/admin/students?classId=${classId}&sectionId=${sectionId}`), {
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

  const handleClassChange = (event) => {
    const selectedClassId = event.target.value;
    setClassId(selectedClassId);
    setSectionId(''); // Reset section when class changes
    setStudentId(''); // Reset student when class changes
  };

  const handleSectionChange = (event) => {
    const selectedSectionId = event.target.value;
    setSectionId(selectedSectionId);
    setStudentId(''); // Reset student when section changes
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

    // Pass all required data
    onGenerate({
      documentType,
      scope,
      classId,
      sectionId,
      studentId,
      year,
      // Add any other relevant data
      currentScope: scope,
      selectedClass: classId,
      selectedSection: sectionId,
      selectedStudent: studentId,
      academicYear: year,
      outputFormat // Pass the output format
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
            >
              <MenuItem value="">Select Section</MenuItem>
              {Array.isArray(sections) && sections.map((section) => (
                <MenuItem key={`section-${section._id}`} value={section._id}>
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
            >
              <MenuItem value="">Select Student</MenuItem>
              {Array.isArray(students) && students.map((student) => (
                <MenuItem key={`student-${student._id}`} value={student._id}>
                  {`${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Add format selection before the generate button */}
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
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid()}
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

        // Fetch students based on scope
        const studentsData = await fetchStudentData({
            scope: data.scope,
            studentId: data.studentId,
            classId: data.classId,
            sectionId: data.sectionId,
            year: data.year
        });

        // Ensure studentsData is always an array
        const students = Array.isArray(studentsData) ? studentsData : [studentsData];
        console.log(`Processing ${students.length} students`);

        // Fetch template
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
        
        // For all types of generation, use the same endpoint
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
                outputFormat: data.scope === 'INDIVIDUAL' ? 'single' : (data.outputFormat || 'single') // Force single for individual and default to single for others
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
            endpoint += `/${studentId}?populate=true`; // Add populate parameter
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
                  setOpenDialog(true);  // Fixed missing parenthesis
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