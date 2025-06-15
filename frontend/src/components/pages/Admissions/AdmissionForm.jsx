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

// Constants
const steps = [
  'Student Details',
  'Parent/Guardian Details',
  'Document Upload',
  'Review & Submit'
];

const classLevels = ['Nursery', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Others'];
const categories = ['General', 'OBC', 'SC', 'ST', 'Others'];

const AdmissionForm = () => {
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
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        // Show success message
        alert('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Admission submission failed:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  // Rest of the component code remains the same...
  // (renderStudentDetails, renderParentDetails, getStepContent functions stay unchanged)

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

export default AdmissionForm; 