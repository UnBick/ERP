// src/components/student/Assignments.jsx
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
  CircularProgress,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Upload as UploadIcon, Sort as SortIcon } from '@mui/icons-material';
import { getApiUrl } from '../../config/apiConfig';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [sortBy, setSortBy] = useState('dueDate');
  const [filterStatus, setFilterStatus] = useState('all');
  const [submitDialog, setSubmitDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submission, setSubmission] = useState({ comment: '', file: null });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/v1/student/assignments'));
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      setAlert('Error fetching assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (assignmentId) => {
    const formData = new FormData();
    formData.append('comment', submission.comment);
    formData.append('file', submission.file);

    try {
      await fetch(getApiUrl(`/api/v1/student/assignments/${assignmentId}/submit`), {
        method: 'POST',
        body: formData,
      });
      fetchAssignments();
      setSubmitDialog(false);
    } catch (error) {
      setAlert('Error submitting assignment');
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Assignments</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small">
              <InputLabel>Filter</InputLabel>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{assignment.description}</TableCell>
                  <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{assignment.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      disabled={assignment.status === 'submitted'}
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setSubmitDialog(true);
                      }}
                    >
                      Submit
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
          <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert onClose={() => setAlert(null)} severity="error">
              {alert}
            </Alert>
          </Snackbar>
        )}

        <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)}>
          <DialogTitle>Submit Assignment</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comment"
              value={submission.comment}
              onChange={(e) => setSubmission({ ...submission, comment: e.target.value })}
              sx={{ mb: 2, mt: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              Upload File
              <input
                type="file"
                hidden
                onChange={(e) => setSubmission({ ...submission, file: e.target.files[0] })}
              />
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubmitDialog(false)}>Cancel</Button>
            <Button onClick={() => handleSubmit(selectedAssignment.id)} variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Assignments;