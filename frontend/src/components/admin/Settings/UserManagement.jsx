import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getApiUrl, API_ENDPOINTS } from '../../../config/apiConfig';  // Fix import

const UserManagement = () => {
  const [users, setUsers] = useState([]); // Initialize users as an empty array
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const [error, setError] = useState(''); // Add error state

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Administrators' },
    { value: 'teacher', label: 'Teachers' },
    { value: 'student', label: 'Students' },
    { value: 'parent', label: 'Parents' }
  ];

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const queryParams = selectedRole !== 'all' ? `?role=${selectedRole}` : '';
        const url = getApiUrl(`/api/v1/users${queryParams}`);
        
        console.log('Fetching users from:', url);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || 'Failed to fetch users');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch users');
        }

        setUsers(data.data);
    } catch (error) {
        console.error('Error fetching users:', error);
        setAlert({
            severity: 'error',
            message: error.message || 'Failed to load users'
        });
    } finally {
        setLoading(false);
    }
};

  const handleAddEditUser = async (user = null) => {
    try {
      const token = localStorage.getItem('token');
      // Fix: Remove double api/v1
      const url = user 
        ? getApiUrl(`/v1/users/${user._id}`)
        : getApiUrl('/v1/users');

      const response = await fetch(url, {
        method: user ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user || {}) // Add your form data here
      });

      if (!response.ok) {
        throw new Error('Failed to save user');
      }

      await fetchUsers(); // Refresh the list
      setAlert({
        severity: 'success',
        message: `User ${user ? 'updated' : 'created'} successfully`
      });
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Error saving user'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      // Fix: Remove double api/v1
      const response = await fetch(getApiUrl(`/v1/users/${userId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchUsers(); // Refresh the list
      setAlert({
        severity: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Error deleting user'
      });
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">User Management</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Role</InputLabel>
              <Select
                value={selectedRole}
                label="Filter by Role"
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => handleAddEditUser(null)}
            >
              Add User
            </Button>
          </Box>
        </Box>

        {/* Table for displaying users */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.staffID || user.enrollmentNumber || 'N/A'}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.department || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status}
                        color={user.status === 'active' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button startIcon={<Edit />} onClick={() => handleAddEditUser(user)}>
                        Edit
                      </Button>
                      <Button startIcon={<Delete />} color="error" onClick={() => handleDeleteUser(user.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {alert && (
          <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert onClose={() => setAlert(null)} severity={alert.severity}>
              {alert.message}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default UserManagement;
