// src/components/parent/ParentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  IconButton,
  CircularProgress,
  Divider,
  Avatar
} from '@mui/material';
import {
  School,
  Payment,
  Notifications,
  Event,
  Assessment,
  MenuBook,
  CalendarToday,
  PeopleAlt,
  LocalLibrary,
  Assignment,
  Download,
  Message,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../../../config/apiConfig';


// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh'
}));

const InfoCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  borderRadius: theme.shape.borderRadius * 2
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  border: '1px solid rgba(255, 255, 255, 0.18)'
}));

const ParentDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    studentInfo: {},
    attendance: {},
    upcomingEvents: [],
    academicCalendar: [],
    notifications: [],
    fees: {},
    examSchedule: [],
    assignments: [],
    teacherRemarks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await axios.get(getApiUrl('/api/v1/parent/dashboard'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const { data } = response.data;
      console.log('Received dashboard data:', data);

      if (!data.children || data.children.length === 0) {
        setError('No children data found');
        return;
      }

      // Use the first child's data
      const firstChild = data.children[0];
      
      const transformedData = {
        studentInfo: firstChild.studentInfo,
        attendance: firstChild.attendance,
        fees: data.fees,
        upcomingEvents: data.upcomingEvents || [],
        assignments: firstChild.recentExams || [],
        teacherRemarks: data.teacherRemarks || []
      };

      console.log('Transformed data:', transformedData);
      setDashboardData(transformedData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(getApiUrl('/api/v1/auth/logout'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      localStorage.removeItem('authToken');
      
      if (response.ok) {
        console.log('Logged out successfully');
      }

      navigate('/login');

    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 2, backgroundColor: '#fff3f3' }}>
          <Typography color="error" variant="h6">
            {typeof error === 'string' ? error : error.message}
          </Typography>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
            }}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <DashboardContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Parent Dashboard
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Student Quick Info Card */}
        <Grid item xs={12}>
          <StyledPaper elevation={3} sx={{ 
            background: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
            color: 'white',
            mb: 3
          }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'white',
                  color: 'primary.main',
                  border: '4px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <PeopleAlt fontSize="large" />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h5" fontWeight="bold">
                  {dashboardData.studentInfo.name}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  Class: {dashboardData.studentInfo.class} | Section: {dashboardData.studentInfo.section}
                </Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                  Roll No: {dashboardData.studentInfo.rollNo}
                </Typography>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <School sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">Attendance</Typography>
              </Box>
              <Typography variant="h3" color="primary.main" align="center" fontWeight="bold">
                {dashboardData.attendance.percentage}%
              </Typography>
              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                Present: {dashboardData.attendance.present} | Absent: {dashboardData.attendance.absent}
              </Typography>
            </CardContent>
          </InfoCard>
        </Grid>

        {/* Fees Status */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Payment sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">Fees Status</Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                Due Amount: ₹{dashboardData.fees.dueAmount}
              </Typography>
              <Typography variant="body2" color={dashboardData.fees.status === 'Paid' ? 'success.main' : 'error.main'}>
                Status: {dashboardData.fees.status}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="small" 
                sx={{ mt: 1 }}
                onClick={() => window.location.href = '/parent/fees'}
              >
                Pay Now
              </Button>
            </CardContent>
          </InfoCard>
        </Grid>

        {/* Academic Performance */}
        <Grid item xs={12} md={4}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">Academic Performance</Typography>
              </Box>
              <Typography variant="body1" gutterBottom>
                Average Grade: {dashboardData.studentInfo.averageGrade}
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                endIcon={<Download />}
                onClick={() => window.location.href = '/parent/reports/download'}
              >
                Download Report
              </Button>
            </CardContent>
          </InfoCard>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Event sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">Upcoming Events</Typography>
              </Box>
              <List>
                {dashboardData.upcomingEvents.map((event, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CalendarToday color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={event.title}
                      secondary={new Date(event.date).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </InfoCard>
        </Grid>

        {/* Recent Assignments */}
        <Grid item xs={12} md={6}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assignment sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">Recent Assignments</Typography>
              </Box>
              <List>
                {dashboardData.assignments.map((assignment, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <MenuBook color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={assignment.title}
                      secondary={`Due: ${new Date(assignment.dueDate).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </InfoCard>
        </Grid>

        {/* Teacher Remarks */}
        <Grid item xs={12}>
          <InfoCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LocalLibrary sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h6">Teacher Remarks</Typography>
              </Box>
              <List>
                {dashboardData.teacherRemarks.map((remark, index) => (
                  <>
                    <ListItem key={index}>
                      <ListItemText 
                        primary={remark.subject}
                        secondary={
                          <>
                            <Typography component="span" variant="body2">
                              {remark.teacher} - {new Date(remark.date).toLocaleDateString()}
                            </Typography>
                            <Typography component="p" variant="body1">
                              {remark.comment}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.teacherRemarks.length - 1 && <Divider />}
                  </>
                ))}
              </List>
            </CardContent>
          </InfoCard>
        </Grid>

        {/* Quick Actions Section */}
        <Grid item xs={12}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {[
                { icon: <Assignment />, label: 'Assignments', link: '/parent/assignments' },
                { icon: <Assessment />, label: 'Progress Report', link: '/parent/reports' },
                { icon: <Payment />, label: 'Fee Payment', link: '/parent/fees' },
                { icon: <Message />, label: 'Messages', link: '/parent/messages' }
              ].map((action, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={action.icon}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      textTransform: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                    onClick={() => window.location.href = action.link}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </StyledPaper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default ParentDashboard;