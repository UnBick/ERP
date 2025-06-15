import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  Alert,
  Snackbar,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Paper,
  Checkbox,
  FormControlLabel, // Add this import
} from '@mui/material';

const StudentEdit = ({ onBack, studentId, initialData }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [studentData, setStudentData] = useState(initialData || null);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [bulkEditFilters, setBulkEditFilters] = useState({
    class: '',
    section: '',
    gender: '',
    status: '',
    category: ''
  });
  const [selectedFields, setSelectedFields] = useState([]);

  useEffect(() => {
    console.log('StudentEdit mounted with:', {
      studentId,
      initialData,
      studentData
    });

    // Remove the studentId check since we want to show the search interface when no ID is provided
    if (!studentData && initialData) {
      console.log('Setting initial data:', initialData);
      setStudentData(initialData);
    }
    
    fetchClassesAndSections();
  }, [initialData]);

  const fetchStudentData = async () => {
    if (!studentId) {
      console.error('Cannot fetch: No student ID');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      console.log('Fetching student data for ID:', studentId);

      const response = await fetch(`/api/v1/admin/students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success && result.data) {
        setStudentData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch student data');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      setAlert({
        type: 'error',
        message: `Error fetching student data: ${error.message}`
      });
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
      const classData = await classResponse.json();
      if (classData.success) {
        setClasses(classData.data);
      }

      // Fetch sections
      const sectionResponse = await fetch('/api/v1/admin/academic/sections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const sectionData = await sectionResponse.json();
      if (sectionData.success) {
        setSections(sectionData.data);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Error fetching classes and sections: ${error.message}`
      });
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`/api/v1/admin/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentData)
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      const result = await response.json();
      if (result.success) {
        setAlert({
          type: 'success',
          message: 'Student updated successfully'
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Failed to update student: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (section, field, value) => {
    setStudentData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setAlert({
        type: 'error',
        message: 'Please enter a search term'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      // Clean and encode the search query
      const cleanQuery = searchQuery.trim().replace(/\uFEFF/g, '');
      const encodedQuery = encodeURIComponent(cleanQuery);
      
      console.log('Making search request with query:', cleanQuery);

      const response = await fetch(`/api/v1/admin/students/search?query=${encodedQuery}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Search response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Search failed');
      }

      if (data.success && Array.isArray(data.data.students)) {
        setSearchResults(data.data.students);
        if (data.data.students.length === 0) {
          setAlert({
            type: 'info',
            message: 'No students found matching your search'
          });
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Search error:', error);
      setAlert({
        type: 'error',
        message: `Error searching students: ${error.message}`
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedFields.length === 0) {
      setAlert({
        type: 'error',
        message: 'Please select at least one field to update'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      // Prepare the filter criteria
      const filters = {
        ...(bulkEditFilters.class && { class: bulkEditFilters.class }),
        ...(bulkEditFilters.section && { section: bulkEditFilters.section }),
        ...(bulkEditFilters.gender && { 'personalInfo.gender': bulkEditFilters.gender }),
      };

      // Make the bulk update API call
      const response = await fetch('/api/v1/admin/students/bulk-update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filters,
          fieldsToUpdate: selectedFields,
          updates: studentData // This will contain the new values for selected fields
        })
      });

      if (!response.ok) {
        throw new Error('Bulk update failed');
      }

      const result = await response.json();
      
      if (result.success) {
        setAlert({
          type: 'success',
          message: `Successfully updated ${result.data.modifiedCount} students`
        });
        // Reset filters and selected fields
        setBulkEditFilters({
          class: '',
          section: '',
          gender: '',
          status: '',
          category: ''
        });
        setSelectedFields([]);
      } else {
        throw new Error(result.message || 'Failed to update students');
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      setAlert({
        type: 'error',
        message: `Failed to perform bulk update: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const editableFields = [
    // Academic Information
    { value: 'academicInfo.class', label: 'Class', category: 'Academic' },
    { value: 'academicInfo.section', label: 'Section', category: 'Academic' },
    { value: 'academicInfo.rollNumber', label: 'Roll Number', category: 'Academic' },
    { value: 'academicInfo.status', label: 'Academic Status', category: 'Academic' },
    { value: 'academicInfo.classLevel', label: 'Class Level', category: 'Academic' },
    { value: 'academicInfo.academicYear', label: 'Academic Year', category: 'Academic' },

    // Personal Information
    { value: 'personalInfo.bloodGroup', label: 'Blood Group', category: 'Personal' },
    { value: 'personalInfo.religion', label: 'Religion', category: 'Personal' },
    { value: 'personalInfo.category', label: 'Category', category: 'Personal' },
    { value: 'personalInfo.nationality', label: 'Nationality', category: 'Personal' },
    { value: 'personalInfo.motherTongue', label: 'Mother Tongue', category: 'Personal' },

    // Contact Information
    { value: 'contactInfo.phone', label: 'Phone Number', category: 'Contact' },
    { value: 'contactInfo.email', label: 'Email', category: 'Contact' },
    { value: 'contactInfo.address', label: 'Address', category: 'Contact' },
    { value: 'contactInfo.alternateContact', label: 'Alternate Contact', category: 'Contact' },

    // Medical Information
    { value: 'medicalInfo.allergies', label: 'Allergies', category: 'Medical' },
    { value: 'medicalInfo.medications', label: 'Medications', category: 'Medical' },
    { value: 'medicalInfo.specialNeeds', label: 'Special Needs', category: 'Medical' },

    // Administrative
    { value: 'isActive', label: 'Active Status', category: 'Administrative' },
    { value: 'fees.feeCategory', label: 'Fee Category', category: 'Administrative' }
  ];

  // Group fields by category
  const groupedFields = editableFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {});

  // Show loading state while fetching
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const renderBulkEditFields = () => (
    <Box>
      {Object.entries(groupedFields).map(([category, fields]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
            {category} Fields
          </Typography>
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field.value}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedFields.includes(field.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFields([...selectedFields, field.value]);
                        } else {
                          setSelectedFields(selectedFields.filter(f => f !== field.value));
                        }
                      }}
                    />
                  }
                  label={field.label}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box>
      <Button onClick={onBack} sx={{ mb: 2 }}>Back</Button>
      
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Individual Edit" />
        <Tab label="Bulk Edit" />
      </Tabs>

      {tabValue === 0 ? (
        <Box sx={{ mt: 3 }}>
          {/* Always show search section if no student data */}
          {!studentData && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Search Student to Edit
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Search Students"
                    placeholder="Enter name, enrollment number, or class"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={!searchQuery.trim()}
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>

              {searchResults.length > 0 && (
                <TableContainer sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Enrollment No</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchResults.map((student) => (
                        <TableRow key={student._id}>
                          <TableCell>{student.enrollmentNumber}</TableCell>
                          <TableCell>
                            {`${student.personalInfo?.firstName} ${student.personalInfo?.lastName}`}
                          </TableCell>
                          <TableCell>{student.academicInfo?.class?.name}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => {
                                setStudentData(student);
                                setSearchResults([]);
                                setSearchQuery('');
                              }}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          )}

          {/* Show edit form only when studentData is available */}
          {studentData && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={studentData.personalInfo?.firstName || ''}
                        onChange={(e) => handleFieldChange('personalInfo', 'firstName', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={studentData.personalInfo?.lastName || ''}
                        onChange={(e) => handleFieldChange('personalInfo', 'lastName', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        type="date"
                        value={studentData.personalInfo?.dateOfBirth?.split('T')[0] || ''}
                        onChange={(e) => handleFieldChange('personalInfo', 'dateOfBirth', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Gender</InputLabel>
                        <Select
                          value={studentData.personalInfo?.gender || ''}
                          onChange={(e) => handleFieldChange('personalInfo', 'gender', e.target.value)}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Academic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Class</InputLabel>
                        <Select
                          value={studentData.academicInfo?.class || ''}
                          onChange={(e) => handleFieldChange('academicInfo', 'class', e.target.value)}
                        >
                          {classes.map(cls => (
                            <MenuItem key={cls._id} value={cls._id}>
                              {cls.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Section</InputLabel>
                        <Select
                          value={studentData.academicInfo?.section || ''}
                          onChange={(e) => handleFieldChange('academicInfo', 'section', e.target.value)}
                        >
                          {sections
                            .filter(section => section.class === studentData.academicInfo?.class)
                            .map(section => (
                              <MenuItem key={section._id} value={section._id}>
                                {section.name}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Roll Number"
                        value={studentData.academicInfo?.rollNumber || ''}
                        onChange={(e) => handleFieldChange('academicInfo', 'rollNumber', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={studentData.contactInfo?.email || ''}
                        onChange={(e) => handleFieldChange('contactInfo', 'email', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={studentData.contactInfo?.phone || ''}
                        onChange={(e) => handleFieldChange('contactInfo', 'phone', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address"
                        multiline
                        rows={3}
                        value={studentData.contactInfo?.address || ''}
                        onChange={(e) => handleFieldChange('contactInfo', 'address', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={onBack}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpdate}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      ) : (
        <Box sx={{ mt: 3 }}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bulk Edit Filters
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={bulkEditFilters.class}
                    onChange={(e) => setBulkEditFilters({
                      ...bulkEditFilters,
                      class: e.target.value
                    })}
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {classes.map(cls => (
                      <MenuItem key={cls._id} value={cls._id}>{cls.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Section</InputLabel>
                  <Select
                    value={bulkEditFilters.section}
                    onChange={(e) => setBulkEditFilters({
                      ...bulkEditFilters,
                      section: e.target.value
                    })}
                  >
                    <MenuItem value="">All Sections</MenuItem>
                    {sections.map(section => (
                      <MenuItem key={section._id} value={section._id}>{section.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={bulkEditFilters.gender}
                    onChange={(e) => setBulkEditFilters({
                      ...bulkEditFilters,
                      gender: e.target.value
                    })}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              Select Fields to Edit
            </Typography>

            {renderBulkEditFields()}

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleBulkUpdate}
                disabled={selectedFields.length === 0}
              >
                Apply Changes to Selected Students
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      <Snackbar
        open={!!alert}
        autoHideDuration={6000}
        onClose={() => setAlert(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setAlert(null)}
          severity={alert?.type}
          sx={{ width: '100%' }}
        >
          {alert?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentEdit;
