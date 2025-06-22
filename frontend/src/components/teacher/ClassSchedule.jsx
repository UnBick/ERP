// src/components/teacher/ClassSchedule.jsx
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
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { Print, FilterList, ViewWeek, ViewDay } from '@mui/icons-material';
import { getApiUrl } from '../../config/apiConfig';

const ClassSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [selectedClass, setSelectedClass] = useState('all');
  const [reminderDialog, setReminderDialog] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [substituteRequests, setSubstituteRequests] = useState([]);
  const [scheduleNotes, setScheduleNotes] = useState({});

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/teacher/schedule'));
      const data = await response.json();
      setSchedule(data);
    } catch (error) {
      setAlert('Error fetching schedule');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSetReminder = async (classId) => {
    // Reminder setting logic
  };

  const handleRequestSubstitute = async (classId, date) => {
    try {
      await fetch('/api/teacher/request-substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, date })
      });
    } catch (error) {
      setAlert('Error requesting substitute');
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Class Schedule</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}>
              {viewMode === 'table' ? <ViewWeek /> : <ViewDay />}
            </IconButton>
            <IconButton onClick={handlePrint}><Print /></IconButton>
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              size="small"
            >
              <MenuItem value="all">All Classes</MenuItem>
              {/* Add class options */}
            </Select>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={9}>
            {viewMode === 'table' && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Classroom</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {schedule.map((classItem) => (
                      <TableRow key={classItem.id}>
                        <TableCell>{classItem.day}</TableCell>
                        <TableCell>{classItem.time}</TableCell>
                        <TableCell>{classItem.subject}</TableCell>
                        <TableCell>{classItem.classroom}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {viewMode === 'calendar' && (
              <Calendar
                events={schedule.map(item => ({
                  title: item.subject,
                  start: new Date(`${item.date} ${item.time.split('-')[0]}`),
                  end: new Date(`${item.date} ${item.time.split('-')[1]}`),
                }))}
              />
            )}

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
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6">Schedule Actions</Typography>
                {/* Add quick actions and notifications */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ClassSchedule;