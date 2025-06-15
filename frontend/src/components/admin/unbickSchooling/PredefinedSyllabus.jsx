import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Add, Edit, Delete, CloudUpload } from '@mui/icons-material';
import QuestionBankManager from './QuestionBankManager';

const PredefinedSyllabus = ({ role }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [syllabuses, setSyllabuses] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    topics: '',
    file: null
  });

  useEffect(() => {
    fetchSyllabuses();
  }, []);

  const fetchSyllabuses = async () => {
    try {
      const response = await fetch('/api/v1/admin/syllabus', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSyllabuses(data.data);
      }
    } catch (error) {
      setError('Failed to fetch syllabuses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });

      const response = await fetch('/api/v1/admin/syllabus', {
        method: selectedSyllabus ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataObj
      });

      const data = await response.json();
      if (data.success) {
        setDialogOpen(false);
        fetchSyllabuses();
        resetForm();
      }
    } catch (error) {
      setError('Failed to save syllabus');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this syllabus?')) {
      try {
        const response = await fetch(`/api/v1/admin/syllabus/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          fetchSyllabuses();
        }
      } catch (error) {
        setError('Failed to delete syllabus');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      grade: '',
      topics: '',
      file: null
    });
    setSelectedSyllabus(null);
  };

  const handleEdit = (syllabus) => {
    setSelectedSyllabus(syllabus);
    setFormData({
      title: syllabus.title,
      description: syllabus.description,
      subject: syllabus.subject,
      grade: syllabus.grade,
      topics: syllabus.topics,
      file: syllabus.file
    });
    setDialogOpen(true);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Syllabus Management" />
          <Tab label="Question Bank" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Syllabus List</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => {
                    resetForm();
                    setDialogOpen(true);
                  }}
                >
                  Add New Syllabus
                </Button>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                {syllabuses.map((syllabus) => (
                  <Grid item xs={12} md={6} key={syllabus._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{syllabus.title}</Typography>
                        <Typography color="textSecondary" gutterBottom>
                          {syllabus.subject} - Grade {syllabus.grade}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {syllabus.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton onClick={() => handleEdit(syllabus)}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(syllabus._id)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                  <DialogTitle>
                    {selectedSyllabus ? 'Edit Syllabus' : 'Add New Syllabus'}
                  </DialogTitle>
                  <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                      <TextField
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        fullWidth
                      />
                      <TextField
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        multiline
                        rows={4}
                        fullWidth
                      />
                      <TextField
                        label="Subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        fullWidth
                      />
                      <TextField
                        label="Grade"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        required
                        fullWidth
                      />
                      <TextField
                        label="Topics (comma-separated)"
                        value={formData.topics}
                        onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                        fullWidth
                      />
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<CloudUpload />}
                      >
                        Upload Syllabus File
                        <input
                          type="file"
                          hidden
                          onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                        />
                      </Button>
                      {formData.file && (
                        <Typography variant="caption">
                          Selected file: {formData.file.name}
                        </Typography>
                      )}
                    </Box>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="contained">
                      {selectedSyllabus ? 'Update' : 'Create'}
                    </Button>
                  </DialogActions>
                </form>
              </Dialog>
            </>
          )}
          {activeTab === 1 && (
            <QuestionBankManager syllabuses={syllabuses} />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default PredefinedSyllabus;