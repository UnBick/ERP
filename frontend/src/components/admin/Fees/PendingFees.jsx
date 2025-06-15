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
  Button,
} from '@mui/material';

const PendingFees = () => {
  const [pendingFees, setPendingFees] = useState([]);
  const [lateFeePenalties, setLateFeePenalties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLateFees, setLoadingLateFees] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('studentName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [waivedFees, setWaivedFees] = useState([]);

  useEffect(() => {
    fetchPendingFees();
    fetchLateFeePenalties();
  }, []);

  const fetchPendingFees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/fees/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pending fees');
      }

      const data = await response.json();
      if (data.success) {
        setPendingFees(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch pending fees');
      }
    } catch (error) {
      console.error('Error fetching pending fees:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching pending fees'
      });
      setPendingFees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLateFeePenalties = async () => {
    setLoadingLateFees(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/fees/penalties', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch late fee penalties');
      }

      const data = await response.json();
      if (data.success) {
        setLateFeePenalties(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch late fee penalties');
      }
    } catch (error) {
      console.error('Error fetching late fee penalties:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching late fee penalties'
      });
      setLateFeePenalties([]);
    } finally {
      setLoadingLateFees(false);
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

  const computeLateFee = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    if (daysOverdue === 0) return 0;
    let penalty = 0;
    for (const rule of lateFeePenalties) {
      if (daysOverdue >= rule.minDuration && daysOverdue <= rule.maxDuration) {
        penalty = rule.penalty;
        break;
      }
    }
    return penalty;
  };

  const toggleWaiveFee = (feeId) => {
    if (waivedFees.includes(feeId)) {
      setWaivedFees(waivedFees.filter((id) => id !== feeId));
    } else {
      setWaivedFees([...waivedFees, feeId]);
    }
  };

  const toggleWaiveAll = () => {
    const filteredFeeIds = filteredFees.map((fee) => fee.id);
    const allWaived = filteredFeeIds.every((id) => waivedFees.includes(id));
    if (allWaived) {
      setWaivedFees(waivedFees.filter((id) => !filteredFeeIds.includes(id)));
    } else {
      const newWaived = Array.from(new Set([...waivedFees, ...filteredFeeIds]));
      setWaivedFees(newWaived);
    }
  };

  const filteredFees = pendingFees.filter((fee) =>
    fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fee.sectionName && fee.sectionName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedFees = [...filteredFees].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];
    if (order === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  const paginatedFees = sortedFees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Pending Fees
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <TextField
            label="Search by Student Name, Class, or Section"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: '300px', mb: { xs: 2, sm: 0 } }}
          />
          <Button variant="contained" onClick={toggleWaiveAll}>
            {filteredFees.every((fee) => waivedFees.includes(fee.id))
              ? 'Reset Late Fee Waiver for All'
              : 'Waive Late Fee for All'}
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
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
                    active={orderBy === 'sectionName'}
                    direction={orderBy === 'sectionName' ? order : 'asc'}
                    onClick={() => handleRequestSort('sectionName')}
                  >
                    Section
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'amountDue'}
                    direction={orderBy === 'amountDue' ? order : 'asc'}
                    onClick={() => handleRequestSort('amountDue')}
                  >
                    Amount Due
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'dueDate'}
                    direction={orderBy === 'dueDate' ? order : 'asc'}
                    onClick={() => handleRequestSort('dueDate')}
                  >
                    Due Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>Late Fee</TableCell>
                <TableCell>Waive Late Fee</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedFees.map((fee) => {
                const computedLateFee = computeLateFee(fee.dueDate);
                const displayLateFee = waivedFees.includes(fee.id) ? 0 : computedLateFee;
                return (
                  <TableRow key={fee.id}>
                    <TableCell>{fee.studentName}</TableCell>
                    <TableCell>{fee.className}</TableCell>
                    <TableCell>{fee.sectionName}</TableCell>
                    <TableCell>{fee.amountDue}</TableCell>
                    <TableCell>{fee.dueDate}</TableCell>
                    <TableCell>{displayLateFee}</TableCell>
                    <TableCell>
                      <Button variant="outlined" onClick={() => toggleWaiveFee(fee.id)}>
                        {waivedFees.includes(fee.id) ? 'Reset Waiver' : 'Waive'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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
          count={filteredFees.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />

        {alert && (
          <Snackbar open autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert onClose={() => setAlert(null)} severity="error">
              {alert.message}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default PendingFees;
