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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { getApiUrl } from '../../../../config/apiConfig';

const API_BASE_URL = getApiUrl();

const Salary = () => {
  const [salaries, setSalaries] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [salaryDetails, setSalaryDetails] = useState({
    staffId: '',
    basicPay: '',
    month: '',
    year: '',
  });

  const MONTHS = [
    { value: 'all', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  useEffect(() => {
    fetchSalaries();
    fetchStaff();
  }, []);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching salaries with token:', token); // Debug log

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/finance/payroll/salaries`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status); // Debug log
      
      const data = await response.json();
      console.log('Fetched salary data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch salaries');
      }

      if (data.success && Array.isArray(data.data)) {
        setSalaries(data.data);
      } else {
        console.error('Invalid data format:', data);
        setSalaries([]);
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching salaries:', error);
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to fetch salaries'
      });
      setSalaries([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Staff data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch staff');
      }

      if (data.success && Array.isArray(data.data)) {
        setStaff(data.data.map(s => ({
          _id: s._id,
          name: s.name,
          // Add other needed fields
        })));
      } else {
        throw new Error('Invalid staff data received');
      }
    } catch (error) {
      console.error('Staff fetch error:', error);
      setAlert({
        severity: 'error',
        message: `Failed to load staff: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAllowances = (basicPay) => ({
    hra: Math.floor(basicPay * 0.4),
    da: Math.floor(basicPay * 0.1),
    travelAllowance: 3000,
    medicalAllowance: 2000
  });

  const calculateDeductions = (basicPay) => ({
    pf: Math.floor(basicPay * 0.12),
    tds: Math.floor(basicPay * 0.1),
    professionalTax: 200
  });

  const calculateNetPay = (basicPay, allowances, deductions) => {
    const totalAllowances = Object.values(allowances).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
    return basicPay + totalAllowances - totalDeductions;
  };

  const handleAddEditSalary = async () => {
    if (!salaryDetails.staffId || !salaryDetails.basicPay || !salaryDetails.month || !salaryDetails.year) {
      setAlert({
        severity: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    const allowances = calculateAllowances(Number(salaryDetails.basicPay));
    const deductions = calculateDeductions(Number(salaryDetails.basicPay));
    const netPay = calculateNetPay(Number(salaryDetails.basicPay), allowances, deductions);

    const payrollData = {
      ...salaryDetails,
      allowances,
      deductions,
      totalAllowances: Object.values(allowances).reduce((a, b) => a + b, 0),
      totalDeductions: Object.values(deductions).reduce((a, b) => a + b, 0),
      netPay,
      status: 'pending',
      paymentMode: null,
      paymentDate: null,
      remarks: 'Generated through salary management',
      isActive: true
    };

    setLoading(true);
    try {
      console.log('Sending salary data:', payrollData);
      const token = localStorage.getItem('token');
      const method = selectedSalary ? 'PUT' : 'POST';
      const baseUrl = selectedSalary
        ? `${API_BASE_URL}/api/v1/admin/finance/payroll/salaries/${selectedSalary.id}`
        : `${API_BASE_URL}/api/v1/admin/finance/payroll/salaries`;

      if (salaryDetails.month === 'all') {
        const promises = MONTHS
          .filter(month => month.value !== 'all')
          .map(month => {
            const monthlySalary = {
              ...payrollData,
              month: month.value
            };

            return fetch(baseUrl, {
              method,
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(monthlySalary),
            });
          });

        await Promise.all(promises);
        setAlert({ severity: 'success', message: 'Salaries created for all months' });
      } else {
        const response = await fetch(baseUrl, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payrollData),
        });

        const data = await response.json();
        console.log('Salary save response:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Failed to save salary');
        }

        if (data.success) {
          setAlert({
            severity: 'success',
            message: data.message
          });
          await fetchSalaries(); // Refresh the list
          setOpenDialog(false);
          setSelectedSalary(null);
          setSalaryDetails({
            staffId: '',
            basicPay: '',
            month: '',
            year: '',
          });
        } else {
          throw new Error(data.message || 'Failed to save salary');
        }
      }
    } catch (error) {
      console.error('Error saving salary:', error);
      setAlert({
        severity: 'error',
        message: error.message || 'Error saving salary'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSalary = (salary) => {
    setSelectedSalary(salary);
    setSalaryDetails({
      staffId: salary.staffId,
      basicPay: salary.basicPay,
      month: salary.month,
      year: salary.year,
    });
    setOpenDialog(true);
  };

  const handleDeleteSalary = async (salaryId) => {
    if (window.confirm('Are you sure you want to delete this salary?')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/finance/payroll/salaries/${salaryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to delete salary');
        }

        const data = await response.json();
        if (data.success) {
          setAlert({ severity: 'success', message: data.message });
          await fetchSalaries();
        }
      } catch (error) {
        setAlert({ severity: 'error', message: error.message });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderDialogContent = () => (
    <DialogContent>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Staff</InputLabel>
        <Select
          value={salaryDetails.staffId}
          onChange={(e) => setSalaryDetails({ ...salaryDetails, staffId: e.target.value })}
        >
          {staff.map((member) => {
            // Ensure member._id exists and is unique
            const key = member._id || member.staffID;
            if (!key) {
              console.warn('Staff member missing ID:', member);
              return null;
            }
            return (
              <MenuItem 
                key={key} 
                value={key}
              >
                {member.name || `${member.personalInfo?.firstName} ${member.personalInfo?.lastName}`}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Basic Pay"
        type="number"
        value={salaryDetails.basicPay}
        onChange={(e) => setSalaryDetails({ ...salaryDetails, basicPay: e.target.value })}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Month</InputLabel>
        <Select
          value={salaryDetails.month}
          onChange={(e) => setSalaryDetails({ ...salaryDetails, month: e.target.value })}
        >
          {MONTHS.map((month) => (
            <MenuItem key={month.value} value={month.value}>
              {month.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Year"
        type="number"
        value={salaryDetails.year}
        onChange={(e) => setSalaryDetails({ ...salaryDetails, year: e.target.value })}
        sx={{ mb: 2 }}
      />
    </DialogContent>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Salary Management
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add Salary
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Staff Name</TableCell>
                <TableCell>Basic Pay</TableCell>
                <TableCell>HRA</TableCell>
                <TableCell>DA</TableCell>
                <TableCell>Travel</TableCell>
                <TableCell>Medical</TableCell>
                <TableCell>PF</TableCell>
                <TableCell>TDS</TableCell>
                <TableCell>Prof. Tax</TableCell>
                <TableCell>Net Pay</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : salaries.length > 0 ? (
                salaries.map((salary) => (
                  <TableRow key={salary._id}>
                    <TableCell>{salary.staffName}</TableCell>
                    <TableCell>₹{salary.basicPay?.toLocaleString()}</TableCell>
                    <TableCell>₹{salary.allowances?.hra?.toLocaleString()}</TableCell>
                    <TableCell>₹{salary.allowances?.da?.toLocaleString()}</TableCell>
                    <TableCell>₹{salary.allowances?.travelAllowance?.toLocaleString()}</TableCell>
                    <TableCell>₹{salary.allowances?.medicalAllowance?.toLocaleString()}</TableCell>
                    <TableCell>₹{salary.deductions?.pf?.toLocaleString()}</TableCell>
                    <TableCell>₹{salary.deductions?.tds?.toLocaleString()}</TableCell>
                    <TableCell>₹{salary.deductions?.professionalTax?.toLocaleString()}</TableCell>
                    <TableCell>₹{salary.netPay?.toLocaleString()}</TableCell>
                    <TableCell>{salary.status}</TableCell>
                    <TableCell>
                      <Button startIcon={<Edit />} onClick={() => handleEditSalary(salary)}>
                        Edit
                      </Button>
                      <Button startIcon={<Delete />} color="error" onClick={() => handleDeleteSalary(salary._id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    No salary records found
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
            <Alert 
              onClose={() => setAlert(null)} 
              severity={alert.severity || 'error'}
            >
              {typeof alert === 'string' ? alert : alert.message}
            </Alert>
          </Snackbar>
        )}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{selectedSalary ? 'Edit Salary' : 'Add New Salary'}</DialogTitle>
          {renderDialogContent()}
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddEditSalary} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Salary;
