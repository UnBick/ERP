import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CardActionArea,
  Stack
} from '@mui/material';
import {
  List as ListIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Description as DocumentIcon,
  BusinessCenter,
  People,
  Assessment,
  School
} from '@mui/icons-material';

// Import components
import StaffTable from './StaffTable';
import StaffEdit from './StaffEdit';
import StaffNew from './StaffNew';
import StaffDocuments from './StaffDocuments';
import { getApiUrl } from '../../../config/apiConfig';


const StaffList = () => {
  const [selectedView, setSelectedView] = useState(null);
  const [statsData, setStatsData] = useState({
    totalStaff: 0,
    totalTeachers: 0,
    activeDepartments: 0,
    pendingRequests: 0,
    recentActivity: []
  });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/admin/staff/dashboard-stats'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Dashboard stats received:', data);
      if (data.success) {
        setStatsData({
          totalStaff: data.data.totalStaff || 0,
          totalTeachers: data.data.totalTeachers || 0,
          activeDepartments: data.data.activeDepartments || 0,
          pendingRequests: data.data.pendingRequests || 0,
          recentActivity: data.data.recentActivity || []
        });
      } else {
        throw new Error(data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStatsData({
        totalStaff: 0,
        totalTeachers: 0,
        activeDepartments: 0,
        pendingRequests: 0,
        recentActivity: []
      });
      setAlert({
        type: 'error',
        message: error.message || 'Failed to load dashboard statistics'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async (params = {}) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(getApiUrl(`/api/v1/admin/staff?${queryString}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch staff list');
      }
    } catch (error) {
      console.error('Error fetching staff list:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Failed to load staff list'
      });
      return null;
    }
  };

  const handleStaffAction = async (action, staffId, data = null) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      let response;
      switch (action) {
        case 'delete':
          config.method = 'DELETE';
          response = await fetch(getApiUrl(`/api/v1/admin/staff/${staffId}`), config);
          break;
        case 'update':
          config.method = 'PUT';
          config.body = JSON.stringify(data);
          response = await fetch(getApiUrl(`/api/v1/admin/staff/${staffId}`), config);
          break;
        case 'create':
          config.method = 'POST';
          config.body = JSON.stringify(data);
          response = await fetch(getApiUrl('/api/v1/admin/staff'), config);
          break;
        default:
          throw new Error('Invalid action');
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setAlert({
          type: 'success',
          message: result.message || 'Operation successful'
        });
        await fetchDashboardStats(); // Refresh stats after successful action
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error performing staff action:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Failed to perform action'
      });
    }
  };

  // Menu cards configuration (similar to StudentList)
  const menuCards = [
    {
      title: 'Staff List',
      description: 'View complete staff list with basic information and quick actions',
      icon: <ListIcon sx={{ fontSize: 40 }} />,
      borderColor: '#1976d2',
      view: 'list'
    },
    {
      title: 'Edit Staff',
      description: 'Edit individual staff details or perform bulk updates',
      icon: <EditIcon sx={{ fontSize: 40 }} />,
      borderColor: '#2e7d32',
      view: 'edit'
    },
    {
      title: 'New Staff',
      description: 'Add new staff members manually or import from file',
      icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
      borderColor: '#ed6c02',
      view: 'new'
    },
    {
      title: 'Staff Documents',
      description: 'Manage staff documents and credentials',
      icon: <DocumentIcon sx={{ fontSize: 40 }} />,
      borderColor: '#9c27b0',
      view: 'documents'
    }
  ];

  // Stats cards styled similarly to the StudentList stats cards
  const renderDashboard = () => (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={3}>
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
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Total Staff
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
            {loading ? '...' : statsData.totalStaff}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={3}>
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
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Teachers
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
            {loading ? '...' : statsData.totalTeachers}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={3}>
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
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Departments
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
            {loading ? '...' : statsData.activeDepartments}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Paper
          sx={{
            p: 2,
            textAlign: 'center',
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f44336, #e57373)',
            color: '#fff'
          }}
          elevation={3}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            Requests
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
            {loading ? '...' : statsData.pendingRequests}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderSelectedView = () => {
    const viewProps = {
      onBack: () => setSelectedView(null),
      onAction: handleStaffAction,
      fetchStaffList,
      setAlert
    };

    switch (selectedView) {
      case 'list':
        return <StaffTable {...viewProps} />;
      case 'edit':
        return <StaffEdit {...viewProps} />;
      case 'new':
        return <StaffNew {...viewProps} />;
      case 'documents':
        return <StaffDocuments {...viewProps} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {!selectedView ? (
        <>
          {renderDashboard()}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Staff Management
              </Typography>
            </Grid>
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
                          mb: 2,
                          color: card.borderColor
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
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => setSelectedView(card.view)}
                      sx={{ backgroundColor: card.borderColor }}
                    >
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Button variant="outlined" onClick={() => setSelectedView(null)} sx={{ mb: 2 }}>
            Back to Dashboard
          </Button>
          {renderSelectedView()}
        </Paper>
      )}
    </Box>
  );
};

export default StaffList;
