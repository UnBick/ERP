import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button
} from '@mui/material';
import {
  List as ListIcon,
  Edit as EditIcon,
  Sync as SyncIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

import StudentTable from './StudentTable';
import StudentEdit from './StudentEdit';
import StudentPromotion from './StudentPromotion';
import AddStudent from './AddStudent';

const DashboardStats = ({ stats }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={4}>
        <Paper 
          sx={{ 
            p: 2, 
            textAlign: 'center', 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #4e54c8, #8f94fb)',
            color: '#fff'
          }}
          elevation={3}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Students</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.totalStudents}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Paper 
          sx={{ 
            p: 2, 
            textAlign: 'center', 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #43cea2, #185a9d)',
            color: '#fff'
          }}
          elevation={3}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Active Students</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.activeStudents}</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Paper 
          sx={{ 
            p: 2, 
            textAlign: 'center', 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
            color: '#fff'
          }}
          elevation={3}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Sections</Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>{stats.sections}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

const StudentList = () => {
  const [selectedView, setSelectedView] = useState(null);
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    activeStudents: 0,
    sections: 0,
    recentActivity: []
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/v1/admin/students/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      console.log('Dashboard stats:', data);
      
      if (data.success) {
        setStatsData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsData({
        totalStudents: 0,
        activeStudents: 0,
        sections: 0,
        recentActivity: []
      });
    }
  };

  const menuCards = [
    {
      title: 'Student List',
      description: 'View complete student list with details and quick actions',
      icon: <ListIcon sx={{ fontSize: 40, color: '#4e54c8' }} />,
      borderColor: '#4e54c8',
      view: 'list'
    },
    {
      title: 'Edit Students',
      description: 'Edit individual student details or perform bulk updates',
      icon: <EditIcon sx={{ fontSize: 40, color: '#43cea2' }} />,
      borderColor: '#43cea2',
      view: 'edit'
    },
    {
      title: 'Student Promotion',
      description: 'Manage student promotions and class transitions',
      icon: <SyncIcon sx={{ fontSize: 40, color: '#ff7e5f' }} />,
      borderColor: '#ff7e5f',
      view: 'promotion'
    },
    {
      title: 'Add Student',
      description: 'Register a new student into the system',
      icon: <PersonAddIcon sx={{ fontSize: 40, color: '#d32f2f' }} />,
      borderColor: '#d32f2f',
      view: 'add'
    }
  ];

  const renderSelectedView = () => {
    switch (selectedView) {
      case 'list':
        return <StudentTable onBack={() => setSelectedView(null)} />;
      case 'edit':
        return <StudentEdit onBack={() => setSelectedView(null)} />;
      case 'promotion':
        return <StudentPromotion onBack={() => setSelectedView(null)} />;
      case 'add':
        return <AddStudent onBack={() => setSelectedView(null)} />;
      default:
        return null;
    }
  };

  return (
    
      <Box sx={{ width: '100%', p: 3 }}>
        {!selectedView ? (
          <>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Student Management
            </Typography>
            <DashboardStats stats={statsData} />
            <Grid container spacing={3}>
              {menuCards.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card.view}>
                  <Card
                    sx={{
                      height: 220,
                      borderRadius: 2,
                      boxShadow: 3,
                      borderLeft: `5px solid ${card.borderColor}`,
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'scale(1.02)'
                      }
                    }}
                  >
                    <CardActionArea onClick={() => setSelectedView(card.view)} sx={{ height: '100%' }}>
                      <CardContent 
                        sx={{ 
                          textAlign: 'center', 
                          p: 3, 
                          backgroundColor: '#fff', 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 2
                          }}
                        >
                          {card.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }} gutterBottom>
                          {card.title}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#666' }}>
                          {card.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => setSelectedView(null)}
              sx={{ mb: 2 }}
            >
              Back to Dashboard
            </Button>
            {renderSelectedView()}
          </Paper>
        )}
      </Box>
    
  );
};

export default StudentList;
