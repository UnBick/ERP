import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Container,
  Fade,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Assessment,
  Schedule as ScheduleIcon,
  Publish,
  ArrowForward,
  DashboardCustomize,
} from '@mui/icons-material';

const Schedule = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);

  // Memoized menu items with enhanced data
  const menuItems = useMemo(() => [
    {
      title: 'Manage Exam',
      icon: <Assessment sx={{ fontSize: 40 }} />,
      value: 'manage',
      path: '/admin/exams/manage-exam',
      description: 'Create, edit, and organize examination content',
      color: '#3498db',
      bgGradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
      count: 12, // Example count
    },
    {
      title: 'Schedule Exam',
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      value: 'schedule',
      path: '/admin/exams/schedule-exam',
      description: 'Set dates, times, and duration for exams',
      color: '#e74c3c',
      bgGradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
      count: 8,
    },
    {
      title: 'Publish Exam',
      icon: <Publish sx={{ fontSize: 40 }} />,
      value: 'publish',
      path: '/admin/exams/publish',
      description: 'Make exams available to students',
      color: '#2ecc71',
      bgGradient: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
      count: 5,
    }
  ], []);

  // Optimized handlers with useCallback
  const handleMenuSelect = useCallback((menu) => {
    setSelectedMenu(menu.value);
    // Add subtle delay for better UX
    setTimeout(() => {
      navigate(menu.path);
    }, 150);
  }, [navigate]);

  const handleMouseEnter = useCallback((value) => {
    setHoveredMenu(value);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredMenu(null);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,rgb(241, 228, 228) 0%,rgb(255, 255, 255) 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
        {/* Header Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
              }}
            >
              <DashboardCustomize />
            </Avatar>
            <Box>
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                sx={{
                  color: '#2c3e50',
                  fontWeight: 700,
                  mb: 0.5,
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Examination Schedule Management
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#7f8c8d',
                  fontWeight: 400,
                }}
              >
                Streamline your exam management process with our comprehensive tools
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Menu Cards Grid */}
        <Grid container spacing={3}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={item.value}>
              <Fade in timeout={300 + index * 100}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    background: selectedMenu === item.value 
                      ? item.bgGradient 
                      : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: selectedMenu === item.value 
                      ? '2px solid rgba(255, 255, 255, 0.3)' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 3,
                    transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                    transform: selectedMenu === item.value 
                      ? 'scale(1.02) translateY(-8px)' 
                      : hoveredMenu === item.value 
                        ? 'translateY(-12px) scale(1.01)' 
                        : 'translateY(0) scale(1)',
                    boxShadow: selectedMenu === item.value || hoveredMenu === item.value
                      ? '0 20px 40px rgba(0,0,0,0.15)'
                      : '0 8px 25px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: item.bgGradient,
                      opacity: selectedMenu === item.value ? 0 : 1,
                      transition: 'opacity 0.3s ease',
                    }
                  }}
                >
                  <CardActionArea
                    onClick={() => handleMenuSelect(item)}
                    onMouseEnter={() => handleMouseEnter(item.value)}
                    onMouseLeave={handleMouseLeave}
                    sx={{
                      height: '100%',
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Count Badge */}
                    <Chip
                      label={item.count}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: selectedMenu === item.value ? 'rgba(255,255,255,0.2)' : item.color,
                        color: selectedMenu === item.value ? 'white' : 'white',
                        fontWeight: 600,
                        minWidth: 32,
                      }}
                    />

                    {/* Icon */}
                    <Box
                      sx={{
                        color: selectedMenu === item.value ? 'white' : item.color,
                        mb: 2,
                        transition: 'all 0.3s ease',
                        transform: hoveredMenu === item.value ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {item.icon}
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        color: selectedMenu === item.value ? 'white' : '#2c3e50',
                        fontWeight: 600,
                        mb: 1,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {item.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: selectedMenu === item.value ? 'rgba(255,255,255,0.9)' : '#7f8c8d',
                        mb: 2,
                        lineHeight: 1.5,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {item.description}
                    </Typography>

                    {/* Action Button */}
                    <Tooltip title={`Navigate to ${item.title}`}>
                      <IconButton
                        size="small"
                        sx={{
                          bgcolor: selectedMenu === item.value ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                          color: selectedMenu === item.value ? 'white' : item.color,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: selectedMenu === item.value ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)',
                            transform: 'translateX(4px)',
                          }
                        }}
                      >
                        <ArrowForward fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActionArea>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Footer Info */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            p: 2,
            background: 'rgba(52, 152, 219, 0.3)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(118, 75, 206, 0.8)',
              fontWeight: 400,
            }}
          >
            Select an option above to begin managing your examination schedule
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Schedule;