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
  Fade,
  Skeleton,
  Alert,
  Snackbar,
  Tooltip,
  Paper,
  Divider,
  FormControlLabel,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  Settings,
  Schedule,
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Info,
  CheckCircle,
  ErrorOutline,
  Warning,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { 
  Calendar, 
  Clock,  
  Plus, 
  Edit3, 
  ArrowLeft, 
  Check, 
  X,
  Users,
  BookOpen,
  Timer,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';
import { InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PublishExam = () => {
  const [examTypes, setExamTypes] = useState([]);
  const [publishSettings, setPublishSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState({
    examType: '',
    publishType: 'immediate',
    requireAllSubjects: true,
    classWiseSchedule: [],
    autoPublish: false,
  });
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [classSelectionType, setClassSelectionType] = useState('all');
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({});
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filterType, setFilterType] = useState('all'); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch exam types, classes, and publish settings from backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Exams
      const examRes = await fetch('/api/exams', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const examData = await examRes.json();
      setExamTypes(
        Array.isArray(examData.data)
          ? examData.data.map(e => ({
              id: e._id,
              examType: e.name || e.examType || '',
              shortName: e.shortName || ''
            }))
          : []
      );
      // Classes
      const classRes = await fetch('/api/exams/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const classData = await classRes.json();
      setClasses(Array.isArray(classData.data) ? classData.data : []);
      // Publish settings
      const publishRes = await fetch('/api/exam-publish-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const publishData = await publishRes.json();
      setPublishSettings(Array.isArray(publishData.data) ? publishData.data : []);
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load data' });
      setExamTypes([]);
      setClasses([]);
      setPublishSettings([]);
    } finally {
      setLoading(false);
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
    setSelectedClasses([]);
    setClassSelectionType('all');
    setIsDialogOpen(true);
  };

  const handleEditSetting = (setting) => {
    setSelectedSetting(setting);
    if (setting.classWiseSchedule && setting.classWiseSchedule.length > 0) {
      setClassSelectionType('individual');
      setSelectedClasses(setting.classWiseSchedule.map(s => s.class));
    } else {
      setClassSelectionType('all');
      setSelectedClasses([]);
    }
    setIsDialogOpen(true);
  };

  // Save to backend
  const handleSaveSetting = async () => {
    if (!selectedSetting.examType) {
      alert('Please select an exam type');
      return;
    }
    setSaving(true);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedSetting.id
        ? `/api/exam-publish-settings/${selectedSetting.id}`
        : '/api/exam-publish-settings';
      const method = selectedSetting.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedSetting)
      });
      if (!res.ok) throw new Error('Failed to save setting');
      // Refresh settings after save
      await fetchData();
      setIsDialogOpen(false);
    } catch (err) {
      setAlert({ type: 'error', message: 'Error saving setting' });
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleDeleteSetting = async (settingId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/exam-publish-settings/${settingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete setting');
      setAlert({ type: 'success', message: 'Setting deleted successfully' });
      // Refresh settings after delete
      await fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: 'Error deleting setting' });
    }
  };

  const handleBack = () => {
    navigate('/admin/exams/schedule');
  };

  const handleClassSelectionChange = (classIds) => {
    setSelectedClasses(classIds);
    setSelectedSetting({
      ...selectedSetting,
      classWiseSchedule: classIds.map((classId) => ({
        class: classId,
        publishDateTime: null,
      })),
    });
  };

  const addClassSchedule = () => {
    setSelectedSetting({
      ...selectedSetting,
      classWiseSchedule: [
        ...selectedSetting.classWiseSchedule,
        { class: '', publishDateTime: null },
      ],
    });
  };

  const removeClassSchedule = (index) => {
    const newSchedule = selectedSetting.classWiseSchedule.filter((_, i) => i !== index);
    setSelectedSetting({
      ...selectedSetting,
      classWiseSchedule: newSchedule,
    });
  };

  const updateClassSchedule = (index, field, value) => {
    const newSchedule = [...selectedSetting.classWiseSchedule];
    newSchedule[index][field] = value;
    setSelectedSetting({
      ...selectedSetting,
      classWiseSchedule: newSchedule,
    });
  };

  const getPublishStatusColor = (setting) => {
    if (setting.publishType === 'immediate') return 'success';
    if (setting.autoPublish) return 'info';
    return 'warning';
  };

  const getPublishStatusText = (setting) => {
    if (setting.publishType === 'immediate') return 'Immediate';
    if (setting.autoPublish) return 'Auto-Scheduled';
    return 'Manual Schedule';
  };

  const filteredSettings = publishSettings.filter(setting => {
    const examTypeMatch = setting.examType.toLowerCase().includes(searchTerm.toLowerCase());
    const classMatch = setting.classWiseSchedule.some(schedule => 
      classes.find(cls => cls._id === schedule.class)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return examTypeMatch || classMatch;
  }).filter(setting => {
    if (filterType === 'all') return true;
    if (filterType === 'immediate') return setting.publishType === 'immediate';
    if (filterType === 'scheduled') return setting.publishType === 'scheduled' && setting.classWiseSchedule.length > 0;
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} md={6} key={item}>
              <Skeleton variant="rectangular" width="100%" height={200} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 publish-exam-root">
      {/* Optionally show loading or alert */}
      {loading && <div className="text-center p-4">Loading...</div>}
      {alert && (
        <div className={`text-center p-4 ${alert.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {alert.message}
        </div>
      )}
      <Box sx={{ 
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Back to Exam Schedule">
                <IconButton 
                  onClick={handleBack}
                  sx={{ 
                    mr: 2,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #764ba2, #667eea)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ArrowLeft />
                </IconButton>
              </Tooltip>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5
                }}>
                  Exam Publishing Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure how and when exam results are published to students
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={handleAddSetting}
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(45deg, #764ba2, #667eea)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add Setting
            </Button>
          </Box>
        </Paper>

        {/* Search and Filter */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by exam type or class..."
                variant="outlined"
                size="medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by Publish Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  disabled={saving}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="immediate">Immediate</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Settings Grid */}
        <Grid container spacing={3}>
          {filteredSettings.map((setting, index) => (
            <Grid item xs={12} md={6} lg={4} key={setting.id}>
              <Fade in={true} timeout={300 + index * 100}>
                <Card sx={{ 
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {setting.examType}
                        </Typography>
                        <Chip
                          label={getPublishStatusText(setting)}
                          color={getPublishStatusColor(setting)}
                          size="small"
                          sx={{ mb: 2 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit Setting">
                          <IconButton
                            onClick={() => handleEditSetting(setting)}
                            size="small"
                            sx={{
                              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #45a049, #4CAF50)',
                              }
                            }}
                          >
                            <Edit3 fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Setting">
                          <IconButton
                            onClick={() => handleDeleteSetting(setting.id)}
                            size="small"
                            sx={{
                              background: 'linear-gradient(45deg, #f44336, #d32f2f)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #d32f2f, #f44336)',
                              }
                            }}
                          >
                            <X fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Clock fontSize="small" color="primary" />
                        <Typography variant="body2">
                          <strong>Publish Type:</strong> {setting.publishType === 'immediate' ? 'Immediate' : 'Scheduled'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {setting.requireAllSubjects ? (
                          <CheckCircle fontSize="small" color="success" />
                        ) : (
                          <AlertCircle fontSize="small" color="warning" />
                        )}
                        <Typography variant="body2">
                          <strong>Require All Subjects:</strong> {setting.requireAllSubjects ? 'Yes' : 'No'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {setting.autoPublish ? (
                          <Users fontSize="small" color="info" />
                        ) : (
                          <BookOpen fontSize="small" color="disabled" />
                        )}
                        <Typography variant="body2">
                          <strong>Auto Publish:</strong> {setting.autoPublish ? 'Yes' : 'No'}
                        </Typography>
                      </Box>

                      {setting.classWiseSchedule && setting.classWiseSchedule.length > 0 && (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                            Scheduled Classes: {setting.classWiseSchedule.length}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {setting.classWiseSchedule.slice(0, 3).map((schedule, idx) => (
                              <Chip
                                key={idx}
                                label={classes.find(c => c._id === schedule.class)?.name || 'Unknown'}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {setting.classWiseSchedule.length > 3 && (
                              <Chip
                                label={`+${setting.classWiseSchedule.length - 3} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Settings Dialog */}
        <Dialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 2,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: 'white',
            borderRadius: '12px 12px 0 0'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Settings />
              <Typography variant="h6">
                {selectedSetting.id ? 'Edit Publishing Setting' : 'Add Publishing Setting'}
              </Typography>
            </Box>
          </DialogTitle>

          {saving && <LinearProgress />}

          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Exam Type Selection */}
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  error={!!errors.examType}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }}
                >
                  <InputLabel>Exam Type *</InputLabel>
                  <Select
                    value={selectedSetting.examType}
                    onChange={(e) => {
                      setSelectedSetting({
                        ...selectedSetting,
                        examType: e.target.value,
                      });
                      setErrors({ ...errors, examType: '' });
                    }}
                    disabled={saving}
                  >
                    {examTypes.map((exam) => (
                      <MenuItem key={exam.id} value={exam.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>{exam.examType}</Typography>
                          <Chip label={exam.shortName} size="small" variant="outlined" />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.examType && (
                    <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                      {errors.examType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Publish Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Publish Type</InputLabel>
                  <Select
                    value={selectedSetting.publishType}
                    onChange={(e) =>
                      setSelectedSetting({
                        ...selectedSetting,
                        publishType: e.target.value,
                      })
                    }
                    disabled={saving}
                  >
                    <MenuItem value="immediate">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle fontSize="small" color="success" />
                        Immediate
                      </Box>
                    </MenuItem>
                    <MenuItem value="scheduled">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Clock fontSize="small" color="primary" />
                        Scheduled
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Class Selection Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Class Selection</InputLabel>
                  <Select
                    value={classSelectionType}
                    onChange={(e) => {
                      setClassSelectionType(e.target.value);
                      setSelectedClasses([]);
                      setSelectedSetting({
                        ...selectedSetting,
                        classWiseSchedule: [],
                      });
                    }}
                    disabled={saving}
                  >
                    <MenuItem value="all">All Classes</MenuItem>
                    <MenuItem value="individual">Select Individual Classes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Individual Class Selection */}
              {classSelectionType === 'individual' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Classes</InputLabel>
                    <Select
                      multiple
                      value={selectedClasses}
                      onChange={(e) => handleClassSelectionChange(e.target.value)}
                      disabled={saving}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={classes.find((c) => c._id === value)?.name || value}
                              size="small"
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

              {/* Settings Switches */}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="h6" gutterBottom>
                    Publishing Options
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedSetting.requireAllSubjects}
                          onChange={(e) =>
                            setSelectedSetting({
                              ...selectedSetting,
                              requireAllSubjects: e.target.checked,
                            })
                          }
                          disabled={saving}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>Require All Subjects</Typography>
                          <Tooltip title="Results will only be published when all subjects are completed">
                            <Info fontSize="small" color="info" />
                          </Tooltip>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={selectedSetting.autoPublish}
                          onChange={(e) =>
                            setSelectedSetting({
                              ...selectedSetting,
                              autoPublish: e.target.checked,
                            })
                          }
                          disabled={saving}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography>Auto Publish</Typography>
                          <Tooltip title="Automatically publish results when conditions are met">
                            <Info fontSize="small" color="info" />
                          </Tooltip>
                        </Box>
                      }
                    />
                  </Stack>
                </Paper>
              </Grid>

              {/* Scheduled Publishing */}
              {selectedSetting.publishType === 'scheduled' && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Class-wise Publishing Schedule</Typography>
                      <Button
                        onClick={addClassSchedule}
                        startIcon={<Plus />}
                        variant="outlined"
                        size="small"
                        disabled={saving}
                      >
                        Add Class
                      </Button>
                    </Box>
                    
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Stack spacing={2}>
                        {selectedSetting.classWiseSchedule.map((schedule, index) => (
                          <Paper key={index} sx={{ p: 2, border: '1px solid', borderColor: 'grey.300' }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} md={5}>
                                <FormControl fullWidth>
                                  <InputLabel>Class</InputLabel>
                                  <Select
                                    value={schedule.class}
                                    onChange={(e) => updateClassSchedule(index, 'class', e.target.value)}
                                    disabled={saving}
                                  >
                                    {classes.map((cls) => (
                                      <MenuItem key={cls._id} value={cls._id}>
                                        {cls.name}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} md={5}>
                                <DateTimePicker
                                  label="Publishing Date & Time"
                                  value={schedule.publishDateTime}
                                  onChange={(newValue) => updateClassSchedule(index, 'publishDateTime', newValue)}
                                  disabled={saving}
                                  renderInput={(params) => <TextField {...params} fullWidth />}
                                />
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <IconButton
                                  onClick={() => removeClassSchedule(index)}
                                  color="error"
                                  disabled={saving}
                                >
                                  <X />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Paper>
                        ))}
                      </Stack>
                    </LocalizationProvider>
                    
                    {errors.schedule && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {errors.schedule}
                      </Alert>
                    )}
                  </Paper>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setIsDialogOpen(false)} 
              disabled={saving}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSetting} 
              variant="contained" 
              disabled={saving}
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(45deg, #764ba2, #667eea)',
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Setting'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </div>
  );
};

export default PublishExam;