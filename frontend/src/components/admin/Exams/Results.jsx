import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardActions, Button, Dialog, 
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Snackbar, Alert,
  Chip, Divider, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Tooltip, LinearProgress, Switch, FormControlLabel, TextField,
  DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary,
  AccordionDetails, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Checkbox, FormGroup, RadioGroup, Radio, FormLabel, Stepper,
  Step, StepLabel, StepContent, Tabs, Tab, TabPanel, Badge, Menu, MenuList,
  ListItemIcon, Skeleton, Fade, Zoom
} from '@mui/material';
import {
  Description, Download, Email, Print, Preview, Settings, Person,
  School, Class, Group, CalendarToday, CheckCircle, Error, Warning,
  Info, Refresh, FilterList, Search, ExpandMore, Close, Add, Remove,
  Visibility, VisibilityOff, Share, History, Save, CloudDownload,
  PictureAsPdf, TableChart, InsertDriveFile, Assessment, TrendingUp,
  Schedule, NotificationsActive, CloudUpload, Dashboard, Analytics
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const Results = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // Dialog and Loading States
  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Form States
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [templateId, setTemplateId] = useState('');
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [deliveryMethod, setDeliveryMethod] = useState('download');
  const [emailSettings, setEmailSettings] = useState({
    subject: 'Student Report Card',
    message: 'Please find attached your child\'s report card.',
    sendToParents: true,
    sendToGuardians: true
  });
  
  // Data States
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    hasGrades: true,
    isActive: true
  });
  
  // UI States
  const [year] = useState(new Date().getFullYear());
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Advanced Settings
  const [advancedSettings, setAdvancedSettings] = useState({
    includeAttendance: true,
    includeBehavior: true,
    includeExtraCurricular: true,
    includeTeacherComments: true,
    includeParentNotes: false,
    watermark: false,
    passwordProtect: false,
    compress: true,
    includeGraphs: true,
    includeComparison: false,
    language: 'en',
    dateFormat: 'MM/DD/YYYY'
  });

  // Fetch functions
  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch('/api/v1/settings/documents/class-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch class data');
      const data = await response.json();
      if (data.success) setClasses(data.data.classes);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error fetching classes' });
    }
  }, []);

  const fetchSections = useCallback(async (selectedClassId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/settings/sections/class/${selectedClassId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch sections');
      const data = await response.json();
      if (data.success) setSections(data.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error fetching sections' });
      setSections([]);
    }
  }, []);

  const fetchStudents = useCallback(async (classId, sectionId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(
        `/api/v1/admin/students?classId=${classId}&sectionId=${sectionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      if (data.success) setStudents(data.data.students || []);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error fetching students' });
      setStudents([]);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch('/api/v1/settings/templates/type/reportcard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      if (data.success) setTemplates(data.data);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error fetching templates' });
    }
  }, []);

  const fetchGenerationHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch('/api/v1/settings/documents/generation-history?type=reportcard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      if (data.success) setGenerationHistory(data.data);
    } catch (error) {
      console.error('Error fetching generation history:', error);
    }
  }, []);

  // Effects
  React.useEffect(() => {
    fetchClasses();
    fetchTemplates();
    fetchGenerationHistory();
  }, [fetchClasses, fetchTemplates, fetchGenerationHistory]);

  React.useEffect(() => {
    if (classId) fetchSections(classId);
    else setSections([]);
  }, [classId, fetchSections]);

  React.useEffect(() => {
    if (classId && sectionId) fetchStudents(classId, sectionId);
    else setStudents([]);
  }, [classId, sectionId, fetchStudents]);

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Fetch all students with a high limit and log the response for debugging
        const response = await fetch('/api/v1/admin/students?limit=10000', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Fetch students failed:', response.status, errorText);
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        console.log('Fetched students data:', data);
        // Defensive: handle both array and object response
        let studentsArr = [];
        if (Array.isArray(data.data)) {
          studentsArr = data.data;
        } else if (data.data && Array.isArray(data.data.students)) {
          studentsArr = data.data.students;
        } else if (data.students && Array.isArray(data.students)) {
          studentsArr = data.students;
        }
        setStudents(studentsArr);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
        setAlert({ type: 'error', message: 'Error fetching students' });
      }
    };
    fetchStudents();
  }, []);

  // Filtered students based on search and filters
  const filteredStudents = Array.isArray(students) ? students : [];
  const studentFilter = useMemo(() => {
    return filteredStudents.filter(student => {
      const fullName = `${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`.toLowerCase();
      const searchMatch = fullName.includes(filters.search.toLowerCase());
      const hasGradesMatch = !filters.hasGrades || (student.grades && student.grades.length > 0);
      const isActiveMatch = !filters.isActive || student.status === 'active';
      return searchMatch && hasGradesMatch && isActiveMatch;
    });
  }, [filteredStudents, filters]);

  // Generate single report card
  const handleGenerateReportCard = async () => {
    if (!validateSingleGeneration()) return;

    setLoading(true);
    try {
      const studentData = await fetchStudentData(studentId);
      const template = templates.find(t => t._id === templateId) || templates[0];
      
      const reportData = buildReportData(studentData, template);
      await generateAndDownloadReport(reportData, 'single', outputFormat);
      
      enqueueSnackbar('Report card generated successfully', { variant: 'success' });
      setOpenDialog(false);
      fetchGenerationHistory();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to generate report card', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Generate bulk report cards
  const handleBulkGeneration = async () => {
    if (selectedStudents.length === 0) {
      enqueueSnackbar('Please select at least one student', { variant: 'error' });
      return;
    }

    setBulkLoading(true);
    setBulkProgress(0);
    try {
      const template = templates.find(t => t._id === templateId) || templates[0];
      const reportDataList = [];
      
      for (let i = 0; i < selectedStudents.length; i++) {
        const studentData = await fetchStudentData(selectedStudents[i]);
        const reportData = buildReportData(studentData, template);
        reportDataList.push(reportData);
        setBulkProgress(((i + 1) / selectedStudents.length) * 100);
      }

      await generateAndDownloadReport(reportDataList, 'bulk', outputFormat);
      
      enqueueSnackbar(`${selectedStudents.length} report cards generated successfully`, { variant: 'success' });
      setOpenBulkDialog(false);
      setSelectedStudents([]);
      fetchGenerationHistory();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to generate bulk reports', { variant: 'error' });
    } finally {
      setBulkLoading(false);
      setBulkProgress(0);
    }
  };

  // Preview report card
  const handlePreviewReport = async () => {
    if (!validateSingleGeneration()) return;

    setPreviewLoading(true);
    try {
      const studentData = await fetchStudentData(studentId);
      const template = templates.find(t => t._id === templateId) || templates[0];
      const reportData = buildReportData(studentData, template);
      
      setPreviewData(reportData);
      setOpenPreviewDialog(true);
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to preview report card', { variant: 'error' });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Helper functions
  const validateSingleGeneration = () => {
    if (!classId || !sectionId || !studentId) {
      enqueueSnackbar('Please select class, section, and student', { variant: 'error' });
      return false;
    }
    return true;
  };

  const fetchStudentData = async (studentId) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const response = await fetch(`/api/v1/admin/students/${studentId}?populate=true`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error('Failed to fetch student data');
    const data = await response.json();
    if (!data.success) throw new Error('Student not found');
    return data.data;
  };

  const buildReportData = (studentData, template) => {
    return {
      studentData,
      customData: {
        schoolName: 'Your School Name',
        schoolLogo: '/path/to/logo',
        studentName: `${studentData.personalInfo?.firstName || ''} ${studentData.personalInfo?.lastName || ''}`.trim(),
        className: `${studentData.academicInfo?.class?.name || ''} ${studentData.academicInfo?.section?.name || ''}`.trim(),
        schoolYear: year,
        teacherName: studentData.academicInfo?.classTeacher?.name || 'Not Assigned',
        subjects: studentData.grades || [],
        ...advancedSettings,
        ...emailSettings
      },
      template: template?.template || templates[0]?.template
    };
  };

  // Update generateAndDownloadReport to accept reportType and outputFormat
  const generateAndDownloadReport = async (payload, reportType = 'single', outputFormat = 'pdf', deliveryMethod = 'download') => {
    try {
      // Log payload for debugging
      console.log('Payload for generate-batch:', payload);

      const response = await fetch('/api/v1/settings/documents/generate-batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('generate-batch error:', response.status, errorText);
        throw new Error('Failed to generate document');
      }

      if (deliveryMethod === 'download') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report_card_${reportType}_${Date.now()}.${outputFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error in generateAndDownloadReport:', error);
      if (typeof enqueueSnackbar === 'function') {
        enqueueSnackbar(error.message || 'Failed to generate report card', { variant: 'error' });
      }
    }
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudents(
      selectedStudents.length === filteredStudents.length 
        ? [] 
        : filteredStudents.map(s => s._id)
    );
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const steps = [
    'Select Class & Section',
    'Choose Students',
    'Configure Settings',
    'Generate Reports'
  ];

  // If you are trying to render a preview using the template HTML and CSS from the API response,
  // do NOT use "new" with the template or treat it as a constructor/function.
  // Instead, render the HTML as a string using dangerouslySetInnerHTML in React.

  // Example: Render the report card preview using the template HTML and CSS

  const ReportCardPreview = ({ template, customData }) => {
    // Simple handlebars-like replacement for {{key}} in the template
    const renderTemplate = (html, data) => {
      let rendered = html;
      Object.keys(data).forEach(key => {
        const value = data[key];
        // For arrays (like subjects), handle separately
        if (Array.isArray(value)) {
          // Replace {{#each subjects}} ... {{/each}} with table rows
          rendered = rendered.replace(
            new RegExp(`{{#each ${key}}}([\\s\\S]*?){{\\/each}}`, 'g'),
            (_, rowTemplate) => value.map(item => {
              let row = rowTemplate;
              Object.keys(item).forEach(subKey => {
                row = row.replace(new RegExp(`{{${subKey}}}`, 'g'), item[subKey] ?? '');
              });
              return row;
            }).join('')
          );
        } else {
          rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value ?? '');
        }
      });
      return rendered;
    };

    // Combine HTML and CSS for preview
    const htmlWithCss = `
      <style>${template.css}</style>
      ${renderTemplate(template.html, customData)}
    `;

    return (
      <div
        style={{ border: '1px solid #ccc', borderRadius: 8, margin: '1rem 0', overflow: 'auto' }}
        dangerouslySetInnerHTML={{ __html: htmlWithCss }}
      />
    );
  };

  // Add this helper to download HTML as PDF using html2pdf.js
  const downloadPreviewAsPDF = (previewData) => {
    if (!previewData) return;
    const processedHtml = processTemplate(previewData.template, previewData.customData);
    // Create a temporary iframe to render the HTML+CSS for PDF
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);
    iframe.contentDocument.write(`
      <html>
        <head>
          <style>${previewData.template.css}</style>
        </head>
        <body>${processedHtml}</body>
      </html>
    `);
    iframe.contentDocument.close();

    // Use html2pdf.js to download as PDF
    import('html2pdf.js').then(html2pdf => {
      html2pdf.default()
        .from(iframe.contentDocument.body)
        .set({
          margin: 0.5,
          filename: 'report_card_preview.pdf',
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        })
        .save()
        .then(() => {
          document.body.removeChild(iframe);
        })
        .catch(() => {
          document.body.removeChild(iframe);
        });
    });
  };

  // Add this helper function to process the template
  const processTemplate = (template, data) => {
    let html = template.html;

    // Replace simple variables like {{schoolName}}
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key] || '');
    });

    // Handle {{#each subjects}} loop
    if (data.subjects && Array.isArray(data.subjects)) {
      const subjectsRegex = /{{#each subjects}}([\s\S]*?){{\/each}}/g;
      html = html.replace(subjectsRegex, (match, subjectTemplate) => {
        if (data.subjects.length === 0) {
          return `<tr><td colspan="7">No subjects available</td></tr>`;
        }
        return data.subjects.map(subject => {
          let subjectHtml = subjectTemplate;
          Object.keys(subject).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            subjectHtml = subjectHtml.replace(regex, subject[key] || '');
          });
          return subjectHtml;
        }).join('');
      });
    } else {
      // If no subjects, replace the entire subjects section
      html = html.replace(/{{#each subjects}}([\s\S]*?){{\/each}}/g, 
        '<tr><td colspan="7">No subjects available</td></tr>');
    }

    return html;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            📊 Exam Results & Report Cards
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<History />}
              onClick={() => setOpenHistoryDialog(true)}
            >
              History
            </Button>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => setOpenSettingsDialog(true)}
            >
              Settings
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                fetchClasses();
                fetchTemplates();
                fetchGenerationHistory();
              }}
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4">{classes.length}</Typography>
                    <Typography variant="body2">Total Classes</Typography>
                  </Box>
                  <School sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4">{students.length}</Typography>
                    <Typography variant="body2">Active Students</Typography>
                  </Box>
                  <Group sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4">{templates.length}</Typography>
                    <Typography variant="body2">Templates</Typography>
                  </Box>
                  <Description sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4">{generationHistory.length}</Typography>
                    <Typography variant="body2">Generated Reports</Typography>
                  </Box>
                  <Assessment sx={{ fontSize: 40, opacity: 0.7 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Action Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Description sx={{ fontSize: 40, mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Single Report Card</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Generate a report card for an individual student with detailed customization options
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Custom templates" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Preview before download" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Multiple formats" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button
                  size="small" 
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenDialog(true)}
                >
                  Generate Single
                </Button>
                <Button 
                  size="small" 
                  startIcon={<Preview />}
                  onClick={handlePreviewReport}
                  disabled={!classId || !sectionId || !studentId || previewLoading}
                >
                  {previewLoading ? <CircularProgress size={16} /> : 'Preview'}
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Group sx={{ fontSize: 40, mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h6">Bulk Generation</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Generate multiple report cards at once with batch processing and progress tracking
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Batch processing" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Progress tracking" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Email delivery" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  color="secondary"
                  startIcon={<CloudDownload />}
                  onClick={() => setOpenBulkDialog(true)}
                >
                  Bulk Generate
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Analytics sx={{ fontSize: 40, mr: 1, color: 'success.main' }} />
                  <Typography variant="h6">Advanced Analytics</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  View detailed analytics and insights about student performance and trends
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Performance trends" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Class comparisons" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircle color="success" fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Export reports" />
                  </ListItem>
                </List>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  variant="contained"
                  color="success"
                  startIcon={<TrendingUp />}
                  onClick={() => enqueueSnackbar('Analytics feature coming soon!', { variant: 'info' })}
                >
                  View Analytics
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Single Report Card Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{ sx: { minHeight: '70vh' } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Generate Report Card</Typography>
              <IconButton onClick={() => setOpenDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  <StepContent>
                    {index === 0 && (
                      <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Class</InputLabel>
                          <Select
                            value={classId}
                            onChange={e => { 
                              setClassId(e.target.value); 
                              setSectionId(''); 
                              setStudentId(''); 
                              setActiveStep(0);
                            }}
                            label="Class"
                          >
                            <MenuItem value="">Select Class</MenuItem>
                            {classes.map(cls => (
                              <MenuItem key={cls._id} value={cls._id}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <School sx={{ mr: 1, fontSize: 20 }} />
                                  {cls.name}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        {classId && (
                          <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Section</InputLabel>
                            <Select
                              value={sectionId}
                              onChange={e => { 
                                setSectionId(e.target.value); 
                                setStudentId(''); 
                                setActiveStep(1);
                              }}
                              label="Section"
                            >
                              <MenuItem value="">Select Section</MenuItem>
                              {sections.map(section => (
                                <MenuItem key={section._id} value={section._id}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Class sx={{ mr: 1, fontSize: 20 }} />
                                    {section.name}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Box>
                    )}
                    {index === 1 && classId && sectionId && (
                      <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Student</InputLabel>
                          <Select
                            value={studentId}
                            onChange={e => { 
                              setStudentId(e.target.value); 
                              setActiveStep(2);
                            }}
                            label="Student"
                          >
                            <MenuItem value="">Select Student</MenuItem>
                            {filteredStudents.map(student => (
                              <MenuItem key={student._id} value={student._id}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Person sx={{ mr: 1, fontSize: 20 }} />
                                  {`${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    )}
                    {index === 2 && (
                      <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Template</InputLabel>
                          <Select
                            value={templateId}
                            onChange={e => { 
                              setTemplateId(e.target.value); 
                              setActiveStep(3);
                            }}
                            label="Template"
                          >
                            {templates.map(template => (
                              <MenuItem key={template._id} value={template._id}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Description sx={{ mr: 1, fontSize: 20 }} />
                                  {template.name}
                                  {template.isActive && (
                                    <Chip size="small" label="Active" color="success" sx={{ ml: 1 }} />
                                  )}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography>Advanced Options</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <FormGroup>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={advancedSettings.includeAttendance}
                                    onChange={e => setAdvancedSettings(prev => ({
                                      ...prev,
                                      includeAttendance: e.target.checked
                                    }))}
                                  />
                                }
                                label="Include Attendance"
                              />
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={advancedSettings.includeGraphs}
                                    onChange={e => setAdvancedSettings(prev => ({
                                      ...prev,
                                      includeGraphs: e.target.checked
                                    }))}
                                  />
                                }
                                label="Include Performance Graphs"
                              />
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={advancedSettings.includeTeacherComments}
                                    onChange={e => setAdvancedSettings(prev => ({
                                      ...prev,
                                      includeTeacherComments: e.target.checked
                                    }))}
                                  />
                                }
                                label="Include Teacher Comments"
                              />
                              {/* Add more advanced options as needed */}
                            </FormGroup>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    )}
                    {index === 3 && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleGenerateReportCard}
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={16} /> : <Save />}
                        >
                          {loading ? 'Generating...' : 'Generate Report Card'}
                        </Button>
                      </Box>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </DialogContent>
        </Dialog>

        {/* Bulk Generation Dialog */}
        <Dialog
          open={openBulkDialog}
          onClose={() => setOpenBulkDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Bulk Report Card Generation</Typography>
              <IconButton onClick={() => setOpenBulkDialog(false)}><Close /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>Select students to generate report cards for:</Typography>
            <Box sx={{ my: 2 }}>
              <Button onClick={handleSelectAll} size="small" variant="outlined">
                {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>
            <List dense>
              {filteredStudents.map(student => (
                <ListItem key={student._id} button onClick={() => handleStudentSelection(student._id)}>
                  <Checkbox checked={selectedStudents.includes(student._id)} />
                  <ListItemText primary={`${student.personalInfo?.firstName || ''} ${student.personalInfo?.lastName || ''}`} />
                </ListItem>
              ))}
            </List>
            {bulkLoading && <LinearProgress variant="determinate" value={bulkProgress} sx={{ my: 2 }} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBulkDialog(false)} disabled={bulkLoading}>Cancel</Button>
            <Button
              onClick={handleBulkGeneration}
              variant="contained"
              color="primary"
              disabled={bulkLoading || selectedStudents.length === 0}
              startIcon={bulkLoading ? <CircularProgress size={16} /> : <CloudDownload />}
            >
              {bulkLoading ? 'Generating...' : 'Generate Bulk'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog
          open={openPreviewDialog}
          onClose={() => setOpenPreviewDialog(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{ sx: { height: '90vh' } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Report Card Preview</Typography>
              <Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    if (previewData) {
                      const processedHtml = processTemplate(previewData.template, previewData.customData);
                      const newWindow = window.open('', '_blank');
                      newWindow.document.write(`
                        <html>
                          <head>
                            <title>Report Card Preview</title>
                            <style>${previewData.template.css}</style>
                          </head>
                          <body>${processedHtml}</body>
                        </html>
                      `);
                      newWindow.document.close();
                    }
                  }}
                  sx={{ mr: 1 }}
                >
                  Open in New Tab
                </Button>
                <IconButton onClick={() => setOpenPreviewDialog(false)}>
                  <Close />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {previewLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading preview...</Typography>
              </Box>
            ) : previewData ? (
              <Box sx={{ height: '100%', border: '1px solid #ddd' }}>
                <iframe
                  srcDoc={`
                    <html>
                      <head>
                        <style>${previewData.template.css}</style>
                      </head>
                      <body>${processTemplate(previewData.template, previewData.customData)}</body>
                    </html>
                  `}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    minHeight: '500px'
                  }}
                  title="Report Card Preview"
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <Typography color="text.secondary">No preview data available</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
            {previewData && (
              <Button
                variant="contained"
                onClick={() => downloadPreviewAsPDF(previewData)}
                startIcon={<Download />}
              >
                Download PDF
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog
          open={openSettingsDialog}
          onClose={() => setOpenSettingsDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Report Card Settings</Typography>
              <IconButton onClick={() => setOpenSettingsDialog(false)}><Close /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Advanced Settings</Typography>
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={advancedSettings.includeAttendance} onChange={e => setAdvancedSettings(prev => ({ ...prev, includeAttendance: e.target.checked }))} />}
                label="Include Attendance"
              />
              <FormControlLabel
                control={<Switch checked={advancedSettings.includeGraphs} onChange={e => setAdvancedSettings(prev => ({ ...prev, includeGraphs: e.target.checked }))} />}
                label="Include Performance Graphs"
              />
              <FormControlLabel
                control={<Switch checked={advancedSettings.includeTeacherComments} onChange={e => setAdvancedSettings(prev => ({ ...prev, includeTeacherComments: e.target.checked }))} />}
                label="Include Teacher Comments"
              />
              {/* Add more advanced settings as needed */}
            </FormGroup>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">Email Settings</Typography>
            <TextField
              label="Email Subject"
              fullWidth
              sx={{ my: 1 }}
              value={emailSettings.subject}
              onChange={e => setEmailSettings(prev => ({ ...prev, subject: e.target.value }))}
            />
            <TextField
              label="Email Message"
              fullWidth
              multiline
              minRows={2}
              sx={{ my: 1 }}
              value={emailSettings.message}
              onChange={e => setEmailSettings(prev => ({ ...prev, message: e.target.value }))}
            />
            <FormGroup row>
              <FormControlLabel
                control={<Checkbox checked={emailSettings.sendToParents} onChange={e => setEmailSettings(prev => ({ ...prev, sendToParents: e.target.checked }))} />}
                label="Send to Parents"
              />
              <FormControlLabel
                control={<Checkbox checked={emailSettings.sendToGuardians} onChange={e => setEmailSettings(prev => ({ ...prev, sendToGuardians: e.target.checked }))} />}
                label="Send to Guardians"
              />
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSettingsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* History Dialog */}
        <Dialog
          open={openHistoryDialog}
          onClose={() => setOpenHistoryDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">Generation History</Typography>
              <IconButton onClick={() => setOpenHistoryDialog(false)}><Close /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {generationHistory && generationHistory.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Generated By</TableCell>
                      <TableCell>Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {generationHistory.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.date ? new Date(item.date).toLocaleString() : '-'}</TableCell>
                        <TableCell>{item.type || '-'}</TableCell>
                        <TableCell>{item.generatedBy?.name || '-'}</TableCell>
                        <TableCell>{item.count || 1}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography>No generation history found.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Results;