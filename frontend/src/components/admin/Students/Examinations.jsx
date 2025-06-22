// frontend/src/components/admin/Students/Examinations.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Edit, Delete, Add, Download } from '@mui/icons-material';
import { useStudent } from './context/StudentContext';
import { getApiUrl } from '../../../config/apiConfig';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';

const Examinations = () => {
  const { currentUser, currentDate } = useStudent();
  const [activeTab, setActiveTab] = useState(0);
  const [examinations, setExaminations] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [examSchedule, setExamSchedule] = useState([]);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [newExam, setNewExam] = useState({
    name: '',
    subject: '',
    date: null,
    duration: '',
    totalMarks: '',
    instructions: ''
  });

  const tabs = ['Upcoming Exams', 'Past Exams', 'Results', 'Grade Cards'];

  useEffect(() => {
    fetchExaminations();
  }, [activeTab]);

  const fetchExaminations = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const type = tabs[activeTab].toLowerCase().split(' ')[0]; // Get 'upcoming', 'past', etc.

      const response = await fetch(getApiUrl(`/api/v1/admin/examinations?type=${type}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch examinations');
      }

      const data = await response.json();
      if (data.success) {
        setExaminations(data.data.exams || []);
      }
    } catch (error) {
      console.error('Error fetching examinations:', error);
    }
  };

  const handleExportResults = async (examId) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/admin/examinations/${examId}/export`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exam_results_${examId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  const handleScheduleExam = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/admin/examinations/schedule'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newExam)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule exam');
      }

      if (data.success) {
        setScheduleDialog(false);
        setNewExam({
          name: '',
          subject: '',
          date: null,
          duration: '',
          totalMarks: '',
          instructions: ''
        });
        fetchExaminations();
      }
    } catch (error) {
      console.error('Error scheduling exam:', error);
    }
  };

  const renderScheduleTimeline = () => (
    <Timeline position="alternate">
      {examSchedule.map((exam) => (
        <TimelineItem key={exam.id}>
          <TimelineSeparator>
            <TimelineDot color="primary" />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6">{exam.name}</Typography>
              <Typography>{exam.subject}</Typography>
              <Typography variant="caption">
                {new Date(exam.date).toLocaleDateString()}
              </Typography>
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );

  const ExamSchedule = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Exam Name</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Date & Time</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {examinations.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell>{exam.name}</TableCell>
              <TableCell>{exam.class}</TableCell>
              <TableCell>{exam.subject}</TableCell>
              <TableCell>{new Date(exam.dateTime).toLocaleString()}</TableCell>
              <TableCell>{exam.duration} mins</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEditExam(exam)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDeleteExam(exam.id)}>
                  <Delete />
                </IconButton>
                {activeTab === 2 && (
                  <IconButton onClick={() => handleExportResults(exam.id)}>
                    <Download />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const ResultsUpload = () => (
    <Box sx={{ mt: 2 }}>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleResultsFileUpload}
        style={{ display: 'none' }}
        id="results-upload"
      />
      <label htmlFor="results-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<Add />}
        >
          Upload Results
        </Button>
      </label>
    </Box>
  );

  const handleResultsFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('resultsFile', file);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/admin/examinations/results/upload'), {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload results');
      }
      
      // Refresh the examinations list
      fetchExaminations();
    } catch (error) {
      console.error('Error uploading results:', error);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Examinations Management
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab} />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            {activeTab === 0 ? 'Schedule New Exam' : 'Add Result'}
          </Button>
        </Box>

        {(activeTab === 0 || activeTab === 1) && <ExamSchedule />}
        {activeTab === 2 && <ResultsUpload />}

        {/* Add Exam Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {/* Add exam form components */}
        </Dialog>

        <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)}>
          <DialogTitle>Schedule New Exam</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Exam Name"
                  value={newExam.name}
                  onChange={(e) => setNewExam({...newExam, name: e.target.value})}
                />
              </Grid>
              {/* Add more exam schedule fields */}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleScheduleExam}>
              Schedule
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Examinations;