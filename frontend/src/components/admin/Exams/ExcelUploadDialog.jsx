import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Alert,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import * as XLSX from 'xlsx';

const ExcelUploadDialog = ({ open, onClose, onUpload }) => {
  const [previewData, setPreviewData] = useState([]);
  const [errors, setErrors] = useState([]);

  const validateRow = (row, index) => {
    const errors = [];
    
    // Required fields
    if (!row.subject) errors.push(`Row ${index + 1}: Subject is required`);
    if (!row.date) errors.push(`Row ${index + 1}: Date is required`);
    if (!row.duration) errors.push(`Row ${index + 1}: Duration is required`);

    // Date validation
    const dateValue = new Date(row.date);
    if (isNaN(dateValue.getTime())) {
      errors.push(`Row ${index + 1}: Invalid date format`);
    }

    // Duration validation
    if (isNaN(parseInt(row.duration))) {
      errors.push(`Row ${index + 1}: Duration must be a number`);
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

        // Validate and format each row
        const formattedData = [];
        const validationErrors = [];

        data.forEach((row, index) => {
          const formattedRow = {
            subject: row.Subject || row.subject,
            date: row.Date || row.date,
            duration: row.Duration || row.duration,
          };

          const rowErrors = validateRow(formattedRow, index);
          if (rowErrors.length > 0) {
            validationErrors.push(...rowErrors);
          }

          formattedData.push(formattedRow);
        });

        setPreviewData(formattedData);
        setErrors(validationErrors);
      } catch (error) {
        setErrors(['Failed to parse Excel file']);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = () => {
    if (errors.length === 0) {
      onUpload(previewData);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Upload Exam Schedule</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
          >
            Choose Excel File
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>
        </Box>

        {errors.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          </Box>
        )}

        {previewData.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Preview
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.subject}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={errors.length > 0 || previewData.length === 0}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExcelUploadDialog;
