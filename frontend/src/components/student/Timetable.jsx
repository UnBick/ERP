// src/components/student/Timetable.jsx
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
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  CalendarMonth,
  ViewWeek,
  ViewDay,
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [filters, setFilters] = useState({
    subject: 'all',
    day: 'all',
  });
  const [remindersEnabled, setRemindersEnabled] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/student/timetable');
      const data = await response.json();
      setTimetable(data);
    } catch (error) {
      setAlert('Error fetching timetable');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    try {
      const response = await fetch(`/api/student/timetable/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timetable.${format}`;
      a.click();
    } catch (error) {
      setAlert('Error downloading timetable');
    }
  };

  const toggleReminders = async () => {
    try {
      await fetch('/api/student/timetable/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !remindersEnabled }),
      });
      setRemindersEnabled(!remindersEnabled);
    } catch (error) {
      setAlert('Error updating notification preferences');
    }
  };

  const filteredTimetable = timetable.filter(item => {
    return (
      (filters.subject === 'all' || item.subject === filters.subject) &&
      (filters.day === 'all' || item.day === filters.day) &&
      (searchQuery === '' || 
       item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.room.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Class Timetable</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, value) => setViewMode(value)}
              size="small"
            >
              <ToggleButton value="table"><ViewWeek /></ToggleButton>
              <ToggleButton value="calendar"><CalendarMonth /></ToggleButton>
              <ToggleButton value="day"><ViewDay /></ToggleButton>
            </ToggleButtonGroup>
            
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
              <FilterIcon />
            </IconButton>

            <IconButton onClick={() => handleDownload('pdf')}>
              <DownloadIcon />
            </IconButton>

            <FormControlLabel
              control={
                <Switch
                  checked={remindersEnabled}
                  onChange={toggleReminders}
                />
              }
              label="Reminders"
            />
          </Box>
        </Box>

        {viewMode === 'table' && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Day</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Room</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTimetable.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>{classItem.day}</TableCell>
                    <TableCell>{classItem.time}</TableCell>
                    <TableCell>{classItem.subject}</TableCell>
                    <TableCell>{classItem.room}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {viewMode === 'calendar' && (
          <Calendar
            localizer={localizer}
            events={filteredTimetable.map(item => ({
              title: `${item.subject} - ${item.room}`,
              start: new Date(item.date + ' ' + item.time.split('-')[0]),
              end: new Date(item.date + ' ' + item.time.split('-')[1]),
            }))}
            style={{ height: 500 }}
          />
        )}

        {viewMode === 'day' && (
          <Grid container spacing={2}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
              <Grid item xs={12} md={2.4} key={day}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{day}</Typography>
                    {filteredTimetable
                      .filter(item => item.day === day)
                      .map(item => (
                        <Box key={item.id} sx={{ mt: 1 }}>
                          <Typography variant="subtitle2">{item.time}</Typography>
                          <Typography>{item.subject}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {item.room}
                          </Typography>
                        </Box>
                      ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Menu
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={() => setFilterAnchor(null)}
        >
          <MenuItem>
            <Typography variant="subtitle2">Subject Filter</Typography>
            <Select
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              size="small"
            >
              <MenuItem value="all">All Subjects</MenuItem>
              {/* Add unique subjects dynamically */}
            </Select>
          </MenuItem>
          <MenuItem>
            <Typography variant="subtitle2">Day Filter</Typography>
            <Select
              value={filters.day}
              onChange={(e) => setFilters({...filters, day: e.target.value})}
              size="small"
            >
              <MenuItem value="all">All Days</MenuItem>
              <MenuItem value="Monday">Monday</MenuItem>
              <MenuItem value="Tuesday">Tuesday</MenuItem>
              <MenuItem value="Wednesday">Wednesday</MenuItem>
              <MenuItem value="Thursday">Thursday</MenuItem>
              <MenuItem value="Friday">Friday</MenuItem>
            </Select>
          </MenuItem>
        </Menu>

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
      </Paper>
    </Box>
  );
};

export default Timetable;