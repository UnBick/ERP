// src/components/student/Grades.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [publishedGrades, setPublishedGrades] = useState([]);

  useEffect(() => {
    fetchGrades();
    fetchPublishedGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/grades');
      const data = await response.json();
      setGrades(data);
    } catch (error) {
      setAlert('Error fetching grades');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublishedGrades = async () => {
    try {
      const response = await fetch('/api/student/published-grades');
      const data = await response.json();
      setPublishedGrades(data);
    } catch (error) {
      setAlert('Error fetching grades');
    }
  };

  const handleDownloadReport = async (examId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/student/grade-report/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to download report');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_card_${examId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      setAlert('Error downloading report');
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          View Grades
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grades.map((grade) => (
                <TableRow key={grade.id}>
                  <TableCell>{grade.subject}</TableCell>
                  <TableCell>{grade.grade}</TableCell>
                  <TableCell>{grade.remarks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {alert && (
          <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert onClose={() => setAlert(null)} severity="error">
              {alert}
            </Alert>
          </Snackbar>
        )}

        {publishedGrades.map((grade) => (
          <Box key={grade.id} sx={{ mt: 3 }}>
            <Typography variant="h6">{grade.examType}</Typography>
            <Typography>{grade.score}</Typography>
            {grade.reportAvailable && (
              <Button onClick={() => handleDownloadReport(grade.examId)}>
                Download Report
              </Button>
            )}
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default Grades;