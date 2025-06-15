import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Box
} from '@mui/material';
import { Download, Print } from '@mui/icons-material';

const DetailedSalaryDialog = ({ open, onClose, data, onDownload }) => {
  if (!data) return null;

  const { staffDetails, yearlyTotals, monthlyRecords } = data;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Salary Details - {staffDetails.name}</Typography>
        <Box>
          <Button startIcon={<Download />} onClick={onDownload} sx={{ mr: 1 }}>
            Download PDF
          </Button>
          <Button startIcon={<Print />} onClick={() => window.print()}>
            Print
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Staff Details Section */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Employee Details</Typography>
              <Typography>ID: {staffDetails.employeeId}</Typography>
              <Typography>Department: {staffDetails.department}</Typography>
              <Typography>Designation: {staffDetails.designation}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Employment Info</Typography>
              <Typography>Join Date: {new Date(staffDetails.joinDate).toLocaleDateString()}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Yearly Summary */}
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Yearly Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2">Total Basic Pay</Typography>
              <Typography>₹{yearlyTotals.totalBasicPay?.toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2">Total Allowances</Typography>
              <Typography>₹{yearlyTotals.totalAllowances?.toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2">Total Deductions</Typography>
              <Typography>₹{yearlyTotals.totalDeductions?.toLocaleString()}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2">Net Annual Pay</Typography>
              <Typography>₹{yearlyTotals.totalNetPay?.toLocaleString()}</Typography>
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
              {monthlyRecords.map((record) => (
                <TableRow key={`${record.year}-${record.month}`}>
                  <TableCell>{`${record.monthName} ${record.year}`}</TableCell>
                  <TableCell align="right">₹{record.basicPay?.toLocaleString()}</TableCell>
                  <TableCell align="right">₹{record.totalAllowances?.toLocaleString()}</TableCell>
                  <TableCell align="right">₹{record.totalDeductions?.toLocaleString()}</TableCell>
                  <TableCell align="right">₹{record.netPay?.toLocaleString()}</TableCell>
                  <TableCell>{record.status}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      startIcon={<Download />}
                      onClick={() => onDownload(record.month, record.year)}
                    >
                      Payslip
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailedSalaryDialog;
