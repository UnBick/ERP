import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  Menu,
  MenuItem,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  ArrowUpward,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import StudentEdit from './StudentEdit';

const StudentTable = ({ onBack }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    status: 'all',
    admissionYear: '',
    gender: 'all',
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [classWiseSections, setClassWiseSections] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [searchQuery]);

  useEffect(() => {
    fetchClassesAndSections();
  }, []);

  const showAlert = (message, type = 'error') => {
    setAlert({
      message: typeof message === 'string' ? message : 'An error occurred',
      type
    });
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Log filters before creating query
      console.log('Current filters state:', filters);

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      // Only add parameters if they have values
      if (searchQuery?.trim()) {
        queryParams.append('search', searchQuery.trim());
      }
      
      // Ensure filters.class is a valid value before adding
      if (filters.class && filters.class !== '') {
        queryParams.append('classId', filters.class);
        console.log('Adding class filter:', filters.class);
      }
      
      // Ensure filters.section is a valid value before adding
      if (filters.section && filters.section !== '') {
        queryParams.append('sectionId', filters.section);
        console.log('Adding section filter:', filters.section);
      }
      
      if (filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }

      const url = `/api/v1/admin/students?${queryParams.toString()}`;
      console.log('Fetching URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const result = await response.json();
      console.log('Students data:', result);

      if (result.success) {
        setStudents(result.data.students);
      } else {
        throw new Error(result.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      showAlert(error.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSections = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      // Fetch classes
      const classResponse = await fetch('/api/v1/admin/academic/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!classResponse.ok) {
        throw new Error('Failed to fetch classes');
      }

      const classData = await classResponse.json();
      console.log('Fetched classes:', classData);

      if (classData.success) {
        setClasses(classData.data || []);
      }

      // Fetch sections
      const sectionResponse = await fetch('/api/v1/admin/academic/sections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!sectionResponse.ok) {
        throw new Error('Failed to fetch sections');
      }

      const sectionData = await sectionResponse.json();
      console.log('Fetched sections:', sectionData);

      if (sectionData.success) {
        setSections(sectionData.data || []);
        
        // Group sections by class
        const sectionsByClass = {};
        sectionData.data.forEach(section => {
          if (!sectionsByClass[section.class]) {
            sectionsByClass[section.class] = [];
          }
          sectionsByClass[section.class].push(section);
        });
        console.log('Sections by class:', sectionsByClass);
        setClassWiseSections(sectionsByClass);
      }
    } catch (error) {
      console.error('Error fetching classes and sections:', error);
      showAlert('Error fetching classes and sections');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/admin/students/export', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const blob = await response.blob();
      saveAs(blob, 'students_list.xlsx');
      showAlert('Export successful', 'success');
    } catch (error) {
      showAlert('Error exporting data');
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(students.map((student) => student.id || student._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((studentId) => studentId !== id)
        : [...prevSelected, id]
    );
  };

  const applyFilters = () => {
    console.log('Applying filters:', filters);
    fetchStudents(); // This will use the current filters state
    setAnchorEl(null); // Close the menu after applying filters
  };

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleViewStudent = (event, student) => {
    event.stopPropagation();
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleEditClick = (event, student) => {
    event.stopPropagation();
    console.log('Editing student:', student); // Debug log
    if (!student || !student._id) {
      console.error('Invalid student data:', student);
      return;
    }
    setSelectedStudentId(student._id);
    setSelectedStudent(student);
    setIsEditing(true);
  };

  // If editing, show the StudentEdit component
  if (isEditing) {
    return (
      <StudentEdit 
        onBack={() => {
          setIsEditing(false);
          setSelectedStudentId(null);
          setSelectedStudent(null);
          fetchStudents(); // Refresh the list after editing
        }}
      />
    );
  }

  // Helper function to safely get nested properties
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => (acc && acc[part] ? acc[part] : ''), obj);
  };

  // Add this helper function for arrays
  const getArrayValue = (obj, path) => {
    const value = getNestedValue(obj, path);
    return Array.isArray(value) ? value : [];
  };

  // Helper function to get formatted student name
  const getStudentName = (student) => {
    const firstName = getNestedValue(student, 'personalInfo.firstName');
    const lastName = getNestedValue(student, 'personalInfo.lastName');
    return `${firstName} ${lastName}`;
  };

  // Update getClassInfo and add getSectionInfo helper function
  const getClassInfo = (student) => {
    const classInfo = getNestedValue(student, 'academicInfo.class');
    return classInfo?.name || getNestedValue(student, 'academicInfo.classLevel') || 'N/A';
  };

  const getSectionInfo = (student) => {
    const sectionInfo = getNestedValue(student, 'academicInfo.section');
    return sectionInfo?.name || getNestedValue(student, 'academicInfo.sectionName') || 'N/A';
  };

  const handleClassChange = (event) => {
    const newClassId = event.target.value;
    console.log('Class selected:', newClassId);
    
    // Update filters with the new class ID
    setFilters(prev => ({
      ...prev,
      class: newClassId,
      section: '' // Reset section when class changes
    }));
  };

  const handleSectionChange = (event) => {
    const newSectionId = event.target.value;
    console.log('Selected section:', newSectionId);
    
    setFilters(prev => ({
      ...prev,
      section: newSectionId
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      <Button onClick={onBack} sx={{ mb: 2 }}>
        Back to Menu
      </Button>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button startIcon={<FilterIcon />} onClick={(e) => setAnchorEl(e.currentTarget)}>
          Filters
        </Button>
        <Button startIcon={<DownloadIcon />} onClick={handleExport}>
          Export
        </Button>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <Box sx={{ p: 2, minWidth: 250 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Class</InputLabel>
            <Select
              value={filters.class || ''} // Ensure empty string if null/undefined
              onChange={handleClassChange}
              label="Class"
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }} disabled={!filters.class}>
            <InputLabel>Section</InputLabel>
            <Select
              value={filters.section || ''} // Ensure empty string if null/undefined
              onChange={handleSectionChange}
              label="Section"
              disabled={!filters.class}
            >
              <MenuItem value="">All Sections</MenuItem>
              {filters.class && classWiseSections[filters.class]?.map(section => (
                <MenuItem key={section._id} value={section._id}>
                  {section.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button 
            fullWidth 
            variant="contained" 
            onClick={applyFilters} 
            sx={{ mt: 2 }}
            disabled={!filters.class && filters.section} // Disable if trying to filter by section only
          >
            Apply Filters
          </Button>
        </Box>
      </Menu>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.length === students.length && students.length > 0}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Section</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow
                    key={student._id || student.id}
                    hover
                    onClick={() => handleRowClick(student)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(student._id || student.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectOne(student._id || student.id);
                        }}
                      />
                    </TableCell>
                    <TableCell>{String(student.enrollmentNumber || 'N/A')}</TableCell>
                    <TableCell>{String(getStudentName(student))}</TableCell>
                    <TableCell>{String(getClassInfo(student))}</TableCell>
                    <TableCell>{getSectionInfo(student)}</TableCell>
                    <TableCell>
                      <Chip
                        label={student.isActive ? 'Active' : 'Inactive'}
                        color={student.isActive ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleViewStudent(e, student)}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => handleEditClick(e, student)}
                        color="secondary"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add delete handler
                        }}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
            overflow: 'auto'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2
        }}>
          <Typography variant="h6" component="div">
            Student Details
          </Typography>
          <IconButton
            onClick={() => setOpenDialog(false)}
            sx={{ color: 'white' }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {selectedStudent && (
            <Grid container spacing={3}>
              {/* Personal Information Section */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Enrollment Number"
                        value={selectedStudent.enrollmentNumber || 'N/A'}
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={getNestedValue(selectedStudent, 'personalInfo.firstName') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={getNestedValue(selectedStudent, 'personalInfo.lastName') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        value={formatDate(getNestedValue(selectedStudent, 'personalInfo.dateOfBirth'))}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Gender"
                        value={getNestedValue(selectedStudent, 'personalInfo.gender') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Blood Group"
                        value={getNestedValue(selectedStudent, 'personalInfo.bloodGroup') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Religion"
                        value={getNestedValue(selectedStudent, 'personalInfo.religion') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Category"
                        value={getNestedValue(selectedStudent, 'personalInfo.category') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Nationality"
                        value={getNestedValue(selectedStudent, 'personalInfo.nationality') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Aadhar Number"
                        value={getNestedValue(selectedStudent, 'personalInfo.aadharNo') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Academic Information Section */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Academic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Class"
                        value={getClassInfo(selectedStudent)}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Section"
                        value={getSectionInfo(selectedStudent)}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Roll Number"
                        value={getNestedValue(selectedStudent, 'academicInfo.rollNumber') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Admission Number"
                        value={getNestedValue(selectedStudent, 'academicInfo.admissionNumber') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Admission Date"
                        value={formatDate(getNestedValue(selectedStudent, 'academicInfo.admissionDate'))}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Academic Year"
                        value={getNestedValue(selectedStudent, 'academicInfo.academicYear') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Contact Information Section */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={getNestedValue(selectedStudent, 'contactInfo.email') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={getNestedValue(selectedStudent, 'contactInfo.phone') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={getNestedValue(selectedStudent, 'contactInfo.address') || 'N/A'}
                        InputProps={{ readOnly: true }}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Guardian Information */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Guardian Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Guardian Name"
                        value={getNestedValue(selectedStudent, 'contactInfo.guardianName') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Guardian Contact"
                        value={getNestedValue(selectedStudent, 'contactInfo.guardianContact') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Guardian Relation"
                        value={getNestedValue(selectedStudent, 'contactInfo.guardianRelation') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Alternate Contact"
                        value={getNestedValue(selectedStudent, 'contactInfo.alternateContact') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Medical Information */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Medical Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Allergies"
                        value={getArrayValue(selectedStudent, 'medicalInfo.allergies').join(', ') || 'None'}
                        InputProps={{ readOnly: true }}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Medical History"
                        value={getNestedValue(selectedStudent, 'medicalInfo.medicalHistory') || 'N/A'}
                        InputProps={{ readOnly: true }}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Medications"
                        value={getArrayValue(selectedStudent, 'medicalInfo.medications').join(', ') || 'None'}
                        InputProps={{ readOnly: true }}
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Special Needs"
                        value={getNestedValue(selectedStudent, 'medicalInfo.specialNeeds') || 'None'}
                        InputProps={{ readOnly: true }}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Fees Information */}
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Fees Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Fee Category"
                        value={getNestedValue(selectedStudent, 'fees.feeCategory') || 'N/A'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Pending Amount"
                        value={getNestedValue(selectedStudent, 'fees.pendingAmount') || '0'}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Payment Date"
                        value={formatDate(getNestedValue(selectedStudent, 'fees.lastPaymentDate'))}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
          <Button
            variant="contained"
            onClick={() => setOpenDialog(false)}
            sx={{ minWidth: 100 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {alert && (
        <Snackbar
          open={!!alert}
          autoHideDuration={6000}
          onClose={() => setAlert(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setAlert(null)}
            severity={alert.type}
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default StudentTable;
