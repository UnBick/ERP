import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, FormControl, Select, MenuItem,
  Button, Alert, Typography, Chip, TextField, Switch,
  FormControlLabel, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import LoadingSpinner from '../../common/LoadingSpinner'; // Changed from named to default import
import * as XLSX from 'xlsx';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { getApiUrl } from '../../../config/apiConfig';


const StudentPromotion = ({ onBack }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promotionData, setPromotionData] = useState({});
  const [sections, setSections] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [selectedClass, setSelectedClass] = useState('all');
  const [sectionCapacity, setSectionCapacity] = useState({});
  const [bulkAction, setBulkAction] = useState(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadErrors, setUploadErrors] = useState({});

  useEffect(() => {
    fetchStudentsForPromotion();
    fetchNextClassSections();
    fetchSectionCapacity();
  }, [academicYear, selectedClass]);

  const fetchStudentsForPromotion = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      console.log('Fetching promotion-eligible students...');

      const response = await fetch(getApiUrl('/api/v1/admin/students/promotion-eligible'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch students');
      }

      // Ensure data.students exists and is an array
      const studentList = Array.isArray(data.students) ? data.students : [];
      console.log('Fetched students:', studentList);
      
      if (studentList.length === 0) {
        setError('No students found eligible for promotion');
      }
      
      setStudents(studentList);
      
      // Initialize promotion data for each student
      const initialPromotionData = studentList.reduce((acc, student) => ({
        ...acc,
        [student.id]: {
          nextClass: getNextClass(student.currentClass),
          nextSection: '',
          status: 'pending'
        }
      }), {});
      
      console.log('Initialized promotion data:', initialPromotionData);
      setPromotionData(initialPromotionData);

    } catch (error) {
      console.error('Error fetching students:', error);
      setError(`Failed to fetch students: ${error.message}`);
      setStudents([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine next class
  const getNextClass = (currentClass) => {
    if (!currentClass || currentClass === 'N/A') return '';
    const match = currentClass.match(/\d+/);
    if (!match) return '';
    const currentNumber = parseInt(match[0], 10);
    return `Class ${currentNumber + 1}`;
  };

  const fetchNextClassSections = async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/admin/classes/sections'));
      const data = await response.json();
      setSections(data);
    } catch (error) {
      setError('Failed to fetch sections');
    }
  };

  const fetchSectionCapacity = async () => {
    try {
      const response = await fetch(getApiUrl('/api/v1/admin/classes/section-capacity'));
      const data = await response.json();
      setSectionCapacity(data);
    } catch (error) {
      setError('Failed to fetch section capacity');
    }
  };

  const handlePromotionChange = (studentId, field, value) => {
    setPromotionData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handlePromoteStudents = async () => {
    try {
      setLoading(true);
      const promotionPayload = Object.entries(promotionData).map(([studentId, data]) => ({
        studentId,
        ...data
      }));

      const response = await fetch(getApiUrl('/api/v1/admin/students/promote'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promotionPayload)
      });

      if (!response.ok) throw new Error('Promotion failed');
      
      setSuccess('Students promoted successfully');
      await fetchStudentsForPromotion(); // Refresh the list
    } catch (error) {
      setError('Failed to promote students');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = (action) => {
    const updatedPromotionData = { ...promotionData };
    students.forEach(student => {
      updatedPromotionData[student.id] = {
        ...updatedPromotionData[student.id],
        status: action
      };
    });
    setPromotionData(updatedPromotionData);
  };

  const isSectionFull = (classId, section) => {
    const capacity = sectionCapacity[classId]?.[section] || {};
    return capacity.current >= capacity.max;
  };

  const downloadTemplate = () => {
    const template = [
      ['Student ID', 'Name', 'Current Class', 'Current Section', 'Next Class', 'Next Section', 'Status'],
      ['1', 'Example Student', '10', 'A', '11', 'A', 'promote'], // Example row
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'student_promotion_template.xlsx');
  };

  const exportToExcel = () => {
    const exportData = students.map(student => ({
      'Student ID': student.id,
      'Name': student.name,
      'Current Class': student.currentClass,
      'Current Section': student.currentSection,
      'Next Class': promotionData[student.id]?.nextClass,
      'Next Section': promotionData[student.id]?.nextSection,
      'Status': promotionData[student.id]?.status
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Promotions');
    XLSX.writeFile(wb, `student_promotions_${academicYear}.xlsx`);
  };

  const validateRow = (row) => {
    const errors = {};
    if (!row['Student ID']) errors['Student ID'] = 'Required';
    if (!row['Next Class']) errors['Next Class'] = 'Required';
    if (!row['Next Section']) errors['Next Section'] = 'Required';
    if (!['promote', 'detain', 'pending'].includes(row['Status']?.toLowerCase())) {
      errors['Status'] = 'Invalid status';
    }
    return errors;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Validate each row
        const errors = {};
        data.forEach((row, index) => {
          const rowErrors = validateRow(row);
          if (Object.keys(rowErrors).length > 0) {
            errors[index] = rowErrors;
          }
        });

        setUploadErrors(errors);
        setPreviewData(data);
        setShowPreview(true);
      } catch (error) {
        setError('Failed to parse Excel file');
      }
    };

    if (file) reader.readAsArrayBuffer(file);
  };

  const handleConfirmUpload = () => {
    if (Object.keys(uploadErrors).length > 0) {
      setError('Please fix all errors before uploading');
      return;
    }

    const newPromotionData = { ...promotionData };
    previewData.forEach(row => {
      newPromotionData[row['Student ID']] = {
        nextClass: row['Next Class'],
        nextSection: row['Next Section'],
        status: row['Status'].toLowerCase()
      };
    });

    setPromotionData(newPromotionData);
    setShowPreview(false);
    setPreviewData(null);
    setSuccess('Data uploaded successfully');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Student Promotion Management
        </Typography>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Academic Year"
          type="number"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <MenuItem value="all">All Classes</MenuItem>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={i + 1}>Class {i + 1}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={showPerformance}
              onChange={(e) => setShowPerformance(e.target.checked)}
            />
          }
          label="Show Performance"
        />
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadTemplate}
        >
          Download Template
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadIcon />}
          component="label"
        >
          Upload Excel
          <input
            type="file"
            hidden
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
          />
        </Button>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={exportToExcel}
        >
          Export Data
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleBulkAction('promote')}
        >
          Promote All
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => handleBulkAction('detain')}
        >
          Detain All
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Current Class</TableCell>
              <TableCell>Current Section</TableCell>
              <TableCell>Next Class</TableCell>
              <TableCell>Next Section</TableCell>
              {showPerformance && (
                <>
                  <TableCell>Attendance</TableCell>
                  <TableCell>Average Score</TableCell>
                </>
              )}
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(students) && students.length > 0 ? (
              students.map(student => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>Class {student.currentClass}</TableCell>
                  <TableCell>{student.currentSection}</TableCell>
                  <TableCell>
                    Class {promotionData[student.id]?.nextClass || student.currentClass + 1}
                  </TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={promotionData[student.id]?.nextSection || ''}
                        onChange={(e) => handlePromotionChange(student.id, 'nextSection', e.target.value)}
                      >
                        {sections[promotionData[student.id]?.nextClass]?.map(section => (
                          <MenuItem key={section} value={section}>
                            Section {section}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  {showPerformance && (
                    <>
                      <TableCell>
                        <Chip 
                          label={`${student.attendance}%`}
                          color={student.attendance >= 75 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${student.averageScore}%`}
                          color={student.averageScore >= 40 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    <Select
                      size="small"
                      value={promotionData[student.id]?.status || 'pending'}
                      onChange={(e) => handlePromotionChange(student.id, 'status', e.target.value)}
                      error={isSectionFull(
                        promotionData[student.id]?.nextClass,
                        promotionData[student.id]?.nextSection
                      )}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="promote">Promote</MenuItem>
                      <MenuItem value="detain">Detain</MenuItem>
                    </Select>
                    {isSectionFull(
                      promotionData[student.id]?.nextClass,
                      promotionData[student.id]?.nextSection
                    ) && (
                      <Typography variant="caption" color="error">
                        Section full
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No students available for promotion
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showPreview} maxWidth="md" fullWidth>
        <DialogTitle>Preview Upload Data</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Next Class</TableCell>
                  <TableCell>Next Section</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {previewData?.map((row, index) => (
                  <TableRow key={index} error={!!uploadErrors[index]}>
                    <TableCell>
                      {row['Student ID']}
                      {uploadErrors[index]?.['Student ID'] && (
                        <Typography color="error" variant="caption" display="block">
                          {uploadErrors[index]['Student ID']}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{row['Name']}</TableCell>
                    <TableCell>
                      {row['Next Class']}
                      {uploadErrors[index]?.['Next Class'] && (
                        <Typography color="error" variant="caption" display="block">
                          {uploadErrors[index]['Next Class']}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {row['Next Section']}
                      {uploadErrors[index]?.['Next Section'] && (
                        <Typography color="error" variant="caption" display="block">
                          {uploadErrors[index]['Next Section']}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {row['Status']}
                      {uploadErrors[index]?.['Status'] && (
                        <Typography color="error" variant="caption" display="block">
                          {uploadErrors[index]['Status']}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmUpload}
            disabled={Object.keys(uploadErrors).length > 0}
          >
            Confirm Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePromoteStudents}
          disabled={loading || students.length === 0}
        >
          Promote Selected Students
        </Button>
      </Box>
    </Box>
  );
};

export default StudentPromotion;
