import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Checkbox,
  Stack,
  FormGroup,
  FormControlLabel,
  Switch,
  Menu,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  FilterList,
  Search,
} from '@mui/icons-material';
import { getApiUrl } from '../../../config/apiConfig';


const StaffTable = ({ onBack }) => {
  const [staff, setStaff] = useState([]); // Initial state is an empty array
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    status: 'all'
  });
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchStaff();
  }, [searchQuery]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`/api/v1/admin/staff?search=${searchQuery}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch staff list');
      }

      const data = await response.json();
      console.log('Staff data received:', data); // Debug log

      if (data.success && Array.isArray(data.data)) {
        setStaff(data.data);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching staff list'
      });
      setStaff([]); // Reset staff list on error
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(staff.map(s => s.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter(itemId => itemId !== id);
    }

    setSelected(newSelected);
  };

  const handleExport = async () => {
    try {
      const response = await fetch(getApiUrl('/api/admin/staff/export'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export staff list');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'staff_list.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error exporting staff list'
      });
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const renderFilterMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
    >
      <Box sx={{ p: 2, minWidth: 200 }}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={filters.status === 'active'}
                onChange={(e) => handleFilterChange('status', e.target.checked ? 'active' : 'all')}
              />
            }
            label="Active Only"
          />
          {/* Add more filters if needed */}
        </FormGroup>
      </Box>
    </Menu>
  );

  const formatId = (staffMember) => {
    return staffMember.staffID || staffMember._id?.substring(0, 8) || 'N/A';
  };

  const getContactNumber = (staffMember) => {
    return staffMember.contact || 
           staffMember.mobileNo || 
           staffMember.contactInfo?.phone ||
           staffMember.personalInfo?.phone || 
           'N/A';
  };

  return (
    <Box>
      <Button onClick={onBack} sx={{ mb: 2 }}>Back to Menu</Button>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
        <Button
          startIcon={<FilterList />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          Filters
        </Button>
      </Stack>

      {renderFilterMenu()}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selected.length === staff.length}
                  indeterminate={selected.length > 0 && selected.length < staff.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.length > 0 ? (
              staff.map((staffMember) => (
                <TableRow key={staffMember._id}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(staffMember._id)}
                      onChange={() => handleSelectOne(staffMember._id)}
                    />
                  </TableCell>
                  <TableCell>{formatId(staffMember)}</TableCell>
                  <TableCell>{staffMember.name}</TableCell>
                  <TableCell>{staffMember.department}</TableCell>
                  <TableCell>{staffMember.designation || staffMember.role || 'N/A'}</TableCell>
                  <TableCell>{getContactNumber(staffMember)}</TableCell>
                  <TableCell>
                    <Chip
                      label={staffMember.isActive ? 'Active' : 'Inactive'}
                      color={staffMember.isActive ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(staffMember._id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(staffMember._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">No staff data available</TableCell>
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
        <Snackbar
          open={!!alert}
          autoHideDuration={6000}
          onClose={() => setAlert(null)}
        >
          <Alert severity="error" onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default StaffTable;
