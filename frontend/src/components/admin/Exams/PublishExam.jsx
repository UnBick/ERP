import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import { ArrowBack, Settings, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import axios from 'axios';
import { getApiUrl } from '../../../config/apiConfig';


const PublishExam = () => {
  const navigate = useNavigate();
  const [examTypes, setExamTypes] = useState([]); // Initialize as empty array
  const [publishSettings, setPublishSettings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState({
    examType: '',
    publishType: 'immediate', // 'immediate' or 'scheduled'
    requireAllSubjects: true,
    classWiseSchedule: [],
    autoPublish: false,
  });
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [classSelectionType, setClassSelectionType] = useState('all'); // 'all' or 'individual'
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchExamTypes();
    fetchPublishSettings();
    fetchClasses();
  }, []);

  const fetchExamTypes = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/v1/exams'));
      console.log('Exam types response:', response.data);

      if (response.data.success) {
        const transformedExams = response.data.data.map((exam) => ({
          id: exam._id,
          examType: exam.name,
          shortName: exam.shortName,
        }));
        setExamTypes(transformedExams);
      }
    } catch (error) {
      console.error('Error fetching exam types:', error);
      setExamTypes([]); // Set to empty array on error
    }
  };

  const fetchPublishSettings = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/v1/exams/publish-settings'));
      console.log('Fetched publish settings:', response.data);
      if (response.data.success) {
        // Transform the publish settings data
        const transformedSettings = response.data.data.map(setting => ({
          id: setting._id,
          examType: setting.examType.name || setting.examType, // Handle both populated and unpopulated cases
          examTypeId: setting.examType._id || setting.examType,
          publishType: setting.publishType,
          requireAllSubjects: setting.requireAllSubjects,
          autoPublish: setting.autoPublish,
          classWiseSchedule: setting.classWiseSchedule
        }));
        setPublishSettings(transformedSettings);
      }
    } catch (error) {
      console.error('Error fetching publish settings:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/v1/exams/classes'));
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleAddSetting = () => {
    setSelectedSetting({
      examType: '',
      publishType: 'immediate',
      requireAllSubjects: true,
      classWiseSchedule: [],
      autoPublish: false,
    });
    setOpenDialog(true);
  };

  const handleEditSetting = (setting) => {
    setSelectedSetting(setting);
    setOpenDialog(true);
  };

  const handleSaveSetting = async () => {
    try {
      console.log('Saving publish setting:', selectedSetting);
      
      if (!selectedSetting.examType) {
        alert('Please select an exam type');
        return;
      }

      if (selectedSetting.id) {
        await axios.put(getApiUrl(`/api/v1/exams/publish-settings/${selectedSetting.id}`), selectedSetting);
      } else {
        const response = await axios.post(getApiUrl('/api/v1/exams/publish-settings'), selectedSetting);
        if (!response.data.success) {
          alert(response.data.message);
          return;
        }
      }
      await fetchPublishSettings();
      setOpenDialog(false);
    } catch (error) {
      if (error.response?.status === 400) {
        alert(error.response.data.message);
      } else {
        alert('Error saving publish settings');
      }
      console.error('Error saving publish settings:', error);
    }
  };

  const handleBack = () => {
    navigate('/admin/exams/schedule');
  };

  return (
    <Box sx={{ 
      p: 3,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <IconButton 
          onClick={handleBack}
          sx={{ 
            mr: 2,
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: 'grey.100',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ 
          color: '#1a237e',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
        }}>
          Exam Result Publishing Settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {publishSettings.map((setting) => (
          <Grid item xs={12} md={6} key={setting.id}>
            <Card sx={{ 
              bgcolor: 'white',
              borderRadius: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {typeof setting.examType === 'string' ? setting.examType : setting.examType.name}
                  </Typography>
                  <IconButton onClick={() => handleEditSetting(setting)}>
                    <Settings />
                  </IconButton>
                </Box>
                <Typography color="textSecondary">
                  Publish Type: {setting.publishType === 'immediate' ? 'Immediate' : 'Scheduled'}
                </Typography>
                <Typography color="textSecondary">
                  Require All Subjects: {setting.requireAllSubjects ? 'Yes' : 'No'}
                </Typography>
                <Typography color="textSecondary">
                  Auto Publish: {setting.autoPublish ? 'Yes' : 'No'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        startIcon={<Schedule />}
        onClick={handleAddSetting}
        sx={{ mt: 3 }}
      >
        Add Publishing Setting
      </Button>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle>
          {selectedSetting.id ? 'Edit Publishing Setting' : 'Add Publishing Setting'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Exam Type Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth sx={{
                bgcolor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }}>
                <InputLabel>Exam Type</InputLabel>
                <Select
                  value={selectedSetting.examType}
                  onChange={(e) =>
                    setSelectedSetting({
                      ...selectedSetting,
                      examType: e.target.value,
                    })
                  }
                >
                  {Array.isArray(examTypes) && examTypes.length > 0 ? (
                    examTypes.map((exam) => (
                      <MenuItem key={exam.id} value={exam.id}>
                        {exam.examType}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No exam types available</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Class Selection Type */}
            <Grid item xs={12}>
              <FormControl fullWidth sx={{
                bgcolor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }}>
                <InputLabel>Class Selection</InputLabel>
                <Select
                  value={classSelectionType}
                  onChange={(e) => {
                    setClassSelectionType(e.target.value);
                    setSelectedClasses([]); // Reset selected classes
                    setSelectedSetting({
                      ...selectedSetting,
                      classWiseSchedule: [], // Reset class schedule
                    });
                  }}
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  <MenuItem value="individual">Select Individual Classes</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Individual Class Selection */}
            {classSelectionType === 'individual' && (
              <Grid item xs={12}>
                <FormControl fullWidth sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }}>
                  <InputLabel>Select Classes</InputLabel>
                  <Select
                    multiple
                    value={selectedClasses}
                    onChange={(e) => {
                      setSelectedClasses(e.target.value);
                      setSelectedSetting({
                        ...selectedSetting,
                        classWiseSchedule: e.target.value.map((classId) => ({
                          class: classId,
                          publishDateTime: null,
                        })),
                      });
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={classes.find((c) => c._id === value)?.name || value}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Publish Type Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth sx={{
                bgcolor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  }
                }
              }}>
                <InputLabel>Publish Type</InputLabel>
                <Select
                  value={selectedSetting.publishType}
                  onChange={(e) =>
                    setSelectedSetting({
                      ...selectedSetting,
                      publishType: e.target.value,
                    })
                  }
                >
                  <MenuItem value="immediate">Immediate</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>Require All Subjects</Typography>
                <Switch
                  checked={selectedSetting.requireAllSubjects}
                  onChange={(e) =>
                    setSelectedSetting({
                      ...selectedSetting,
                      requireAllSubjects: e.target.checked,
                    })
                  }
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>Auto Publish</Typography>
                <Switch
                  checked={selectedSetting.autoPublish}
                  onChange={(e) =>
                    setSelectedSetting({
                      ...selectedSetting,
                      autoPublish: e.target.checked,
                    })
                  }
                />
              </Box>
            </Grid>

            {selectedSetting.publishType === 'scheduled' && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Class-wise Publishing Schedule
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  {selectedSetting.classWiseSchedule.map((schedule, index) => (
                    <Box key={index} sx={{ mt: 2 }}>
                      <FormControl fullWidth sx={{ 
                        mb: 2,
                        bgcolor: 'white',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}>
                        <InputLabel>Class</InputLabel>
                        <Select
                          value={schedule.class}
                          onChange={(e) => {
                            const newSchedule = [...selectedSetting.classWiseSchedule];
                            newSchedule[index].class = e.target.value;
                            setSelectedSetting({
                              ...selectedSetting,
                              classWiseSchedule: newSchedule,
                            });
                          }}
                        >
                          {classes.map((cls) => (
                            <MenuItem key={cls._id} value={cls._id}>
                              {cls.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <DateTimePicker
                        label="Publishing Date & Time"
                        value={schedule.publishDateTime}
                        onChange={(newValue) => {
                          const newSchedule = [...selectedSetting.classWiseSchedule];
                          newSchedule[index].publishDateTime = newValue;
                          setSelectedSetting({
                            ...selectedSetting,
                            classWiseSchedule: newSchedule,
                          });
                        }}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                      />
                    </Box>
                  ))}
                </LocalizationProvider>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSetting} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PublishExam;
