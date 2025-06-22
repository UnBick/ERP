// src/components/student/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  LinearProgress
} from '@mui/material';
import {
  School,
  Assignment,
  Event,
  Assessment,
  Schedule,
  LibraryBooks,
  Notifications,
  AccountBalance,
  CalendarToday,
  EmojiEvents,
  Timeline,
  MenuBook,
  LocalActivity,
  NotificationsActive,
  Download,
  Refresh as RefreshIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { styled } from '@mui/material/styles';
import { getApiUrl } from '../../config/apiConfig';

// Add styled components
const DashboardWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh'
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

const GradientBanner = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
  color: 'white',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  backdropFilter: 'blur(10px)'
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  border: '4px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  padding: theme.spacing(1, 3),
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4]
  }
}));

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    profile: {},
    attendance: {},
    grades: [],
    assignments: [],
    timetable: [],
    announcements: [],
    upcomingExams: [],
    feeStatus: {},
    library: {},
    achievements: [],
    performanceStats: {
      overall: 0,
      totalSubjects: 0,
      activities: 0,
      monthlyProgress: []
    },
    notifications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
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
        throw new Error('Authentication token not found');
      }

      console.log('Fetching dashboard data...'); // Debug log

      // Updated endpoint
      const response = await fetch(getApiUrl('/api/v1/student/dashboard'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status); // Debug log

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Received dashboard data:', result.data); // Debug log

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }

      // Transform data before setting state
      const transformedData = {
        ...result.data,
        profile: {
          ...result.data.profile,
          name: result.data.profile.name || 'N/A',
          class: result.data.profile.class || 'N/A',
          section: result.data.profile.section || 'N/A',
          rollNo: result.data.profile.rollNo || '--',
          semester: result.data.profile.semester || 'N/A',
          rank: result.data.profile.rank || '--'
        },
        performanceStats: {
          ...result.data.performanceStats,
          overall: result.data.performanceStats?.overall || 0,
          totalSubjects: result.data.performanceStats?.totalSubjects || 0,
          activities: result.data.performanceStats?.activities || 0,
          monthlyProgress: result.data.performanceStats?.monthlyProgress || []
        }
      };

      console.log('Transformed data:', transformedData); // Debug log
      setDashboardData(transformedData);

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error.message || 'Failed to load dashboard data');
      setDashboardData({
        profile: {},
        performanceStats: {
          overall: 0,
          totalSubjects: 0,
          activities: 0,
          monthlyProgress: []
        },
        assignments: [],
        notifications: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      const token = localStorage.getItem('authToken');  // Changed from 'token' to 'authToken'
      if (!token) throw new Error('Authentication token not found');

      const response = await fetch(getApiUrl('/api/v1/student/dashboard'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to refresh data');

      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      setError('Failed to refresh dashboard data');
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

  const performanceData = dashboardData.performanceStats?.monthlyProgress || [];

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 2, backgroundColor: '#fff3f3' }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={fetchDashboardData}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <DashboardWrapper>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Student Dashboard
        </Typography>
        <Box>
          <StyledButton
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshData}
            sx={{ mr: 2 }}
          >
            Refresh
          </StyledButton>
          <StyledButton
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </StyledButton>
        </Box>
      </Box>

      {/* Profile Banner */}
      <GradientBanner elevation={0}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <StyledAvatar
              src={dashboardData.profile?.avatar}
            >
              {dashboardData.profile?.name?.charAt(0)}
            </StyledAvatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5" fontWeight="bold">
              {dashboardData.profile?.name || 'Student'}
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Class {dashboardData.profile?.class} | Section {dashboardData.profile?.section}
            </Typography>
            <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
              Roll No: {dashboardData.profile?.rollNo}
            </Typography>
          </Grid>
          <Grid item>
            <IconButton 
              color="inherit" 
              onClick={(e) => setNotificationAnchor(e.currentTarget)}
            >
              <Badge badgeContent={dashboardData.notifications.length} color="error">
                <NotificationsActive />
              </Badge>
            </IconButton>
          </Grid>
        </Grid>
      </GradientBanner>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {[
              { icon: <Timeline />, title: 'Overall Performance', value: `${dashboardData.performanceStats.overall}%`, color: '#4CAF50' },
              { icon: <Assignment />, title: 'Assignments', value: `${dashboardData.assignments.length} Pending`, color: '#2196F3' },
              { icon: <MenuBook />, title: 'Current Subjects', value: dashboardData.performanceStats.totalSubjects, color: '#9C27B0' },
              { icon: <LocalActivity />, title: 'Activities', value: dashboardData.performanceStats.activities, color: '#FF9800' }
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StyledCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {React.cloneElement(stat.icon, { 
                        sx: { fontSize: 40, color: stat.color, mr: 2 } 
                      })}
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Main Content Sections */}
        {/* ...existing grid items for Attendance, Grades, Fees, etc... */}

        {/* Performance Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer>
                  <LineChart
                    data={performanceData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={1}>
                {[
                  { icon: <Assignment />, label: 'Submit Assignment', link: '/student/assignments' },
                  { icon: <LibraryBooks />, label: 'Library Resources', link: '/student/library' },
                  { icon: <Assessment />, label: 'View Results', link: '/student/results' },
                  { icon: <Download />, label: 'Download Reports', link: '/student/reports' }
                ].map((action, index) => (
                  <Grid item xs={6} key={index}>
                    <Button
                      variant="outlined"
                      startIcon={action.icon}
                      component={Link}
                      to={action.link}
                      fullWidth
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      {action.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '300px',
          },
        }}
      >
        {dashboardData.notifications.length === 0 ? (
          <MenuItem>
            <ListItemText primary="No new notifications" />
          </MenuItem>
        ) : (
          dashboardData.notifications.map((notification, index) => (
            <MenuItem key={index} onClick={() => setNotificationAnchor(null)}>
              <ListItemIcon>
                <NotificationsActive color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={notification.title}
                secondary={notification.time}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </DashboardWrapper>
  );
};

export default StudentDashboard;