import React, { useState, useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Stack, Typography, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, FormControl, InputLabel, Select,
  Tabs, Tab, Checkbox, IconButton, Tooltip, Snackbar, Alert
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Refresh as PendingIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { getApiUrl } from '../../../config/apiConfig';


const AdmissionManagement = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState('pending');
  const [remarks, setRemarks] = useState('');
  const [bulkAction, setBulkAction] = useState('');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [currentTab]);

  const showAlert = (message, severity = 'error') => {
    setAlert({ message, severity });
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`/api/v1/admin/admissions/requests?status=${currentTab}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Fetched applications:', result);

      if (result.success) {
        setApplications(result.data.requests || []);
      } else {
        throw new Error(result.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`/api/v1/admin/admissions/requests/${applicationId}`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          remarks
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const result = await response.json();
      if (result.success) {
        showAlert('Status updated successfully', 'success');
        fetchApplications();
        setOpenDialog(false);
        setRemarks('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert(error.message);
    }
  };

  const handleBulkAction = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl('/api/v1/admin/admissions/bulk-update'), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationIds: selectedApplications,
          status: bulkAction
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }

      const result = await response.json();
      if (result.success) {
        fetchApplications();
        setSelectedApplications([]);
        setBulkAction('');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedApplications(applications.map(app => app._id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectApplication = (applicationId) => {
    setSelectedApplications(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      }
      return [...prev, applicationId];
    });
  };

  const renderApplicationDetails = () => (
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        Application Review - {selectedApp?.applicationId}
      </DialogTitle>
      <DialogContent>
        {selectedApp && (
          <Stack spacing={2}>
            <Typography variant="h6">Student Details</Typography>
            {/* Display all student details */}
            <Box>
              <Typography><strong>Name:</strong> {selectedApp.studentDetails.name}</Typography>
              <Typography><strong>Class:</strong> {selectedApp.studentDetails.classLevel}</Typography>
              {/* Add more student details */}
            </Box>

            <Typography variant="h6">Parent Details</Typography>
            {/* Display all parent details */}
            <Box>
              <Typography><strong>Father's Name:</strong> {selectedApp.parentDetails.fatherName}</Typography>
              <Typography><strong>Mother's Name:</strong> {selectedApp.parentDetails.motherName}</Typography>
              {/* Add more parent details */}
            </Box>

            <TextField
              label="Remarks"
              multiline
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        <Button 
          startIcon={<PendingIcon />}
          onClick={() => handleStatusUpdate(selectedApp._id, 'reviewing')}
          color="info"
        >
          Mark as Reviewing
        </Button>
        <Button 
          startIcon={<ApproveIcon />}
          onClick={() => handleStatusUpdate(selectedApp._id, 'approved')}
          color="success"
        >
          Approve
        </Button>
        <Button 
          startIcon={<RejectIcon />}
          onClick={() => handleStatusUpdate(selectedApp._id, 'rejected')}
          color="error"
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Admission Applications</Typography>
        
        {selectedApplications.length > 0 && (
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Bulk Action</InputLabel>
              <Select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                label="Bulk Action"
              >
                <MenuItem value="approved">Approve Selected</MenuItem>
                <MenuItem value="rejected">Reject Selected</MenuItem>
                <MenuItem value="reviewing">Mark as Reviewing</MenuItem>
              </Select>
            </FormControl>
            <Button 
              variant="contained" 
              onClick={handleBulkAction}
              disabled={!bulkAction}
            >
              Apply to Selected
            </Button>
          </Stack>
        )}
      </Stack>

      <Tabs
        value={currentTab}
        onChange={(e, newValue) => setCurrentTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab value="pending" label="Pending" />
        <Tab value="reviewing" label="Under Review" />
        <Tab value="approved" label="Approved" />
        <Tab value="rejected" label="Rejected" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  onChange={handleSelectAll}
                  checked={selectedApplications.length === applications.length}
                  indeterminate={
                    selectedApplications.length > 0 && 
                    selectedApplications.length < applications.length
                  }
                />
              </TableCell>
              <TableCell>Application ID</TableCell>
              <TableCell>Student Name</TableCell>
              <TableCell>Class Applied</TableCell>
              <TableCell>Submission Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No applications found</TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow 
                  key={app._id}
                  selected={selectedApplications.includes(app._id)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedApplications.includes(app._id)}
                      onChange={() => handleSelectApplication(app._id)}
                    />
                  </TableCell>
                  <TableCell>{app.applicationId}</TableCell>
                  <TableCell>{app.studentDetails.name}</TableCell>
                  <TableCell>{app.studentDetails.classLevel}</TableCell>
                  <TableCell>
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={app.status.toUpperCase()} 
                      color={
                        app.status === 'approved' ? 'success' :
                        app.status === 'rejected' ? 'error' :
                        app.status === 'reviewing' ? 'info' : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Review Application">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setSelectedApp(app);
                            setOpenDialog(true);
                          }}
                        >
                          Review
                        </Button>
                      </Tooltip>
                      <Tooltip title="Send Email">
                        <IconButton
                          size="small"
                          onClick={() => {/* Handle email sending */}}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {renderApplicationDetails()}

      <Snackbar
        open={!!alert}
        autoHideDuration={6000}
        onClose={() => setAlert(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {alert && (
          <Alert
            onClose={() => setAlert(null)}
            severity={alert.severity}
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default AdmissionManagement;