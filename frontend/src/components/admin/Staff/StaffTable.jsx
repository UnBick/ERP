import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Toolbar,
  Tooltip,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  DeleteOutline as DeleteOutlineIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  ContactPhone as ContactIcon,
} from '@mui/icons-material';

// Constants
const ITEMS_PER_PAGE = 10;
const DEBOUNCE_DELAY = 500;

// Custom hook for debounced search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// API service
const staffService = {
  async fetchStaff(params = {}) {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/v1/admin/staff${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch staff');
    }
    const data = await response.json();
    return {
      success: data.success,
      data: Array.isArray(data.data) ? data.data : [],
      total: Array.isArray(data.data) ? data.data.length : 0
    };
  },

  async getStaffById(staffId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/v1/admin/staff/${staffId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch staff details');
    }
    const data = await response.json();
    return { success: data.success, data: data.data };
  },

  async updateStaff(staffId, updates) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/v1/admin/staff/${staffId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      throw new Error('Failed to update staff');
    }
    return await response.json();
  },

  async deleteStaff(staffId) {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/v1/admin/staff/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete staff');
    }
    return await response.json();
  },

  async exportStaff(selectedIds = []) {
    const token = localStorage.getItem('token');
    const url = '/api/v1/admin/staff/export';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids: selectedIds })
    });
    if (!response.ok) {
      throw new Error('Failed to export staff');
    }
    return await response.blob();
  }
};

