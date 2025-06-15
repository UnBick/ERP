import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Divider
} from '@mui/material';
import FileUploadZone from '../../admin/common/FileUploadZone';

const steps = [
  'Student Details',
  'Parent/Guardian Details',
  'Document Upload',
  'Review & Submit'
];

const classLevels = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Others'];
const categories = ['General', 'OBC', 'SC', 'ST', 'Others'];

const Admissions = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    studentDetails: {
      name: '',
      nationality: '',
      dateOfBirth: null,
      placeOfBirth: '',
      gender: 'Male',
      singleGirlChild: 'No',
      speciallyAbled: 'No',
      motherTongue: '',
      religion: '',
      category: 'General',
      aadharNo: '',
      mobileNo: '',
      classLevel: '',
      documents: []
    },
    parentDetails: {
      fatherName: '',
      fatherOccupation: '',
      fatherPhone: '',
      fatherEmail: '',
      motherName: '',
      motherOccupation: '',
      motherPhone: '',
      motherEmail: '',
      guardianName: '',
      guardianOccupation: '',
      guardianPhone: '',
      guardianEmail: ''
    }
  });

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileUpload = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });

    try {
      const response = await fetch('/api/public/admissions/upload-documents', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...data.documents]
      }));
    } catch (error) {
      console.error('Document upload failed:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/public/admissions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          status: 'pending',
          submittedAt: new Date().toISOString(),
          applicationId: Math.random().toString(36).substr(2, 9) // Simple ID generation
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Application submitted successfully! Your application ID is: ${data.applicationId}`);
      }
    } catch (error) {
      console.error('Admission submission failed:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const renderStudentDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Student Details</Typography>
        <Divider sx={{ mb: 3 }} />
      </Grid>

      <Grid item xs={12}>
        <FileUploadZone
          onUpload={(files) => console.log('Files:', files)}
          acceptedFiles={['.pdf', '.doc', '.docx']}
          maxSize={5000000}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Full Name"
          value={formData.studentDetails.name}
          onChange={(e) => handleChange('studentDetails', 'name', e.target.value)}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nationality"
          value={formData.studentDetails.nationality}
          onChange={(e) => handleChange('studentDetails', 'nationality', e.target.value)}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date of Birth"
          type="date"
          value={formData.studentDetails.dateOfBirth || ''}
          onChange={(e) => handleChange('studentDetails', 'dateOfBirth', e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            max: new Date().toISOString().split('T')[0] // Prevents future dates
          }}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Place of Birth"
          value={formData.studentDetails.placeOfBirth}
          onChange={(e) => handleChange('studentDetails', 'placeOfBirth', e.target.value)}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select
            value={formData.studentDetails.gender}
            onChange={(e) => handleChange('studentDetails', 'gender', e.target.value)}
            required
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2">Single Girl Child</Typography>
          <RadioGroup
            row
            value={formData.studentDetails.singleGirlChild}
            onChange={(e) => handleChange('studentDetails', 'singleGirlChild', e.target.value)}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl component="fieldset">
          <Typography variant="subtitle2">Specially Abled</Typography>
          <RadioGroup
            row
            value={formData.studentDetails.speciallyAbled}
            onChange={(e) => handleChange('studentDetails', 'speciallyAbled', e.target.value)}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      </Grid>

      {[
        { field: 'motherTongue', label: 'Mother Tongue' },
        { field: 'aadharNo', label: 'Aadhar Number' },
        { field: 'mobileNo', label: 'Mobile Number' }
      ].map((item) => (
        <Grid item xs={12} md={6} key={item.field}>
          <TextField
            fullWidth
            label={item.label}
            value={formData.studentDetails[item.field]}
            onChange={(e) => handleChange('studentDetails', item.field, e.target.value)}
          />
        </Grid>
      ))}

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Religion</InputLabel>
          <Select
            value={formData.studentDetails.religion}
            onChange={(e) => handleChange('studentDetails', 'religion', e.target.value)}
          >
            {religions.map((religion) => (
              <MenuItem key={religion} value={religion}>{religion}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={formData.studentDetails.category}
            onChange={(e) => handleChange('studentDetails', 'category', e.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Class Level</InputLabel>
          <Select
            value={formData.studentDetails.classLevel}
            onChange={(e) => handleChange('studentDetails', 'classLevel', e.target.value)}
            required
          >
            {classLevels.map((level) => (
              <MenuItem key={level} value={level}>{level}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderParentDetails = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Parent/Guardian Details</Typography>
        <Divider sx={{ mb: 3 }} />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Father's Details</Typography>
      </Grid>
      {[
        { field: 'fatherName', label: "Father's Name" },
        { field: 'fatherOccupation', label: "Father's Occupation" },
        { field: 'fatherPhone', label: "Father's Phone Number" },
        { field: 'fatherEmail', label: "Father's Email" }
      ].map((item) => (
        <Grid item xs={12} md={6} key={item.field}>
          <TextField
            fullWidth
            label={item.label}
            value={formData.parentDetails[item.field]}
            onChange={(e) => handleChange('parentDetails', item.field, e.target.value)}
          />
        </Grid>
      ))}

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Mother's Details</Typography>
      </Grid>
      {[
        { field: 'motherName', label: "Mother's Name" },
        { field: 'motherOccupation', label: "Mother's Occupation" },
        { field: 'motherPhone', label: "Mother's Phone Number" },
        { field: 'motherEmail', label: "Mother's Email" }
      ].map((item) => (
        <Grid item xs={12} md={6} key={item.field}>
          <TextField
            fullWidth
            label={item.label}
            value={formData.parentDetails[item.field]}
            onChange={(e) => handleChange('parentDetails', item.field, e.target.value)}
          />
        </Grid>
      ))}

      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Guardian's Details (If applicable)</Typography>
      </Grid>
      {[
        { field: 'guardianName', label: "Guardian's Name" },
        { field: 'guardianOccupation', label: "Guardian's Occupation" },
        { field: 'guardianPhone', label: "Guardian's Phone Number" },
        { field: 'guardianEmail', label: "Guardian's Email" }
      ].map((item) => (
        <Grid item xs={12} md={6} key={item.field}>
          <TextField
            fullWidth
            label={item.label}
            value={formData.parentDetails[item.field]}
            onChange={(e) => handleChange('parentDetails', item.field, e.target.value)}
          />
        </Grid>
      ))}
    </Grid>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderStudentDetails();
      case 1:
        return renderParentDetails();
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>New Student Admission Application</Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep((prev) => prev - 1)}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (activeStep === steps.length - 1) {
                handleSubmit();
              } else {
                setActiveStep((prev) => prev + 1);
              }
            }}
          >
            {activeStep === steps.length - 1 ? 'Submit Application' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Admissions;