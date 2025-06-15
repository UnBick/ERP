import React, { useState, useEffect } from 'react';
import PredefineSyllabus from '../../UnbickSchooling/PredefineSyllabus';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  Grid,
  IconButton,
} from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon } from '@mui/icons-material';

const ParentPredefineSyllabus = () => {
  const [progressData, setProgressData] = useState({});
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [progressDialog, setProgressDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [statistics, setStatistics] = useState({});

  useEffect(() => {
    fetchChildren();
    if (selectedChild) {
      fetchProgress();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/parent/children');
      const data = await response.json();
      setChildren(data);
      if (data.length > 0) {
        setSelectedChild(data[0].id);
      }
    } catch (error) {
      setError('Failed to fetch children data');
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/parent/syllabus-progress/${selectedChild}`);
      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      setError('Failed to fetch progress data');
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildChange = (event, newValue) => {
    setSelectedChild(newValue);
  };

  const handleDialogOpen = () => {
    setProgressDialog(true);
  };

  const handleDialogClose = () => {
    setProgressDialog(false);
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch(`/api/parent/syllabus-export/${selectedChild}?format=pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `syllabus-progress-${selectedChild}.pdf`;
      a.click();
    } catch (error) {
      setError('Failed to export PDF');
    }
  };

  return (
    <Box>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Tabs value={selectedChild} onChange={handleChildChange}>
              {children.map((child) => (
                <Tab key={child.id} label={child.name} value={child.id} />
              ))}
            </Tabs>
            <Box>
              <Select value={filter} onChange={(e) => setFilter(e.target.value)} size="small">
                <MenuItem value="all">All Topics</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="inProgress">In Progress</MenuItem>
              </Select>
              <IconButton onClick={handleExportPDF}><DownloadIcon /></IconButton>
              <IconButton onClick={() => window.print()}><PrintIcon /></IconButton>
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h5">Syllabus Progress</Typography>
                  <LinearProgress variant="determinate" value={progressData.progress || 0} />
                  <Button onClick={handleDialogOpen}>View Details</Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Statistics</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography>Overall Progress: {statistics.overallProgress}%</Typography>
                    <Typography>Topics Completed: {statistics.completedTopics}</Typography>
                    <Typography>Time Spent: {statistics.timeSpent} hours</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Dialog open={progressDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
            <DialogTitle>Progress Details</DialogTitle>
            <DialogContent>
              {progressData.topics?.map((topic) => (
                <Box key={topic.id} sx={{ mb: 2 }}>
                  <Typography variant="h6">{topic.name}</Typography>
                  <LinearProgress variant="determinate" value={topic.progress} />
                  <Typography variant="body2">{topic.completedItems} / {topic.totalItems} items completed</Typography>
                </Box>
              ))}
            </DialogContent>
          </Dialog>
        </>
      )}
    </Box>
  );
};

export default ParentPredefineSyllabus;