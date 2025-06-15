// src/components/admin/Fees/FeeCollection.jsx
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
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import FeeCollectionDialog from './FeeCollectionDialog';

const FeeCollection = () => {
  const [feeCollections, setFeeCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  useEffect(() => {
    fetchFeeCollections();
  }, []);

  const fetchFeeCollections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/fees/collections', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      // Log the raw response for debugging
      const text = await response.text();
      console.log('Raw API Response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        throw new Error('Server returned invalid JSON');
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setFeeCollections(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch fee collections');
      }
    } catch (error) {
      console.error('Error fetching fee collections:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error fetching fee collections'
      });
      setFeeCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEditFeeCollection = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedCollection 
        ? `/api/v1/admin/fees/collections/${selectedCollection.id}`
        : '/api/v1/admin/fees/collections';

      const response = await fetch(url, {
        method: selectedCollection ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save fee collection');
      }

      const data = await response.json();
      if (data.success) {
        setAlert({
          type: 'success',
          message: `Fee collection ${selectedCollection ? 'updated' : 'added'} successfully`
        });
        await fetchFeeCollections();
        handleDialogClose();
      } else {
        throw new Error(data.message || 'Failed to save fee collection');
      }
    } catch (error) {
      console.error('Error saving fee collection:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error saving fee collection'
      });
    }
  };

  const handleDeleteFeeCollection = async (feeCollectionId) => {
    if (!window.confirm('Are you sure you want to delete this fee collection?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/admin/fees/collections/${feeCollectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete fee collection');
      }

      const data = await response.json();
      if (data.success) {
        setAlert({
          type: 'success',
          message: 'Fee collection deleted successfully'
        });
        await fetchFeeCollections();
      }
    } catch (error) {
      console.error('Error deleting fee collection:', error);
      setAlert({
        type: 'error',
        message: error.message || 'Error deleting fee collection'
      });
    }
  };

  const handleDialogOpen = (collection = null) => {
    setSelectedCollection(collection);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setSelectedCollection(null);
    setOpenDialog(false);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Fee Collection Management
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleDialogOpen()}
          >
            Add Fee Collection
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feeCollections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell>{collection.studentName}</TableCell>
                  <TableCell>{collection.className}</TableCell>
                  <TableCell>{collection.amount}</TableCell>
                  <TableCell>{new Date(collection.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button 
                      startIcon={<Edit />} 
                      onClick={() => handleDialogOpen(collection)}
                    >
                      Edit
                    </Button>
                    <Button 
                      startIcon={<Delete />} 
                      color="error" 
                      onClick={() => handleDeleteFeeCollection(collection.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
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

        {alert && (
          <Snackbar 
            open={!!alert} 
            autoHideDuration={6000} 
            onClose={() => setAlert(null)}
          >
            <Alert 
              onClose={() => setAlert(null)} 
              severity={alert.type || 'error'}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        )}

        <FeeCollectionDialog
          open={openDialog}
          onClose={handleDialogClose}
          onSubmit={handleAddEditFeeCollection}
          initialData={selectedCollection}
        />
      </Paper>
    </Box>
  );
};

export default FeeCollection;