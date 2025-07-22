import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Skeleton,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ViewList as ViewListIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Import components
import StaffTable from './StaffTable';
import StaffEdit from './StaffEdit';
import StaffNew from './StaffNew';
import StaffDocuments from './StaffDocuments';

// Constants
const STAFF_VIEWS = {
  LIST: 'list',
  EDIT: 'edit',
  NEW: 'new',
  DOCUMENTS: 'documents'
};

const API_ENDPOINTS = {
  DASHBOARD_STATS: '/api/v1/admin/staff/dashboard-stats',
  STAFF_LIST: '/api/v1/admin/staff',
  STAFF_DETAIL: (id) => `/api/v1/admin/staff/${id}`
};

const StaffManagement = () => {
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
  const [statsLoading, setStatsLoading] = useState(false);

  // Utility function to get auth token
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
  }, []);

  // Utility function to create API headers
  const createHeaders = useCallback(() => {
    const token = getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, [getAuthToken]);

  // Error handler
  const handleError = useCallback((error, defaultMessage) => {
    console.error('Staff Management Error:', error);
    setAlert({
      type: 'error',
      message: error.message || defaultMessage
    });
  }, []);

  // Success handler
  const handleSuccess = useCallback((message) => {
    setAlert({
      type: 'success',
      message
    });
  }, []);

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.DASHBOARD_STATS, {
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStatsData(prevData => ({
          ...prevData,
          totalStaff: data.data.totalStaff || 0,
          totalTeachers: data.data.totalTeachers || 0,
          activeDepartments: data.data.activeDepartments || 0,
          pendingRequests: data.data.pendingRequests || 0,
          recentActivity: data.data.recentActivity || []
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard statistics');
      }
    } catch (error) {
      handleError(error, 'Failed to load dashboard statistics');
      // Reset to default values on error
      setStatsData({
        totalStaff: 0,
        totalTeachers: 0,
        activeDepartments: 0,
        pendingRequests: 0,
        recentActivity: []
      });
    } finally {
      setStatsLoading(false);
      setLoading(false);
    }
  }, [createHeaders, handleError]);

  // Fetch staff list
  const fetchStaffList = useCallback(async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${API_ENDPOINTS.STAFF_LIST}?${queryString}` : API_ENDPOINTS.STAFF_LIST;
      
      const response = await fetch(url, {
        headers: createHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch staff list: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch staff list');
      }
    } catch (error) {
      handleError(error, 'Failed to load staff list');
      return null;
    }
  }, [createHeaders, handleError]);

  // Handle staff actions (create, update, delete)
  const handleStaffAction = useCallback(async (action, staffId, data = null) => {
    try {
      const config = {
        headers: createHeaders()
      };

      let response;
      let url;
      let successMessage;

      switch (action) {
        case 'delete':
          url = API_ENDPOINTS.STAFF_DETAIL(staffId);
          response = await fetch(url, { ...config, method: 'DELETE' });
          successMessage = 'Staff member deleted successfully';
          break;

        case 'update':
          url = API_ENDPOINTS.STAFF_DETAIL(staffId);
          response = await fetch(url, {
            ...config,
            method: 'PUT',
            body: JSON.stringify(data)
          });
          successMessage = 'Staff member updated successfully';
          break;

        case 'create':
          url = API_ENDPOINTS.STAFF_LIST;
          response = await fetch(url, {
            ...config,
            method: 'POST',
            body: JSON.stringify(data)
          });
          successMessage = 'Staff member created successfully';
          break;

        default:
          throw new Error('Invalid action specified');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        handleSuccess(result.message || successMessage);
        await fetchDashboardStats(); // Refresh stats after successful action
        return result;
      } else {
        throw new Error(result.message || 'Operation failed');
      }
    } catch (error) {
      handleError(error, 'Failed to perform staff action');
      throw error;
    }
  }, [createHeaders, handleError, handleSuccess, fetchDashboardStats]);

  // Clear alert
  const clearAlert = useCallback(() => {
    setAlert(null);
  }, []);

  // Initialize component
  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Auto-clear alerts after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        clearAlert();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert, clearAlert]);

  // Dashboard statistics cards configuration
  const statisticsCards = [
    {
      title: 'Total Staff',
      value: statsData.totalStaff,
      icon: <PeopleIcon />,
      color: '#1976d2',
      description: 'All staff members'
    },
    {
      title: 'Teachers',
      value: statsData.totalTeachers,
      icon: <SchoolIcon />,
      color: '#2e7d32',
      description: 'Teaching staff'
    },
    {
      title: 'Departments',
      value: statsData.activeDepartments,
      icon: <BusinessIcon />,
      color: '#ed6c02',
      description: 'Active departments'
    },
    {
      title: 'Pending Requests',
      value: statsData.pendingRequests,
      icon: <AssignmentIcon />,
      color: statsData.pendingRequests > 0 ? '#d32f2f' : '#757575',
      description: 'Awaiting approval'
    }
  ];

  // Management sections configuration
  const managementSections = [
    {
      title: 'Staff Directory',
      description: 'View and manage all staff members with advanced filtering and search capabilities',
      icon: <ViewListIcon />,
      color: '#1976d2',
      view: STAFF_VIEWS.LIST,
      primary: true
    },
    {
      title: 'Edit Staff',
      description: 'Modify existing staff information and manage individual staff records',
      icon: <EditIcon />,
      color: '#2e7d32',
      view: STAFF_VIEWS.EDIT
    },
    {
      title: 'Add New Staff',
      description: 'Register new staff members with complete information and documentation',
      icon: <PersonAddIcon />,
      color: '#ed6c02',
      view: STAFF_VIEWS.NEW
    },
    {
      title: 'Documents',
      description: 'Manage staff documents, certifications, and official records',
      icon: <DocumentIcon />,
      color: '#9c27b0',
      view: STAFF_VIEWS.DOCUMENTS
    }
  ];

  // Render statistics dashboard
  const renderStatisticsDashboard = () => (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Staff Overview
        </Typography>
        <Tooltip title="Refresh Statistics">
          <IconButton 
            onClick={fetchDashboardStats} 
            disabled={statsLoading}
            size="small"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Grid container spacing={3}>
        {statisticsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: 120,
                borderLeft: `4px solid ${card.color}`,
                '&:hover': {
                  boxShadow: 2
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ color: card.color, mr: 1 }}>
                    {card.icon}
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {statsLoading ? (
                    <Skeleton width={50} height={40} />
                  ) : (
                    card.value
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );

  // Render management sections
  const renderManagementSections = () => (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Staff Management
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {managementSections.map((section) => (
          <Grid item xs={12} sm={6} md={3} key={section.view}>
            <Card 
              variant="outlined"
              sx={{ 
                height: 180,
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={() => setSelectedView(section.view)}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ color: section.color, mb: 2 }}>
                  {React.cloneElement(section.icon, { sx: { fontSize: 36 } })}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {section.description}
                </Typography>
                {section.primary && (
                  <Chip 
                    label="Primary" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );

  // Render selected view
  const renderSelectedView = () => {
    const viewProps = {
      onBack: () => setSelectedView(null),
      onAction: handleStaffAction,
      fetchStaffList,
      setAlert
    };

    switch (selectedView) {
      case STAFF_VIEWS.LIST:
        return <StaffTable {...viewProps} />;
      case STAFF_VIEWS.EDIT:
        return <StaffEdit {...viewProps} />;
      case STAFF_VIEWS.NEW:
        return <StaffNew {...viewProps} />;
      case STAFF_VIEWS.DOCUMENTS:
        return <StaffDocuments {...viewProps} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Alert Messages */}
      {alert && (
        <Alert 
          severity={alert.type} 
          onClose={clearAlert}
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
      )}

      {!selectedView ? (
        <>
          {/* Page Title */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Staff Management System
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive staff management and administration portal
            </Typography>
          </Box>

          {/* Statistics Dashboard */}
          {renderStatisticsDashboard()}

          {/* Management Sections */}
          {renderManagementSections()}
        </>
      ) : (
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => setSelectedView(null)}
              sx={{ mb: 2 }}
            >
              ← Back to Dashboard
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {managementSections.find(s => s.view === selectedView)?.title}
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {renderSelectedView()}
        </Paper>
      )}
    </Box>
  );
};

export default StaffManagement;