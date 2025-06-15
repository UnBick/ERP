import React, { useState, useEffect } from 'react';
import {
    Card,
    Grid,
    Typography,
    Box,
    Button,
    Menu,
    MenuItem,
    Paper,
    Stack,
    Select,
    Snackbar,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText
} from '@mui/material';
import {
    People,
    School,
    AttachMoney,
    Assignment,
    Refresh,
    Print,
    Logout as LogoutIcon,
    ChevronRight
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useInbox } from '../../hooks/useInbox'; // Create this hook
import { format } from 'date-fns';

const DashboardCard = ({ title, value, icon, gradient }) => (
    <Card
        elevation={0}
        sx={{
            p: 3,
            height: '100%',
            background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
            backgroundImage: `
                linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
            `,
            borderRadius: '16px',
            transition: 'all 0.3s ease-in-out',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
                '& .card-icon': {
                    transform: 'scale(1.1) rotate(5deg)',
                }
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                zIndex: 1
            }
        }}
    >
        <Box sx={{ 
            color: 'white', 
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start'
            }}>
                <Typography variant="h6" sx={{ 
                    opacity: 0.9,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    mb: 2
                }}>
                    {title}
                </Typography>
                <Box className="card-icon" sx={{ 
                    transition: 'transform 0.3s ease-in-out',
                    opacity: 0.8
                }}>
                    {React.cloneElement(icon, { sx: { fontSize: 32 } })}
                </Box>
            </Box>
            <Typography variant="h4" sx={{ 
                fontWeight: 'bold',
                fontSize: '2.5rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                {value}
            </Typography>
        </Box>
    </Card>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        attendance: 0,
        feeCollection: 0,
        attendanceTrends: []
    });
    const [loading, setLoading] = useState(true);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [timeRange, setTimeRange] = useState('week');
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();
    const { logout: authLogout } = useAuth();
    const { messages, loading: inboxLoading } = useInbox(5); // Fetch latest 5 messages

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('No authentication token found');
            const response = await fetch(`/api/v1/admin/dashboard?range=${timeRange}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch dashboard data');
            const result = await response.json();
            if (!result.success) throw new Error('Failed to fetch dashboard data');
            setStats(result.data);
        } catch (error) {
            setAlert({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 300000);
        return () => clearInterval(interval);
    }, [timeRange]);

    const chartColors = {
        students: {
            stroke: '#4158D0',
            gradient: ['rgba(65, 88, 208, 0.2)', 'rgba(65, 88, 208, 0)']
        },
        teachers: {
            stroke: '#C850C0',
            gradient: ['rgba(200, 80, 192, 0.2)', 'rgba(200, 80, 192, 0)']
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                        p: 2,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}
                >
                    <Typography variant="subtitle2" color="text.secondary">
                        {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography
                            key={index}
                            variant="body2"
                            sx={{ color: entry.color, fontWeight: 'bold' }}
                        >
                            {entry.name}: {entry.value}%
                        </Typography>
                    ))}
                </Box>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    const dashboardCards = [
        {
            title: 'Total Students',
            value: stats.totalStudents,
            icon: <People />,
            gradient: {
                from: '#1A237E',
                to: '#4A148C'
            }
        },
        {
            title: 'Total Teachers',
            value: stats.totalTeachers,
            icon: <School />,
            gradient: {
                from: '#004D40',
                to: '#006064'
            }
        },
        {
            title: 'Fee Collection',
            value: `₹${stats.feeCollection}`,
            icon: <AttachMoney />,
            gradient: {
                from: '#B71C1C',
                to: '#880E4F'
            }
        },
        {
            title: 'Attendance Today',
            value: `${stats.attendance}%`,
            icon: <Assignment />,
            gradient: {
                from: '#311B92',
                to: '#1A237E'
            }
        }
    ];

    return (
        <Box sx={{
            p: { xs: 2, sm: 3 },
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            color: '#333' // Changed from white to dark text
        }}>
            {alert && (
                <Snackbar 
                    open 
                    autoHideDuration={6000} 
                    onClose={() => setAlert(null)}
                >
                    <Alert severity={alert.type}>{alert.message}</Alert>
                </Snackbar>
            )}
            {/* Header Section */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                mb: 4,
                gap: 2
            }}>
                <Typography variant="h4" sx={{
                    fontWeight: 800,
                    color: '#1976d2', // Changed from gradient to solid color
                }}>
                    Administrative Dashboard
                </Typography>
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2}
                    sx={{ width: { xs: '100%', md: 'auto' } }}
                >
                    <Button 
                        variant="contained" 
                        startIcon={<Refresh />} 
                        onClick={fetchDashboardData}
                        sx={{
                            background: 'linear-gradient(135deg, #4158D0 0%, #C850C0 100%)',
                            borderRadius: '8px',
                            textTransform: 'none',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #3148C0 0%, #B840B0 100%)',
                            }
                        }}
                    >
                        Refresh
                    </Button>
                    <Button startIcon={<Print />} onClick={(e) => setMenuAnchor(e.currentTarget)}>Export</Button>
                    <Button startIcon={<LogoutIcon />} onClick={authLogout} color="error">Logout</Button>
                </Stack>
            </Box>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
                <MenuItem>Export as PDF</MenuItem>
                <MenuItem>Export as Excel</MenuItem>
            </Menu>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {dashboardCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <DashboardCard {...card} />
                    </Grid>
                ))}
            </Grid>
            <Grid container spacing={3}>
                {/* Chart Section */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease-in-out',
                        height: '100%',
                        minHeight: 500,
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                        }
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" sx={{ 
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #4158D0, #C850C0)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Attendance Trends
                            </Typography>
                            <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} size="small" sx={{ minWidth: 120 }}>
                                <MenuItem value="week">Week</MenuItem>
                                <MenuItem value="month">Month</MenuItem>
                                <MenuItem value="year">Year</MenuItem>
                            </Select>
                        </Box>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={stats.attendanceTrends}>
                                <defs>
                                    {Object.entries(chartColors).map(([key, color]) => (
                                        <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={color.gradient[0]} />
                                            <stop offset="95%" stopColor={color.gradient[1]} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{
                                        paddingTop: '20px'
                                    }}
                                />
                                {Object.entries(chartColors).map(([key, color]) => (
                                    <Line
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        stroke={color.stroke}
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: color.stroke }}
                                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                                        fill={`url(#gradient-${key})`}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Inbox Section */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: '16px',
                        background: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease-in-out',
                        height: '100%',
                        minHeight: 500,
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                        }
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mb: 2 
                        }}>
                            <Typography variant="h6" sx={{
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #4158D0, #C850C0)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Recent Messages
                            </Typography>
                            <Link to="/admin/inbox" style={{ textDecoration: 'none' }}>
                                <Button 
                                    variant="text" 
                                    size="small"
                                    endIcon={<ChevronRight />}
                                >
                                    View All
                                </Button>
                            </Link>
                        </Box>

                        {inboxLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : (
                            <List sx={{ 
                                maxHeight: 400, 
                                overflowY: 'auto',
                                '&::-webkit-scrollbar': {
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                    borderRadius: '3px',
                                }
                            }}>
                                {messages.map((message) => (
                                    <ListItem
                                        key={message.id}
                                        sx={{
                                            borderRadius: '8px',
                                            mb: 1,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0,0,0,0.02)',
                                                transform: 'translateX(5px)'
                                            }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar
                                                src={message.sender.avatar}
                                                sx={{
                                                    bgcolor: message.read ? 'grey.300' : 'primary.main'
                                                }}
                                            >
                                                {message.sender.name.charAt(0)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center' 
                                                }}>
                                                    <Typography 
                                                        variant="subtitle2"
                                                        sx={{ 
                                                            fontWeight: message.read ? 400 : 600 
                                                        }}
                                                    >
                                                        {message.sender.name}
                                                    </Typography>
                                                    <Typography 
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {format(new Date(message.date), 'MMM d')}
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}
                                                >
                                                    {message.subject}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
