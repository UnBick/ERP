import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
} from '@mui/material';
import {
  Assessment,
  Schedule as ScheduleIcon,
  Publish,
} from '@mui/icons-material';

const Schedule = () => {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState(null);

  const menuItems = [
    { 
      title: 'Manage Exam', 
      icon: <Assessment sx={{ fontSize: 40 }} />, 
      value: 'manage',
      path: '/admin/exams/manage-exam'  // Updated path
    },
    { 
      title: 'Schedule Exam', 
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />, 
      value: 'schedule',
      path: '/admin/exams/schedule-exam'
    },
    { 
      title: 'Publish Exam', 
      icon: <Publish sx={{ fontSize: 40 }} />, 
      value: 'publish',
      path: '/admin/exams/publish'
    }
  ];

  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu.value);
    navigate(menu.path);
  };

  return (
    <Box sx={{ 
      p: 3,
      background: 'linear-gradient(to right bottom, #f8f9fa, #e9ecef)',
      minHeight: '100vh'
    }}>
      <Typography variant="h5" 
        sx={{ 
          mb: 4, 
          color: '#2c3e50',
          fontWeight: 600,
          textShadow: '1px 1px 1px rgba(0,0,0,0.1)'
        }}>
        Examination Schedule Management
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.value}>
            <Card 
              sx={{ 
                height: '100%',
                bgcolor: selectedMenu === item.value ? 'primary.light' : 'white',
                transition: 'all 0.3s ease',
                transform: selectedMenu === item.value ? 'scale(1.02)' : 'scale(1)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                  bgcolor: selectedMenu === item.value ? 'primary.light' : '#f8f9fa'
                }
              }}
            >
              <CardActionArea 
                onClick={() => handleMenuSelect(item)}
                sx={{ 
                  height: '100%', 
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ 
                  color: selectedMenu === item.value ? 'primary.main' : '#34495e',
                  mb: 2,
                  transition: 'all 0.3s ease'
                }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" sx={{ 
                  color: selectedMenu === item.value ? 'primary.main' : '#2c3e50',
                  fontWeight: 500
                }}>
                  {item.title}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Schedule;