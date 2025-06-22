// src/components/parent/StudentProgress.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from '@mui/material';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { Download as DownloadIcon } from '@mui/icons-material';
import { EXAM_TYPES } from '../../types/examTypes';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { styled } from '@mui/system';
import axios from 'axios';
import { getApiUrl } from '../../../config/apiConfig';


// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Add default chart data
const defaultChartData = {
  academic: {
    trendData: {
      labels: ['Term 1', 'Term 2', 'Term 3'],
      datasets: [{
        label: 'Average Score',
        data: [0, 0, 0],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    subjectData: {
      labels: ['Math', 'Science', 'English', 'History', 'Geography'],
      datasets: [{
        label: 'Performance',
        data: [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        pointBackgroundColor: 'rgb(75, 192, 192)',
      }]
    }
  },
  attendance: {
    data: {
      labels: ['Present', 'Absent', 'Late'],
      datasets: [{
        label: 'Attendance',
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)',
          'rgb(255, 206, 86)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  },
  behavioral: {
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Behavior Score',
        data: [0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  },
  examResults: [] // Add this line
};

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '400px',
  position: 'relative',
  marginBottom: theme.spacing(2)
}));

const StudentProgress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [progressHistory, setProgressHistory] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [view, setView] = useState('academic'); // academic, attendance, behavior
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedView, setSelectedView] = useState(0);
  const [progressData, setProgressData] = useState(defaultChartData);

  // Add chart instance refs
  const lineChartRef = React.useRef(null);
  const radarChartRef = React.useRef(null);
  const barChartRef = React.useRef(null);
  const behavioralChartRef = React.useRef(null);

  useEffect(() => {
    fetchStudentProgress();
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchProgressData();
    }
  }, [selectedChild, selectedPeriod]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      [lineChartRef, radarChartRef, barChartRef, behavioralChartRef].forEach(ref => {
        if (ref.current) {
          ref.current.destroy();
        }
      });
    };
  }, []);

  // Update chart cleanup when switching views
  useEffect(() => {
    return () => {
      if (selectedView === 0) {
        [lineChartRef, radarChartRef].forEach(ref => {
          if (ref.current) {
            ref.current.destroy();
          }
        });
      } else if (selectedView === 1 && barChartRef.current) {
        barChartRef.current.destroy();
      } else if (selectedView === 2 && behavioralChartRef.current) {
        behavioralChartRef.current.destroy();
      }
    };
  }, [selectedView]);

  const fetchStudentProgress = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/parent/studentProgress'));
      const data = await response.json();
      setProgress(data);
    } catch (error) {
      setAlert('Error fetching student progress');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        getApiUrl('/api/v1/parent/children'),
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success && response.data.data.length > 0) {
        setChildrenList(response.data.data);
        setSelectedChild(response.data.data[0].id);
      }
    } catch (error) {
      setAlert({
        show: true,
        severity: 'error',
        message: 'Error fetching children list'
      });
    }
  };

  const handleError = (error) => {
    setAlert({
      show: true,
      severity: 'error',
      message: typeof error === 'string' ? error : error.message || 'An error occurred'
    });
  };

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        getApiUrl(`/api/v1/parent/student-progress/${selectedChild}?period=${selectedPeriod}`),
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        
        // Transform and set the data
        setProgressData({
          academic: {
            trendData: data.academic.trendData,
            subjectData: data.academic.subjectData,
          },
          attendance: {
            data: data.attendance.data,
            options: {
              plugins: {
                legend: {
                  position: 'bottom'
                }
              },
              responsive: true,
              maintainAspectRatio: false
            }
          },
          behavioral: {
            data: data.behavioral.data,
            options: {
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100
                }
              }
            }
          },
          examResults: data.academic.examResults
        });
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (examId) => {
    try {
      const report = progressData.examResults.find(exam => exam.id === examId);
      if (report.status === 'published') {
        const response = await fetch(getApiUrl(`/api/v1/parent/progress-report/${examId}`));
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progress_report_${examId}.pdf`;
        a.click();
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Error downloading report' });
    }
  };

  const renderAcademicProgress = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6">Academic Performance Trend</Typography>
            <ChartContainer>
              <Line
                ref={lineChartRef}
                data={progressData.academic.trendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, max: 100 }
                  }
                }}
              />
            </ChartContainer>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">Subject-wise Performance</Typography>
            <ChartContainer>
              <Radar
                ref={radarChartRef}
                data={progressData.academic.subjectData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: {
                      beginAtZero: true,
                      max: 100
                    }
                  }
                }}
              />
            </ChartContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Exam Results Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">Examination Results</Typography>
            <Box sx={{ mt: 2 }}>
              {Array.isArray(progressData.examResults) && progressData.examResults.length > 0 ? (
                progressData.examResults.map(exam => (
                  <Box key={exam.id} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1">
                        {EXAM_TYPES[exam.type]?.name || exam.type}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Score: {exam.score} | Grade: {exam.grade}
                      </Typography>
                    </Box>
                    {exam.status === 'published' && (
                      <Button
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadReport(exam.id)}
                      >
                        Download Report
                      </Button>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No examination results available
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Add child selector component
  const renderChildSelector = () => (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel>Select Child</InputLabel>
      <Select
        value={selectedChild || ''}
        onChange={(e) => setSelectedChild(e.target.value)}
        label="Select Child"
      >
        {childrenList.map((child) => (
          <MenuItem key={child.id} value={child.id}>
            {child.name} - Class {child.class} {child.section}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {renderChildSelector()}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Student Progress Tracker</Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="current">Current Semester</MenuItem>
              <MenuItem value="previous">Previous Semester</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Tabs
          value={selectedView}
          onChange={(e, newValue) => setSelectedView(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Academic Progress" />
          <Tab label="Attendance" />
          <Tab label="Behavioral" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {selectedView === 0 && renderAcademicProgress()}
            {selectedView === 1 && (
              <ChartContainer>
                <Bar
                  ref={barChartRef}
                  data={progressData.attendance.data}
                  options={{
                    ...progressData.attendance.options,
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </ChartContainer>
            )}
            {selectedView === 2 && (
              <ChartContainer>
                <Line
                  ref={behavioralChartRef}
                  data={progressData.behavioral.data}
                  options={{
                    ...progressData.behavioral.options,
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </ChartContainer>
            )}
          </>
        )}

        {alert?.show && (
          <Snackbar 
            open={alert.show} 
            autoHideDuration={6000} 
            onClose={() => setAlert(null)}
          >
            <Alert 
              onClose={() => setAlert(null)} 
              severity={alert.severity}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default StudentProgress;