// Staff Details Dialog Component
const StaffDetailsDialog = ({ open, onClose, staffId }) => {
  const [staffDetails, setStaffDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (open && staffId) {
      fetchStaffDetails();
    }
  }, [open, staffId]);

  const fetchStaffDetails = async () => {
    setLoading(true);
    try {
      const response = await staffService.getStaffById(staffId);
      setStaffDetails(response.data);
    } catch (error) {
      console.error('Error fetching staff details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!staffDetails) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <PersonIcon color="primary" />
          <Typography variant="h6">Staff Details - {staffDetails.name}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Personal Info" icon={<PersonIcon />} />
            <Tab label="Professional Info" icon={<WorkIcon />} />
            <Tab label="Academic Info" icon={<SchoolIcon />} />
            <Tab label="Contact Info" icon={<ContactIcon />} />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  <Typography><strong>Name:</strong> {staffDetails.name}</Typography>
                  <Typography><strong>Staff ID:</strong> {staffDetails.staffID || 'N/A'}</Typography>
                  <Typography><strong>Gender:</strong> {staffDetails.gender || 'N/A'}</Typography>
                  <Typography><strong>Date of Birth:</strong> {formatDate(staffDetails.dateOfBirth)}</Typography>
                  <Typography><strong>Nationality:</strong> {staffDetails.nationality || 'N/A'}</Typography>
                  <Typography><strong>Religion:</strong> {staffDetails.religion || 'N/A'}</Typography>
                  <Typography><strong>Category:</strong> {staffDetails.category || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Address</Typography>
                  <Typography>{staffDetails.address || 'N/A'}</Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>Status</Typography>
                  <Chip
                    label={staffDetails.isActive ? 'Active' : 'Inactive'}
                    color={staffDetails.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Position Details</Typography>
                  <Typography><strong>Department:</strong> {staffDetails.department || 'N/A'}</Typography>
                  <Typography><strong>Designation:</strong> {staffDetails.designation || 'N/A'}</Typography>
                  <Typography><strong>Level:</strong> {staffDetails.level || 'N/A'}</Typography>
                  <Typography><strong>Subject:</strong> {staffDetails.subject || 'N/A'}</Typography>
                  <Typography><strong>Joining Date:</strong> {formatDate(staffDetails.joiningDate)}</Typography>
                  <Typography><strong>Qualifications:</strong> {staffDetails.qualifications || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Roles & Responsibilities</Typography>
                  <Typography><strong>Roles:</strong> {staffDetails.roles?.join(', ') || 'N/A'}</Typography>
                  <Typography><strong>Primary Class:</strong> {staffDetails.primaryClass || 'N/A'}</Typography>
                  <Typography><strong>Primary Section:</strong> {staffDetails.primarySection || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Academic Information</Typography>
                  <Typography><strong>Qualifications:</strong> {staffDetails.qualifications || 'N/A'}</Typography>
                  <Typography><strong>Subject Specialization:</strong> {staffDetails.subject || 'N/A'}</Typography>
                  <Typography><strong>Teaching Level:</strong> {staffDetails.level || 'N/A'}</Typography>
                  <Typography><strong>User ID:</strong> {staffDetails.user || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeTab === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Contact Information</Typography>
                  <Typography><strong>Email:</strong> {staffDetails.email || 'N/A'}</Typography>
                  <Typography><strong>Contact Number:</strong> {staffDetails.contact || 'N/A'}</Typography>
                  <Typography><strong>Mobile Number:</strong> {staffDetails.mobileNo || 'N/A'}</Typography>
                  <Typography><strong>Address:</strong> {staffDetails.address || 'N/A'}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

// Staff Edit Dialog Component
const StaffEditDialog = ({ open, onClose, staffId, onSave }) => {
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (open && staffId) {
      fetchStaffData();
    }
  }, [open, staffId]);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const response = await staffService.getStaffById(staffId);
      setStaffData(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await staffService.updateStaff(staffId, formData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating staff:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !staffData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Edit Staff - {staffData.name}</Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Staff ID"
              value={formData.staffID || ''}
              onChange={(e) => handleInputChange('staffID', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Number"
              value={formData.contact || ''}
              onChange={(e) => handleInputChange('contact', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Department"
              value={formData.department || ''}
              onChange={(e) => handleInputChange('department', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Designation"
              value={formData.designation || ''}
              onChange={(e) => handleInputChange('designation', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={formData.level || ''}
                onChange={(e) => handleInputChange('level', e.target.value)}
                label="Level"
              >
                <MenuItem value="Primary">Primary</MenuItem>
                <MenuItem value="Middle">Middle</MenuItem>
                <MenuItem value="Secondary">Secondary</MenuItem>
                <MenuItem value="Higher Secondary">Higher Secondary</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Subject"
              value={formData.subject || ''}
              onChange={(e) => handleInputChange('subject', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Qualifications"
              multiline
              rows={2}
              value={formData.qualifications || ''}
              onChange={(e) => handleInputChange('qualifications', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive || false}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={20} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Staff Table Component
const StaffTable = ({ onBack, onEdit }) => {
  // State management
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    status: 'all'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, staffId: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState({ open: false, staffId: null });
  const [editDialog, setEditDialog] = useState({ open: false, staffId: null });

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  // Fetch staff data
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearchQuery,
        page,
        limit: ITEMS_PER_PAGE,
        ...filters
      };

      const data = await staffService.fetchStaff(params);

      if (data.success && Array.isArray(data.data)) {
        setStaff(data.data);
        setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      showAlert('error', error.message || 'Error fetching staff list');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, page, filters]);

  // Effects
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, filters]);

  // Helper functions
  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  const closeAlert = () => {
    setAlert(null);
  };

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

  // Selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(staff.map(s => s._id));
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

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Action handlers
  const handleView = (staffId) => {
    setViewDialog({ open: true, staffId });
  };

  const handleEdit = (staffId) => {
    setEditDialog({ open: true, staffId });
  };

  const handleEditSave = () => {
    showAlert('success', 'Staff updated successfully');
    fetchStaff();
  };

  const handleDelete = (staffId) => {
    setDeleteDialog({ open: true, staffId });
  };

  const confirmDelete = async () => {
    try {
      await staffService.deleteStaff(deleteDialog.staffId);
      showAlert('success', 'Staff member deleted successfully');
      setSelected(selected.filter(id => id !== deleteDialog.staffId));
      fetchStaff();
    } catch (error) {
      showAlert('error', error.message || 'Error deleting staff member');
    } finally {
      setDeleteDialog({ open: false, staffId: null });
    }
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialog(true);
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selected.map(id => staffService.deleteStaff(id)));
      showAlert('success', `${selected.length} staff members deleted successfully`);
      setSelected([]);
      fetchStaff();
    } catch (error) {
      showAlert('error', 'Error deleting staff members');
    } finally {
      setBulkDeleteDialog(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await staffService.exportStaff(selected);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff_list_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showAlert('success', 'Staff list exported successfully');
    } catch (error) {
      showAlert('error', 'Error exporting staff list');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleRefresh = () => {
    fetchStaff();
  };

  // Memoized components
  const numSelected = selected.length;
  const rowCount = staff.length;

  const toolbar = useMemo(() => (
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        Staff Management
        {numSelected > 0 && (
          <Typography variant="caption" sx={{ ml: 1 }}>
            ({numSelected} selected)
          </Typography>
        )}
      </Typography>
      
      <Stack direction="row" spacing={2}>
        <TextField
          size="small"
          placeholder="Search staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ minWidth: 300 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Department</InputLabel>
          <Select
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
            label="Department"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="IT">IT</MenuItem>
            <MenuItem value="HR">HR</MenuItem>
            <MenuItem value="Finance">Finance</MenuItem>
            <MenuItem value="Operations">Operations</MenuItem>
            <MenuItem value="Mathematics">Mathematics</MenuItem>
            <MenuItem value="Science">Science</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Export">
          <IconButton onClick={handleExport} disabled={loading}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        
        {numSelected > 0 && (
          <Tooltip title="Delete Selected">
            <IconButton onClick={handleBulkDelete} color="error">
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Toolbar>
  ), [searchQuery, filters, numSelected, loading]);

  return (
    <Box sx={{ width: '100%', padding: 2 }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        {toolbar}
        
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={handleSelectAll}
                    inputProps={{
                      'aria-label': 'select all staff members',
                    }}
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
                staff.map((staffMember) => {
                  const isItemSelected = isSelected(staffMember._id);
                  const labelId = `enhanced-table-checkbox-${staffMember._id}`;

                  return (
                    <TableRow
                      hover
                      onClick={() => handleSelectOne(staffMember._id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={staffMember._id}
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row">
                        {formatId(staffMember)}
                      </TableCell>
                      <TableCell>{staffMember.name}</TableCell>
                      <TableCell>{staffMember.department}</TableCell>
                      <TableCell>{staffMember.designation || staffMember.role || 'N/A'}</TableCell>
                      <TableCell>{getContactNumber(staffMember)}</TableCell>
                      <TableCell>
                        <Chip
                          label={staffMember.isActive ? 'Active' : 'Inactive'}
                          color={staffMember.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(staffMember._id);
                            }}
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(staffMember._id);
                            }}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(staffMember._id);
                            }}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No staff found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Box>
        {/* View Dialog */}
        {viewDialog.open && (
          <StaffDetailsDialog
            open={viewDialog.open}
            onClose={() => setViewDialog({ open: false, staffId: null })}
            staffId={viewDialog.staffId}
          />
        )}
        {/* Edit Dialog */}
        {editDialog.open && (
          <StaffEditDialog
            open={editDialog.open}
            onClose={() => setEditDialog({ open: false, staffId: null })}
            staffId={editDialog.staffId}
            onSave={handleEditSave}
          />
        )}
        {/* Delete Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, staffId: null })}
        >
          <DialogTitle>Delete Staff Member</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this staff member?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, staffId: null })}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
        {/* Bulk Delete Dialog */}
        <Dialog
          open={bulkDeleteDialog}
          onClose={() => setBulkDeleteDialog(false)}
        >
          <DialogTitle>Delete Selected Staff</DialogTitle>
          <DialogContent>
            Are you sure you want to delete {selected.length} selected staff members?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkDeleteDialog(false)}>Cancel</Button>
            <Button onClick={confirmBulkDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
        {/* Snackbar for alerts */}
        <Snackbar
          open={!!alert}
          autoHideDuration={4000}
          onClose={closeAlert}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          {alert && (
            <Alert severity={alert.type} onClose={closeAlert} sx={{ width: '100%' }}>
              {alert.message}
            </Alert>
          )}
        </Snackbar>
      </Paper>
    </Box>
  );
}

export default StaffTable;