// frontend/src/components/admin/Students/StudentReports.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { saveAs } from 'file-saver';
import { Download, Print, Share, Preview } from '@mui/icons-material';
import { useStudent } from './context/StudentContext';
import { getPdfTemplate } from '../../../utils/reportTemplates';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { generatePDF } from '../../../utils/PDFReportGenerator';
import { getApiUrl } from '../../../config/apiConfig';


const ReportCard = ({ onClose, onGenerate }) => {
  // Report Card states and handlers
  const [reportConfig, setReportConfig] = useState({
    scope: 'individual',
    classId: '',
    sectionId: '',
    studentId: '',
    templateId: '',
    examType: 'all',
    includeSignature: true,
    includeLogo: true,
  });

  const [templates, setTemplates] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetchTemplates();
    fetchClasses();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/admin/templates?type=REPORT_CARD'));
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      setError('Error fetching report card templates');
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/admin/classes'));
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      setError('Error fetching classes');
    }
  };

  const fetchSections = async (classId) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/admin/sections?classId=${classId}`));
      const data = await response.json();
      setSections(data);
    } catch (error) {
      setError('Error fetching sections');
    }
  };

  const fetchStudents = async (classId, sectionId) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/admin/students?classId=${classId}&sectionId=${sectionId}`));
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      setError('Error fetching students');
    }
  };

  const handleClassChange = (e) => {
    setReportConfig({ ...reportConfig, classId: e.target.value, sectionId: '', studentId: '' });
    fetchSections(e.target.value);
  };

  const handleSectionChange = (e) => {
    setReportConfig({ ...reportConfig, sectionId: e.target.value, studentId: '' });
    fetchStudents(reportConfig.classId, e.target.value);
  };

  const handlePreview = async () => {
    try {
      const template = await getPdfTemplate(selectedTemplate.id);
      setPreviewData(template);
    } catch (error) {
      setAlert({ type: 'error', message: 'Error loading preview' });
    }
  };

  const isFormValid = () => {
    if (reportConfig.scope === 'individual' && !reportConfig.studentId) return false;
    if (reportConfig.scope !== 'school' && !reportConfig.classId) return false;
    if (reportConfig.scope === 'section' && !reportConfig.sectionId) return false;
    if (!reportConfig.templateId) return false;
    return true;
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Generate Report Cards</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Generation Scope</InputLabel>
              <Select
                value={reportConfig.scope}
                onChange={(e) => setReportConfig({ ...reportConfig, scope: e.target.value })}
              >
                <MenuItem value="individual">Individual Student</MenuItem>
                <MenuItem value="section">Entire Section</MenuItem>
                <MenuItem value="class">Entire Class</MenuItem>
                <MenuItem value="school">Entire School</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Dynamic form fields based on scope */}
          {reportConfig.scope !== 'school' && (
            <>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={reportConfig.classId}
                    onChange={handleClassChange}
                  >
                    {classes.map(cls => (
                      <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {reportConfig.scope !== 'class' && reportConfig.classId && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Section</InputLabel>
                    <Select
                      value={reportConfig.sectionId}
                      onChange={handleSectionChange}
                    >
                      {sections.map(section => (
                        <MenuItem key={section.id} value={section.id}>
                          {section.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {reportConfig.scope === 'individual' && reportConfig.sectionId && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Student</InputLabel>
                    <Select
                      value={reportConfig.studentId}
                      onChange={(e) => setReportConfig({
                        ...reportConfig,
                        studentId: e.target.value
                      })}
                    >
                      {students.map(student => (
                        <MenuItem key={student.id} value={student.id}>
                          {student.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </>
          )}

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Report Card Template</InputLabel>
              <Select
                value={reportConfig.templateId}
                onChange={(e) => setReportConfig({
                  ...reportConfig,
                  templateId: e.target.value
                })}
              >
                {templates.map(template => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={reportConfig.includeSignature}
                  onChange={(e) => setReportConfig({
                    ...reportConfig,
                    includeSignature: e.target.checked
                  })}
                />
              }
              label="Include Digital Signature"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={reportConfig.includeLogo}
                  onChange={(e) => setReportConfig({
                    ...reportConfig,
                    includeLogo: e.target.checked
                  })}
                />
              }
              label="Include School Logo"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handlePreview} startIcon={<Preview />}>
          Preview
        </Button>
        <Button
          variant="contained"
          onClick={onGenerate}
          disabled={!isFormValid()}
        >
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const StudentReports = () => {
  const { currentUser } = useStudent();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('academic');
  const [reportPeriod, setReportPeriod] = useState('current');
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [reportCardDialog, setReportCardDialog] = useState(false);
  const [alert, setAlert] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const reportTypes = [
    { value: 'academic', label: 'Academic Performance' },
    { value: 'attendance', label: 'Attendance Report' },
    { value: 'behavior', label: 'Behavioral Report' },
    { value: 'fees', label: 'Fee Statement' },
    { value: 'transport', label: 'Transport Usage' },
    { value: 'library', label: 'Library Usage' },
    { value: 'examination', label: 'Examination Results' }
  ];

  useEffect(() => {
    fetchReports();
  }, [reportType, reportPeriod]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/students/reports?type=${reportType}&period=${reportPeriod}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async (reportData, reportName) => {
    try {
      const schoolInfo = await fetchSchoolInfo();
      const ReportDocument = generatePDF(reportName, reportData, schoolInfo);
      
      return (
        <PDFDownloadLink
          document={<ReportDocument />}
          fileName={`${reportName.toLowerCase()}_report_${new Date().getTime()}.pdf`}
        >
          {({ blob, url, loading, error }) => {
            if (loading) return 'Loading...';
            if (error) return 'Error generating PDF';
            return 'Download PDF';
          }}
        </PDFDownloadLink>
      );
    } catch (error) {
      setAlert({ type: 'error', message: 'Error generating PDF report' });
    }
  };

  const handleDownload = async (reportId, format = 'pdf') => {
    try {
      if (format === 'pdf') {
        const report = reports.find(r => r.id === reportId);
        return handleGeneratePDF([report], report.name);
      }
      // ...existing excel download code...
    } catch (err) {
      setError('Failed to download report');
    }
  };

  const handleShare = async (reportId) => {
    try {
      const response = await fetch(`/api/admin/students/reports/${reportId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sharedBy: currentUser,
          shareDate: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to share report');
      }
      
      // Handle successful share
    } catch (err) {
      setError('Failed to share report');
    }
  };

  const handleGenerateReportCards = async () => {
    try {
      const response = await fetch('/api/admin/reports/generate-report-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reportConfig)
      });

      if (!response.ok) throw new Error('Failed to generate report cards');

      const blob = await response.blob();
      saveAs(blob, `report_cards_${new Date().toISOString()}.pdf`);
      setAlert({ type: 'success', message: 'Report cards generated successfully' });
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleApproveGrades = async (reportId) => {
    try {
      const response = await fetch(`/api/admin/grades/${reportId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Failed to approve grades');

      // Enable download for this report
      const updatedReports = reports.map(report => 
        report.id === reportId ? { ...report, status: 'approved' } : report
      );
      setReports(updatedReports);
      setAlert({ type: 'success', message: 'Grades approved and published' });
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Student Reports</Typography>
          <Button
            variant="contained"
            onClick={() => setReportCardDialog(true)}
          >
            Generate Report Cards
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
              >
                <MenuItem value="current">Current Semester</MenuItem>
                <MenuItem value="previous">Previous Semester</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Generated Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.name}</TableCell>
                    <TableCell>{formatDateTime(report.generatedDate)}</TableCell>
                    <TableCell>{report.status}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<Download />}
                        onClick={() => handleDownload(report.id, 'pdf')}
                        sx={{ mr: 1 }}
                      >
                        PDF
                      </Button>
                      <Button
                        startIcon={<Download />}
                        onClick={() => handleDownload(report.id, 'excel')}
                        sx={{ mr: 1 }}
                      >
                        Excel
                      </Button>
                      <Button
                        startIcon={<Print />}
                        onClick={() => window.print()}
                        sx={{ mr: 1 }}
                      >
                        Print
                      </Button>
                      <Button
                        startIcon={<Share />}
                        onClick={() => handleShare(report.id)}
                      >
                        Share
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {pendingApprovals.length > 0 && (
          <Paper sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6">Pending Approvals</Typography>
            <List>
              {pendingApprovals.map(report => (
                <ListItem key={report.id}>
                  <ListItemText
                    primary={`${report.examType} - ${report.subject}`}
                    secondary={`Submitted by: ${report.teacher}`}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleApproveGrades(report.id)}
                  >
                    Approve & Publish
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {reportCardDialog && (
          <ReportCard
            onClose={() => setReportCardDialog(false)}
            onGenerate={handleGenerateReportCards}
          />
        )}

        {alert && (
          <Snackbar
            open
            autoHideDuration={6000}
            onClose={() => setAlert(null)}
            message={alert.message}
            severity={alert.type}
          />
        )}
      </Paper>
    </Box>
  );
};

export default StudentReports;