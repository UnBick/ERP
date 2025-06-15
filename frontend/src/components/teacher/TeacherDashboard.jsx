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
    Divider,
    Avatar,
    Chip,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Schedule,
    Person,
    Class,
    Assignment,
    NotificationsActive,
    Event,
    Assessment,
    Message,
    School,
    LibraryBooks,
    PeopleAlt,
    Timer,
    Download,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useTeacher } from '../../context/TeacherContext';
import { styled } from '@mui/material/styles';

// Styled components
const DashboardContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
    },
}));

const StatsCard = styled(Card)(({ theme }) => ({
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
    },
}));

const NotificationItem = styled(ListItem)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const TeacherDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        upcomingClasses: [],
        pendingAssignments: [],
        recentNotifications: [],
        todayAttendance: null,
        studentStats: {},
        upcomingEvents: [],
        teacherInfo: {},
        activeStudents: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { teacherData, updateTeacherData } = useTeacher();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
            if (!token) {
                navigate('/login');
                return;
            }

            const [dashboardResponse, profileResponse] = await Promise.all([
                fetch('http://localhost:5000/api/v1/teacher/dashboard-data', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }),
                fetch('http://localhost:5000/api/v1/teacher/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
            ]);

            // Handle dashboard data
            const dashboardData = await dashboardResponse.json();
            const profileData = await profileResponse.json();

            if (dashboardData.success) {
                setDashboardData(prev => ({
                    ...prev,
                    ...dashboardData.data,
                    teacherInfo: {
                        ...prev.teacherInfo,
                        ...dashboardData.data.teacherInfo,
                        avatar: profileData.data?.avatar // Add avatar from profile data
                    }
                }));
            }

            // Update global teacher data with avatar
            if (profileData.success) {
                updateTeacherData(prev => ({
                    ...prev,
                    avatar: profileData.data?.avatar
                }));
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError(error.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Changed from 'token' to 'authToken'
            if (!token) {
                // If no token, just redirect to login
                navigate('/login');
                return;
            }

            const response = await fetch('http://localhost:5000/api/v1/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Always clear token and redirect on logout attempt
            localStorage.removeItem('authToken');
            
            if (response.ok) {
                setAlert({
                    severity: 'success',
                    message: 'Logged out successfully'
                });
            } else {
                setAlert({
                    severity: 'info',
                    message: 'Session ended'
                });
            }

            // Redirect after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 1000);

        } catch (error) {
            console.error('Logout error:', error);
            // Still logout even if there's an error
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

    return (
        <DashboardContainer>
            <HeaderContainer>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Teacher Dashboard
                </Typography>
                <ActionButton
                    variant="contained"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                >
                    Logout
                </ActionButton>
            </HeaderContainer>

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 2,
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                            fontSize: '1.5rem',
                        },
                    }}
                >
                    {error}
                    <Button 
                        size="small" 
                        sx={{ ml: 2 }}
                        onClick={() => {
                            setError(null);
                            fetchDashboardData();
                        }}
                    >
                        Retry
                    </Button>
                </Alert>
            )}

            <ProfileCard elevation={3}>
                <Grid container alignItems="center" spacing={3}>
                    <Grid item>
                        <Avatar
                            src={dashboardData.teacherInfo?.avatar}
                            sx={{
                                width: 72,
                                height: 72,
                                border: '3px solid',
                                borderColor: 'primary.main',
                                boxShadow: 3,
                                '& img': {
                                    objectFit: 'cover'
                                }
                            }}
                        >
                            {dashboardData.teacherInfo?.name?.charAt(0)}
                        </Avatar>
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h5">{dashboardData.teacherInfo.name}</Typography>
                        <Typography variant="body1">{dashboardData.teacherInfo.department}</Typography>
                        <Chip
                            icon={<Timer />}
                            label={dashboardData.todayAttendance ? "Present Today" : "Not Marked"}
                            color={dashboardData.todayAttendance ? "success" : "warning"}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            startIcon={<Person />}
                            component={Link}
                            to="/teacher/profile"
                        >
                            View Profile
                        </Button>
                    </Grid>
                </Grid>
            </ProfileCard>

            <Grid container spacing={3}>
                {/* Quick Stats */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2,
                                color: 'primary.main',
                            }}>
                                <School sx={{ mr: 1, fontSize: 32 }} />
                                <Typography variant="h6">Classes Today</Typography>
                            </Box>
                            <Typography variant="h3" color="primary" fontWeight="bold">
                                {dashboardData.upcomingClasses.length}
                            </Typography>
                        </CardContent>
                    </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2,
                                color: 'primary.main',
                            }}>
                                <PeopleAlt sx={{ mr: 1, fontSize: 32 }} />
                                <Typography variant="h6">Active Students</Typography>
                            </Box>
                            <Typography variant="h3" color="primary" fontWeight="bold">
                                {dashboardData.activeStudents}
                            </Typography>
                        </CardContent>
                    </StatsCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2,
                                color: 'primary.main',
                            }}>
                                <Event sx={{ mr: 1, fontSize: 32 }} />
                                <Typography variant="h6">Upcoming Events</Typography>
                            </Box>
                            <Typography variant="h3" color="primary" fontWeight="bold">
                                {dashboardData.upcomingEvents.length}
                            </Typography>
                        </CardContent>
                    </StatsCard>
                </Grid>

                {/* Today's Schedule */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Today's Schedule</Typography>
                                <Button
                                    component={Link}
                                    to="/teacher/class-schedule"
                                    endIcon={<Schedule />}
                                >
                                    Full Schedule
                                </Button>
                            </Box>
                            <List sx={{ 
                                '& .MuiListItem-root': { 
                                    borderRadius: 1,
                                    mb: 1,
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                },
                            }}>
                                {dashboardData.upcomingClasses.map((cls, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <Class color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={cls.subject}
                                            secondary={`${cls.time} - ${cls.class}`}
                                        />
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            component={Link}
                                            to={`/teacher/self/${cls.id}`}
                                        >
                                            Mark Attendance
                                        </Button>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Quick Actions
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <ActionButton
                                        fullWidth
                                        variant="contained"
                                        startIcon={<LibraryBooks />}
                                        component={Link}
                                        to="/teacher/assignments"
                                    >
                                        Manage Assignments
                                    </ActionButton>
                                </Grid>
                                <Grid item xs={6}>
                                    <ActionButton
                                        fullWidth
                                        variant="contained"
                                        startIcon={<Assessment />}
                                        component={Link}
                                        to="/teacher/grading"
                                    >
                                        Grade Students
                                    </ActionButton>
                                </Grid>
                                <Grid item xs={6}>
                                    <ActionButton
                                        fullWidth
                                        variant="contained"
                                        startIcon={<Message />}
                                        component={Link}
                                        to="/teacher/messages"
                                    >
                                        Send Messages
                                    </ActionButton>
                                </Grid>
                                <Grid item xs={6}>
                                    <ActionButton
                                        fullWidth
                                        variant="contained"
                                        startIcon={<Download />}
                                        component={Link}
                                        to="/teacher/reports"
                                    >
                                        Generate Reports
                                    </ActionButton>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Notifications */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Recent Notifications</Typography>
                                <IconButton color="primary">
                                    <NotificationsActive />
                                </IconButton>
                            </Box>
                            <List sx={{ 
                                '& .MuiDivider-root': { 
                                    my: 1,
                                },
                            }}>
                                {dashboardData.recentNotifications.map((notification, index) => (
                                    <React.Fragment key={index}>
                                        <NotificationItem>
                                            <ListItemText
                                                primary={notification.title}
                                                secondary={
                                                    <Box component="span">
                                                        <Box component="span" sx={{ display: 'block' }}>
                                                            {new Date(notification.date).toLocaleDateString()}
                                                        </Box>
                                                        <Box component="span" sx={{ display: 'block', color: 'text.secondary' }}>
                                                            {notification.message}
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </NotificationItem>
                                        {index < dashboardData.recentNotifications.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </DashboardContainer>
    );
};

export default TeacherDashboard;