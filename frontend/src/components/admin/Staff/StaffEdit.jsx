import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Clear, SelectAll } from '@mui/icons-material';

// Enhanced field definitions with types and labels
const EDITABLE_FIELDS = [
  { key: '_id', label: 'ID', type: 'text', searchable: true },
  { key: 'name', label: 'Name', type: 'text', searchable: true },
  { key: 'staffID', label: 'Staff ID', type: 'text', searchable: true },
  { key: 'email', label: 'Email', type: 'email', searchable: true },
  { key: 'contact', label: 'Contact', type: 'text', searchable: true },
  { key: 'mobileNo', label: 'Mobile No', type: 'text', searchable: true },
  { key: 'department', label: 'Department', type: 'text', searchable: true },
  { key: 'designation', label: 'Designation', type: 'text', searchable: true },
  { key: 'address', label: 'Address', type: 'text', searchable: true },
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', searchable: true },
  { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], searchable: true },
  { key: 'religion', label: 'Religion', type: 'text', searchable: true },
  { key: 'category', label: 'Category', type: 'text', searchable: true },
  { key: 'qualifications', label: 'Qualifications', type: 'text', searchable: true },
  { key: 'joiningDate', label: 'Joining Date', type: 'date', searchable: true },
  { key: 'nationality', label: 'Nationality', type: 'text', searchable: true },
  { key: 'subject', label: 'Subject', type: 'text', searchable: true },
  { key: 'isActive', label: 'Active Status', type: 'boolean', searchable: true },
  { key: 'user', label: 'User', type: 'text', searchable: true },
  { key: 'roles', label: 'Roles', type: 'multiselect', searchable: true },
  { key: 'isClassTeacher', label: 'Class Teacher', type: 'boolean', searchable: true },
  { key: 'classTeacherFor', label: 'Class Teacher For', type: 'text', searchable: true },
  { key: 'primaryClass', label: 'Primary Class', type: 'text', searchable: true },
  { key: 'primarySection', label: 'Primary Section', type: 'text', searchable: true }
];

