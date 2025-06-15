import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const SAMPLE_DATA = {
  REPORT_CARD: {
    studentName: 'John Doe',
    class: 'X',
    section: 'A',
    enrollmentNumber: 'EN2023001',
    year: '2023-24',
    subjects: [
      { name: 'Mathematics', marks: 85, grade: 'A', remarks: 'Excellent' },
      { name: 'Science', marks: 78, grade: 'B+', remarks: 'Good' },
      { name: 'English', marks: 92, grade: 'A+', remarks: 'Outstanding' }
    ],
    attendance: {
      total: 220,
      present: 210,
      percentage: '95.45%'
    }
  },
  TRANSFER_CERT: {
    studentName: 'John Doe',
    fatherName: 'Robert Doe',
    motherName: 'Jane Doe',
    dateOfBirth: '2005-05-15',
    admissionNo: 'ADM2020123',
    religion: 'Christianity',
    category: 'General',
    nationality: 'Indian',
    lastClass: 'X',
    admissionDate: '2020-04-01',
    leavingDate: '2023-03-31',
    conduct: 'Good'
  },
  ID_CARD: {
    studentName: 'John Doe',
    class: 'X-A',
    enrollmentNumber: 'EN2023001',
    bloodGroup: 'B+',
    address: '123 School Street, City',
    contactNo: '9876543210',
    validUpto: '31-03-2024'
  },
  CHARACTER_CERT: {
    studentName: 'John Doe',
    enrollmentNumber: 'EN2023001',
    period: '2020-2023',
    conduct: 'Excellent',
    activities: 'Active participant in Sports and Cultural activities',
    achievements: 'School Captain, Winner of Science Exhibition'
  }
};

const TemplatePreview = ({ template, onClose }) => {
  const [customData, setCustomData] = useState(SAMPLE_DATA[template?.type] || {});
  const [useCustomData, setUseCustomData] = useState(false);

  const renderPreviewContent = () => {
    const data = useCustomData ? customData : SAMPLE_DATA[template?.type];

    switch (template?.type) {
      case 'REPORT_CARD':
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              {template.logo && (
                <img 
                  src={template.logo} 
                  alt="School Logo" 
                  style={{ height: 80, marginBottom: 16 }}
                />
              )}
              <Typography variant="h4" gutterBottom>
                {template.schoolName || 'School Name'}
              </Typography>
              <Typography variant="h5" gutterBottom>
                Report Card
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography>Name: {data.studentName}</Typography>
                <Typography>Class: {data.class}</Typography>
                <Typography>Section: {data.section}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography>Enrollment No: {data.enrollmentNumber}</Typography>
                <Typography>Academic Year: {data.year}</Typography>
              </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Academic Performance</Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: 8 }}>Subject</th>
                    <th style={{ border: '1px solid #ddd', padding: 8 }}>Marks</th>
                    <th style={{ border: '1px solid #ddd', padding: 8 }}>Grade</th>
                    <th style={{ border: '1px solid #ddd', padding: 8 }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {data.subjects.map((subject, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>{subject.name}</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>{subject.marks}</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>{subject.grade}</td>
                      <td style={{ border: '1px solid #ddd', padding: 8 }}>{subject.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>Attendance</Typography>
              <Typography>Total Days: {data.attendance.total}</Typography>
              <Typography>Days Present: {data.attendance.present}</Typography>
              <Typography>Attendance: {data.attendance.percentage}</Typography>
            </Box>
          </Box>
        );

      case 'TRANSFER_CERT':
        return (
          <Box sx={{ p: 3 }}>
            {/* Transfer Certificate Preview Content */}
            <Typography variant="h5" gutterBottom>Transfer Certificate</Typography>
            {Object.entries(data).map(([key, value]) => (
              <Typography key={key}>
                {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
              </Typography>
            ))}
          </Box>
        );

      case 'ID_CARD':
        return (
          <Box sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
            {/* ID Card Preview Content */}
            <Paper elevation={3} sx={{ p: 2 }}>
              {Object.entries(data).map(([key, value]) => (
                <Typography key={key} sx={{ mb: 1 }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}: {value}
                </Typography>
              ))}
            </Paper>
          </Box>
        );

      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography>No preview available for this template type</Typography>
          </Box>
        );
    }
  };

  const renderDataEditor = () => (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Custom Data</Typography>
      {Object.entries(customData).map(([key, value]) => (
        <TextField
          key={key}
          fullWidth
          label={key.replace(/([A-Z])/g, ' $1').trim()}
          value={value}
          onChange={(e) => setCustomData({ ...customData, [key]: e.target.value })}
          sx={{ mb: 2 }}
        />
      ))}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setUseCustomData(!useCustomData)}
          sx={{ mr: 1 }}
        >
          {useCustomData ? 'Use Sample Data' : 'Use Custom Data'}
        </Button>
      </Box>

      <Paper elevation={3}>
        {renderPreviewContent()}
      </Paper>

      {useCustomData && renderDataEditor()}
    </Box>
  );
};

export default TemplatePreview;
