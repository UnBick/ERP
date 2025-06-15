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
  TableSortLabel,
  CircularProgress,
  Snackbar,
  Alert,
  TablePagination,
  TextField,
} from '@mui/material';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('receiptNumber');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/fees/collections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch receipts');
      }

      const data = await response.json();
      if (data.success) {
        const formattedReceipts = data.data.map(receipt => ({
          id: receipt._id,
          receiptNumber: receipt.receiptNumber,
          studentName: receipt.student?.name || 'N/A',
          className: receipt.student?.class?.name || 'N/A',
          amount: receipt.amount,
          date: new Date(receipt.createdAt).toLocaleDateString(),
          status: receipt.status
        }));
        setReceipts(formattedReceipts);
      } else {
        throw new Error(data.message || 'Failed to fetch receipts');
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching receipts'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRequestSort = (property) => {
    const isAscending = orderBy === property && order === 'asc';
    setOrder(isAscending ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredReceipts = receipts.filter((receipt) =>
    receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (order === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  const paginatedReceipts = sortedReceipts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Receipts Management
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <TextField
            label="Search by Receipt Number, Student, or Class"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: '300px' }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'receiptNumber'}
                    direction={orderBy === 'receiptNumber' ? order : 'asc'}
                    onClick={() => handleRequestSort('receiptNumber')}
                  >
                    Receipt Number
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'studentName'}
                    direction={orderBy === 'studentName' ? order : 'asc'}
                    onClick={() => handleRequestSort('studentName')}
                  >
                    Student
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'className'}
                    direction={orderBy === 'className' ? order : 'asc'}
                    onClick={() => handleRequestSort('className')}
                  >
                    Class
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'amount'}
                    direction={orderBy === 'amount' ? order : 'asc'}
                    onClick={() => handleRequestSort('amount')}
                  >
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'date'}
                    direction={orderBy === 'date' ? order : 'asc'}
                    onClick={() => handleRequestSort('date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell>{receipt.receiptNumber}</TableCell>
                  <TableCell>{receipt.studentName}</TableCell>
                  <TableCell>{receipt.className}</TableCell>
                  <TableCell>{receipt.amount}</TableCell>
                  <TableCell>{receipt.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        <TablePagination
          component="div"
          count={filteredReceipts.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />

        {alert && (
          <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert onClose={() => setAlert(null)} severity={alert.type || 'error'}>
              {alert.message}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default Receipts;