const StaffEdit = ({ open, onClose, onSave }) => {
  const [searchField, setSearchField] = useState('name');
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Get field definition by key
  const getFieldDef = (key) => EDITABLE_FIELDS.find(f => f.key === key);

  // Reset form
  const resetForm = () => {
    setSearchValue('');
    setStaffList([]);
    setSelectedStaffIds([]);
    setEditField('');
    setEditValue('');
    setPreviewMode(false);
  };

  // Search staff by field and value
  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setAlert({ type: 'warning', message: 'Please enter a search value.' });
      return;
    }
    
    setSearching(true);
    setStaffList([]);
    setSelectedStaffIds([]);
    
    try {
      const params = new URLSearchParams({ [searchField]: searchValue });
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/admin/staff?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch staff');
      
      const data = await res.json();
      const staffData = Array.isArray(data.data) ? data.data : [];
      
      setStaffList(staffData);
      
      if (staffData.length === 0) {
        setAlert({ type: 'info', message: 'No staff found matching the search criteria.' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setSearching(false);
    }
  };

  // Handle staff selection
  const handleStaffSelect = (id) => {
    setSelectedStaffIds(prev =>
      prev.includes(id) ? prev.filter(_id => _id !== id) : [...prev, id]
    );
  };

  // Select all staff
  const handleSelectAll = () => {
    setSelectedStaffIds(staffList.map(staff => staff._id));
  };

  // Deselect all staff
  const handleDeselectAll = () => {
    setSelectedStaffIds([]);
  };

  // Preview changes before applying
  const handlePreview = () => {
    if (!editField || editValue === '') {
      setAlert({ type: 'error', message: 'Please select a field and enter a value.' });
      return;
    }
    if (selectedStaffIds.length === 0) {
      setAlert({ type: 'error', message: 'Please select at least one staff member.' });
      return;
    }
    setPreviewMode(true);
  };

  // Bulk update selected staff
  const handleBulkUpdate = async () => {
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const updatePromises = selectedStaffIds.map(async (id) => {
        const response = await fetch(`/api/v1/admin/staff/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ [editField]: editValue })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update staff ${id}`);
        }
        
        return response.json();
      });
      
      await Promise.all(updatePromises);
      
      setAlert({ 
        type: 'success', 
        message: `Successfully updated ${selectedStaffIds.length} staff member(s).` 
      });
      
      if (onSave) onSave();
      resetForm();
      
    } catch (error) {
      setAlert({ type: 'error', message: `Bulk update failed: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  // Render field input based on type
  const renderEditInput = () => {
    if (!editField) return null;
    
    const fieldDef = getFieldDef(editField);
    
    switch (fieldDef?.type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!editValue}
                onChange={e => setEditValue(e.target.checked)}
              />
            }
            label={fieldDef.label}
          />
        );
      
      case 'select':
        return (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{fieldDef.label}</InputLabel>
            <Select
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              label={fieldDef.label}
            >
              {fieldDef.options?.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      
      case 'multiselect':
        return (
          <TextField
            label={`${fieldDef.label} (comma separated)`}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            helperText="Enter multiple values separated by commas"
          />
        );
      
      case 'date':
        return (
          <TextField
            label={fieldDef.label}
            type="date"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        );
      
      case 'email':
        return (
          <TextField
            label={fieldDef.label}
            type="email"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        );
      
      default:
        return (
          <TextField
            label={fieldDef.label}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        );
    }
  };

  // Render search input based on field type
  const renderSearchInput = () => {
    const fieldDef = getFieldDef(searchField);
    
    if (fieldDef?.type === 'boolean') {
      return (
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Value</InputLabel>
          <Select
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            label="Value"
          >
            <MenuItem value="true">True</MenuItem>
            <MenuItem value="false">False</MenuItem>
          </Select>
        </FormControl>
      );
    }
    
    if (fieldDef?.type === 'select') {
      return (
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Value</InputLabel>
          <Select
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            label="Value"
          >
            {fieldDef.options?.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    
    return (
      <TextField
        label="Search Value"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSearch()}
        sx={{ minWidth: 200 }}
        type={fieldDef?.type === 'date' ? 'date' : 'text'}
        InputLabelProps={fieldDef?.type === 'date' ? { shrink: true } : {}}
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Bulk Edit Staff
          <IconButton onClick={resetForm} size="small">
            <Clear />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* Search Section */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Step 1: Search for Staff
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Search Field</InputLabel>
              <Select
                value={searchField}
                onChange={e => setSearchField(e.target.value)}
                label="Search Field"
              >
                {EDITABLE_FIELDS.filter(f => f.searchable).map(field => (
                  <MenuItem key={field.key} value={field.key}>{field.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {renderSearchInput()}
            
            <Button 
              variant="contained" 
              onClick={handleSearch} 
              disabled={searching}
              sx={{ minWidth: 100 }}
            >
              {searching ? <CircularProgress size={20} /> : 'Search'}
            </Button>
          </Box>
        </Paper>

        {/* Staff Selection Section */}
        {staffList.length > 0 && (
          <Paper sx={{ mb: 2 }}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                Step 2: Select Staff to Edit ({staffList.length} found)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Select All">
                  <IconButton onClick={handleSelectAll} size="small">
                    <SelectAll />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <TableContainer sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Checkbox
                        checked={selectedStaffIds.length === staffList.length}
                        indeterminate={selectedStaffIds.length > 0 && selectedStaffIds.length < staffList.length}
                        onChange={e => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Staff ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staffList.map(staff => (
                    <TableRow key={staff._id} hover>
                      <TableCell>
                        <Checkbox
                          checked={selectedStaffIds.includes(staff._id)}
                          onChange={() => handleStaffSelect(staff._id)}
                        />
                      </TableCell>
                      <TableCell>{staff.name || 'N/A'}</TableCell>
                      <TableCell>{staff.staffID || 'N/A'}</TableCell>
                      <TableCell>{staff.email || 'N/A'}</TableCell>
                      <TableCell>{staff.department || 'N/A'}</TableCell>
                      <TableCell>{staff.designation || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={staff.isActive ? 'Active' : 'Inactive'} 
                          color={staff.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Edit Section */}
        {selectedStaffIds.length > 0 && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Step 3: Edit Field for Selected Staff ({selectedStaffIds.length} selected)
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'start', flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Field to Edit</InputLabel>
                <Select
                  value={editField}
                  onChange={e => {
                    setEditField(e.target.value);
                    setEditValue('');
                    setPreviewMode(false);
                  }}
                  label="Field to Edit"
                >
                  {EDITABLE_FIELDS.map(field => (
                    <MenuItem key={field.key} value={field.key}>{field.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ flex: 1, minWidth: 200 }}>
                {renderEditInput()}
              </Box>
            </Box>
            
            {editField && editValue !== '' && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handlePreview}
                  sx={{ mr: 2 }}
                >
                  Preview Changes
                </Button>
                <Button
                  variant="contained"
                  onClick={handleBulkUpdate}
                  disabled={saving}
                  color="primary"
                >
                  {saving ? <CircularProgress size={20} /> : 'Apply Changes'}
                </Button>
              </Box>
            )}
            
            {previewMode && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Preview:</strong> The field "{getFieldDef(editField)?.label}" will be set to "{editValue}" for {selectedStaffIds.length} staff member(s).
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={resetForm} disabled={saving}>
          Reset
        </Button>
      </DialogActions>
      
      <Snackbar
        open={!!alert}
        autoHideDuration={6000}
        onClose={() => setAlert(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {alert && (
          <Alert 
            onClose={() => setAlert(null)} 
            severity={alert.type} 
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        )}
      </Snackbar>
    </Dialog>
  );
};

export default StaffEdit;