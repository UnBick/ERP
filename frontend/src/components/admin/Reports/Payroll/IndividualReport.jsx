import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
  Grid
} from '@mui/material';
import { payrollService } from '../../../../../src/services/payrollService';
import { Download } from '@mui/icons-material';
import { getApiUrl } from '../../../../config/apiConfig';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const IndividualReport = () => {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState(null);

  // Generate years array (current year and 4 previous years)
  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  // Fetch staff list on component mount
  useEffect(() => {
    const fetchStaffList = async () => {
      try {
        const response = await fetch(getApiUrl('/api/v1/admin/staff'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        console.log('Staff list response:', data); // Debug log
        if (data.success) {
          setStaffList(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching staff list:', error);
        setStaffList([]);
      }
    };

    fetchStaffList();
  }, []);

  const handleGenerateReport = async () => {
    if (!selectedStaff || !selectedYear) return;
    
    // Find the selected staff object to get additional details
    const selectedStaffObj = staffList.find(staff => staff._id === selectedStaff);
    console.log('Selected staff object:', selectedStaffObj); // Debug log
    console.log('Selected staff ID:', selectedStaff); // Debug log
    
    setLoading(true);
    setError(null);
    
    try {
      // Try different ID formats based on what your backend expects
      const staffId = selectedStaff; // Try _id first
      
      const url = getApiUrl(`/api/v1/admin/finance/payroll/reports/staff/${staffId}?year=${selectedYear}`);
      console.log('API URL:', url); // Debug log
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Response status:', response.status); // Debug log
      const result = await response.json();
      console.log('Staff report data:', result);

      if (result.success) {
        setReportData(result.data);
        setDialogOpen(true);
      } else {
        setReportData(null);
        setError(result.message || 'Staff not found');
        
        // If _id doesn't work, try with staffID or employeeId
        if (selectedStaffObj && (selectedStaffObj.staffID || selectedStaffObj.employeeId)) {
          console.log('Trying alternative ID...');
          const alternativeId = selectedStaffObj.staffID || selectedStaffObj.employeeId;
          const alternativeUrl = getApiUrl(`/api/v1/admin/finance/payroll/reports/staff/${alternativeId}?year=${selectedYear}`);
          
          const alternativeResponse = await fetch(alternativeUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const alternativeResult = await alternativeResponse.json();
          console.log('Alternative request result:', alternativeResult);
          
          if (alternativeResult.success) {
            setReportData(alternativeResult.data);
            setDialogOpen(true);
            setError(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching staff report:', error);
      setError('Error fetching staff report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (month = null) => {
    if (!selectedStaff || !selectedYear) return;
    try {
      await payrollService.downloadIndividualReport(selectedStaff, selectedYear, month);
    } catch (error) {
      console.error('Error downloading report:', error);
      // Add error notification here if needed
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Staff</InputLabel>
          <Select
            value={selectedStaff}
            onChange={(e) => {
              console.log('Selected staff ID:', e.target.value); // Debug log
              setSelectedStaff(e.target.value);
            }}
          >
            {Array.isArray(staffList) && staffList.map((staff) => (
              <MenuItem key={staff._id} value={staff._id}>
                {staff.name} ({staff.staffID || staff.employeeId || 'No ID'})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Select Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleGenerateReport}
          disabled={!selectedStaff || !selectedYear || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Report'}
        </Button>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Debug information - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="caption">
            Debug Info - Selected Staff ID: {selectedStaff} | 
            Total Staff: {staffList.length} |
            Staff List: {JSON.stringify(staffList.map(s => ({ id: s._id, name: s.name, staffID: s.staffID })))}
          </Typography>
        </Box>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Salary Details - {reportData?.staffDetails?.name || 'N/A'}
          </Typography>
          <Box>
            <Button startIcon={<Download />} onClick={handleDownloadPDF} sx={{ mr: 1 }}>
              Download PDF
            </Button>
          </Box>
        </DialogTitle>

        <DialogContent>
          {reportData && (
            <>
              {/* Staff Details Section */}
              <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Employee Details</Typography>
                    <Typography>ID: {reportData.staffDetails?.employeeId}</Typography>
                    <Typography>Department: {reportData.staffDetails?.department}</Typography>
                    <Typography>Designation: {reportData.staffDetails?.designation}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Employment Info</Typography>
                    <Typography>
                      Join Date: {new Date(reportData.staffDetails?.joinDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Yearly Summary */}
              <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Yearly Summary - {selectedYear}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Total Basic Pay</Typography>
                    <Typography>₹{reportData.yearlyTotals?.totalBasicPay?.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Total Allowances</Typography>
                    <Typography>₹{reportData.yearlyTotals?.totalAllowances?.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Total Deductions</Typography>
                    <Typography>₹{reportData.yearlyTotals?.totalDeductions?.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2">Net Annual Pay</Typography>
                    <Typography>₹{reportData.yearlyTotals?.totalNetPay?.toLocaleString()}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Monthly Records */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Month</TableCell>
                      <TableCell align="right">Basic Pay</TableCell>
                      <TableCell align="right">Allowances</TableCell>
                      <TableCell align="right">Deductions</TableCell>
                      <TableCell align="right">Net Pay</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.monthlyRecords?.map((record) => (
                      <TableRow key={`${record.year}-${record.month}`}>
                        <TableCell>{months[record.month - 1]}</TableCell>
                        <TableCell align="right">₹{record.basicPay?.toLocaleString()}</TableCell>
                        <TableCell align="right">₹{record.totalAllowances?.toLocaleString()}</TableCell>
                        <TableCell align="right">₹{record.totalDeductions?.toLocaleString()}</TableCell>
                        <TableCell align="right">₹{record.netPay?.toLocaleString()}</TableCell>
                        <TableCell>{record.status}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            startIcon={<Download />}
                            onClick={() => handleDownloadPDF(record.month)}
                          >
                            Payslip
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IndividualReport;