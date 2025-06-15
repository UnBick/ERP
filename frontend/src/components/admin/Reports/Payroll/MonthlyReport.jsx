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
  CircularProgress,
  ButtonGroup
} from '@mui/material';
import { Download, PictureAsPdf, TableChart } from '@mui/icons-material';

const MonthlyReport = ({ months, years, onGenerate, data, loading, onDownload }) => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleGenerate = () => {
    onGenerate(selectedMonth, selectedYear, 'monthly');
  };

  const handleDownload = (format) => {
    onDownload(selectedMonth, selectedYear, 'monthly', format);
  };

  const calculateTotalSalary = () => {
    return data.reduce((sum, item) => sum + (item.netPay || 0), 0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map(month => (
              <MenuItem key={month} value={month}>{month}</MenuItem>
            ))}
          </Select>
        </FormControl>

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
          disabled={!selectedMonth || !selectedYear || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Generate Report'}
        </Button>

        {data.length > 0 && (
          <ButtonGroup variant="outlined">
            <Button
              startIcon={<PictureAsPdf />}
              onClick={() => handleDownload('pdf')}
            >
              PDF
            </Button>
            <Button
              startIcon={<TableChart />}
              onClick={() => handleDownload('excel')}
            >
              Excel
            </Button>
          </ButtonGroup>
        )}
      </Box>

      {data.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            Total Salary: ₹{calculateTotalSalary().toLocaleString()}
          </Typography>
        </Box>
      )}

      <TableContainer component={Paper}>
        {/* ...existing table structure... */}
      </TableContainer>
    </Box>
  );
};

export default MonthlyReport;
