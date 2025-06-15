import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { 
  CloudUpload, 
  CloudDownload, 
  Schedule 
} from '@mui/icons-material';

const Backup = () => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [backupHistory, setBackupHistory] = useState([]);
  const [scheduleTime, setScheduleTime] = useState('');
  const [autoBackupSettings, setAutoBackupSettings] = useState({
    enabled: false,
    frequency: 'daily',
    time: '00:00',
    retention: 7,
  });
  const [backupLocations, setBackupLocations] = useState([]);
  const [encryptBackups, setEncryptBackups] = useState(false);

  useEffect(() => {
    fetchBackupHistory();
  }, []);

  const fetchBackupHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings/backup/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch backup history');
      }

      const data = await response.json();
      if (data.success) {
        setBackupHistory(data.data || []);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Error fetching backup history'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings/backup/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create backup');
      }

      const data = await response.json();
      if (data.success) {
        setAlert({
          severity: 'success',
          message: 'Backup created successfully'
        });
        await fetchBackupHistory(); // Refresh the list
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Error creating backup'
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleBackup = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings/backup/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scheduleTime })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule backup');
      }

      const data = await response.json();
      if (data.success) {
        setAlert({
          severity: 'success',
          message: 'Backup scheduled successfully'
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Error scheduling backup'
      });
    } finally {
      setLoading(false);
    }
  };

  const configureAutoBackup = async () => {
    // Implementation for automatic backup configuration
  };

  const handleRestore = async (backupId) => {
    if (!window.confirm('Are you sure you want to restore this backup? This will overwrite current data.')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings/backup/${backupId}/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to restore backup');
      }

      const data = await response.json();
      if (data.success) {
        setAlert({
          severity: 'success',
          message: 'Backup restored successfully'
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Error restoring backup'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Backup Management
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            type="time"
            label="Schedule Daily Backup"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            sx={{ mr: 2 }}
          />
          <Button variant="contained" onClick={scheduleBackup}>
            Schedule Backup
          </Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleBackup} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create Backup'}
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {backupHistory.length > 0 ? (
                backupHistory.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell>{backup.date}</TableCell>
                    <TableCell>{backup.size}</TableCell>
                    <TableCell>{backup.status}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleRestore(backup.id)}>
                        Restore
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No backup history available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {alert && (
          <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert onClose={() => setAlert(null)} severity={alert.severity}>
              {alert.message}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default Backup;
