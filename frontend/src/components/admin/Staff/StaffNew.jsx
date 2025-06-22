import React, { useState } from 'react';
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
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { CloudUpload, Save, Preview } from '@mui/icons-material';
import { read, utils } from 'xlsx';
import { getApiUrl } from '../../../config/apiConfig';

const StaffNew = ({ onBack }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [staffData, setStaffData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
    },
    professionalInfo: {
      department: '',
      role: '',
      qualification: '',
      experience: '',
      joiningDate: '',
      salary: '',
    },
    documents: [],
  });
  const [importedData, setImportedData] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const departments = ['Mathematics', 'Science', 'English', 'History', 'Administration'];
  const roles = ['Teacher', 'Administrator', 'Support Staff', 'Counselor'];

  const steps = ['Personal Information', 'Professional Information', 'Documents'];

  const handleManualSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/admin/staff/new'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(staffData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add staff member');
      }

      setAlert({ type: 'success', message: 'Staff member added successfully' });
      resetForm();
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const data = await readExcelFile(file);
        setImportedData(validateImportData(data));
        setPreviewMode(true);
      } catch (error) {
        setAlert({ type: 'error', message: 'Error reading file' });
      }
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = read(e.target.result, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const data = utils.sheet_to_json(workbook.Sheets[firstSheet]);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const validateImportData = (data) => {
    return data.map(row => ({
      ...row,
      isValid: validateStaffMember(row),
      errors: getValidationErrors(row)
    }));
  };

  const validateStaffMember = (staff) => {
    return staff.firstName && 
           staff.email && 
           staff.department && 
           staff.role;
  };

  const getValidationErrors = (staff) => {
    const errors = [];
    if (!staff.firstName) errors.push('First name is required');
    if (!staff.email) errors.push('Email is required');
    if (!staff.department) errors.push('Department is required');
    if (!staff.role) errors.push('Role is required');
    return errors;
  };

  const handleBulkImport = async () => {
    setLoading(true);
    try {
      const validData = importedData.filter(staff => staff.isValid);
      const response = await fetch(getApiUrl('/api/admin/staff/bulk-import'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ staff: validData })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import staff');
      }

      setAlert({ type: 'success', message: 'Staff imported successfully' });
      setPreviewMode(false);
      setImportedData([]);
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStaffData({
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
      },
      professionalInfo: {
        department: '',
        role: '',
        qualification: '',
        experience: '',
        joiningDate: '',
        salary: '',
      },
      documents: [],
    });
  };

  const renderPersonalInfo = () => (
    <Grid container spacing={2}>
      {/* Add form fields for personal information */}
    </Grid>
  );

  const renderProfessionalInfo = () => (
    <Grid container spacing={2}>
      {/* Add form fields for professional information */}
    </Grid>
  );

  const renderDocumentUpload = () => (
    <Grid container spacing={2}>
      {/* Add document upload section */}
    </Grid>
  );

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderManualEntry = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="First Name"
          value={staffData.personalInfo.firstName}
          onChange={(e) => setStaffData({ ...staffData, personalInfo: { ...staffData.personalInfo, firstName: e.target.value } })}
          required
        />
      </Grid>
      {/* Add more form fields similarly */}
      <Grid item xs={12}>
        <Button
          variant="contained"
          onClick={handleManualSubmit}
          disabled={loading}
          startIcon={<Save />}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Staff Member'}
        </Button>
      </Grid>
    </Grid>
  );

  const renderFileImport = () => (
    <Box>
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        id="staff-file-upload"
        onChange={handleFileUpload}
      />
      <label htmlFor="staff-file-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUpload />}
          sx={{ mb: 3 }}
        >
          Upload Staff Data
        </Button>
      </label>

      {previewMode && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Preview Import Data
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importedData.map((staff, index) => (
                  <TableRow key={index}>
                    <TableCell>{staff.firstName} {staff.lastName}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>
                      {staff.isValid ? (
                        <Alert severity="success" sx={{ py: 0 }}>Valid</Alert>
                      ) : (
                        <Alert severity="error" sx={{ py: 0 }}>{staff.errors[0]}</Alert>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleBulkImport}
              disabled={loading || !importedData.some(staff => staff.isValid)}
            >
              {loading ? <CircularProgress size={24} /> : 'Import Valid Records'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <Button onClick={onBack} sx={{ mb: 2 }}>Back to Menu</Button>
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Manual Entry" />
        <Tab label="Import from File" />
      </Tabs>
      <Box sx={{ mt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 && renderPersonalInfo()}
        {activeStep === 1 && renderProfessionalInfo()}
        {activeStep === 2 && renderDocumentUpload()}
      </Box>
      {alert && (
        <Snackbar
          open={!!alert}
          autoHideDuration={6000}
          onClose={() => setAlert(null)}
        >
          <Alert severity={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default StaffNew;
