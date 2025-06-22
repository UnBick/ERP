import React, { useState } from 'react';
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
  Typography,
  CircularProgress
} from '@mui/material';
import { Download } from '@mui/icons-material';

// NOTE: Ensure that the parent component's onGenerate handler uses getApiUrl for API calls

const YearlyReport = ({ years, onGenerate, data, loading }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleGenerate = () => {
    onGenerate(null, selectedYear, 'yearly');
  };

  const calculateTotalSalary = () => {
    return data.reduce((sum, item) => sum + (item.totalYearlyPay || 0), 0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button 
          variant="contained" 
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Report'}
        </Button>
      </Box>

      {data.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Yearly Summary {selectedYear}
          </Typography>
          <Typography>
            Total Annual Payroll: ₹{calculateTotalSalary().toLocaleString()}
          </Typography>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Staff Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="right">Total Basic Pay</TableCell>
              <TableCell align="right">Total Allowances</TableCell>
              <TableCell align="right">Total Deductions</TableCell>
              <TableCell align="right">Net Annual Pay</TableCell>
              <TableCell align="right">Monthly Average</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((staff) => (
                <TableRow key={staff._id}>
                  <TableCell>{staff.staffName}</TableCell>
                  <TableCell>{staff.department}</TableCell>
                  <TableCell align="right">₹{staff.totalBasicPay?.toLocaleString()}</TableCell>
                  <TableCell align="right">₹{staff.totalAllowances?.toLocaleString()}</TableCell>
                  <TableCell align="right">₹{staff.totalDeductions?.toLocaleString()}</TableCell>
                  <TableCell align="right">₹{staff.totalYearlyPay?.toLocaleString()}</TableCell>
                  <TableCell align="right">₹{Math.round(staff.totalYearlyPay / 12)?.toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">No data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default YearlyReport;
