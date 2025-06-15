// src/components/admin/exams/Grades.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Delete, Edit, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Grades = () => {
  const navigate = useNavigate();
  const [gradingSystem, setGradingSystem] = useState('letter'); // 'letter' or 'cgpa'
  const [grades, setGrades] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGrade, setCurrentGrade] = useState({
    grade: '',
    minMarks: '',
    maxMarks: '',
    gpaValue: ''
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await axios.get('/api/exams/exam-grades');
      setGrades(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const handleAddGrade = () => {
    setCurrentGrade({
      grade: '',
      minMarks: '',
      maxMarks: '',
      gpaValue: ''
    });
    setOpenDialog(true);
  };

  const handleSaveGrade = async () => {
    try {
      if (!currentGrade.grade || !currentGrade.minMarks || !currentGrade.maxMarks || !currentGrade.gpaValue) {
        alert('All fields are required');
        return;
      }

      const gradeData = {
        grade: currentGrade.grade,
        minMarks: parseFloat(currentGrade.minMarks),
        maxMarks: parseFloat(currentGrade.maxMarks),
        gpaValue: parseFloat(currentGrade.gpaValue)
      };

      if (currentGrade.id) {
        await axios.put(`/api/exams/exam-grades/${currentGrade.id}`, gradeData);
      } else {
        await axios.post('/api/exams/exam-grades', gradeData);
      }
      await fetchGrades();
      setOpenDialog(false);
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.message);
      } else {
        alert('Error saving grade. Please try again.');
      }
      console.error('Error saving grade:', error);
    }
  };

  const handleEditGrade = (grade) => {
    setCurrentGrade(grade);
    setOpenDialog(true);
  };

  const handleDeleteGrade = async (id) => {
    try {
      await axios.delete(`/api/exams/exam-grades/${id}`);
      fetchGrades();
    } catch (error) {
      console.error('Error deleting grade:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/exams/schedule')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5">Grade Configuration</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Grading System</InputLabel>
            <Select
              value={gradingSystem}
              onChange={(e) => setGradingSystem(e.target.value)}
            >
              <MenuItem value="letter">Letter Grades (A, B, C...)</MenuItem>
              <MenuItem value="cgpa">CGPA (0.0 - 4.0)</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddGrade}
          >
            Add Grade Range
          </Button>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Grade</TableCell>
              <TableCell>Minimum Marks (%)</TableCell>
              <TableCell>Maximum Marks (%)</TableCell>
              <TableCell>{gradingSystem === 'cgpa' ? 'CGPA Value' : 'Grade Points'}</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.map((grade) => (
              <TableRow key={grade.id}>
                <TableCell>{grade.grade}</TableCell>
                <TableCell>{grade.minMarks}</TableCell>
                <TableCell>{grade.maxMarks}</TableCell>
                <TableCell>{grade.gpaValue}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditGrade(grade)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteGrade(grade.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {currentGrade.id ? 'Edit Grade Range' : 'Add Grade Range'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Grade"
              value={currentGrade.grade}
              onChange={(e) => setCurrentGrade({...currentGrade, grade: e.target.value})}
              fullWidth
            />
            <TextField
              label="Minimum Marks (%)"
              type="number"
              value={currentGrade.minMarks}
              onChange={(e) => setCurrentGrade({...currentGrade, minMarks: e.target.value})}
              fullWidth
            />
            <TextField
              label="Maximum Marks (%)"
              type="number"
              value={currentGrade.maxMarks}
              onChange={(e) => setCurrentGrade({...currentGrade, maxMarks: e.target.value})}
              fullWidth
            />
            <TextField
              label={gradingSystem === 'cgpa' ? 'CGPA Value' : 'Grade Points'}
              type="number"
              value={currentGrade.gpaValue}
              onChange={(e) => setCurrentGrade({...currentGrade, gpaValue: e.target.value})}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveGrade} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Grades;