import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip
} from '@mui/material';
import axios from 'axios';

const Attendance = () => {
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [stats, setStats] = useState({});
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchAttendance(selectedStudent);
            fetchStats(selectedStudent);
        }
    }, [selectedStudent]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                'http://localhost:5000/api/v1/parent/children',
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setStudents(response.data.data);
                if (response.data.data.length > 0) {
                    setSelectedStudent(response.data.data[0].id);
                }
            }
        } catch (error) {
            setAlert({
                show: true,
                severity: 'error',
                message: 'Error fetching students list'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async (studentId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `http://localhost:5000/api/v1/parent/attendance/${studentId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setAttendance(response.data.data);
            }
        } catch (error) {
            setAlert({
                show: true,
                severity: 'error',
                message: 'Error fetching attendance records'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async (studentId) => {
        try {
            const token = localStorage.getItem('authToken');
            console.log('Fetching stats for student:', studentId);
            
            const response = await axios.get(
                `http://localhost:5000/api/v1/parent/attendance/${studentId}/stats`,
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Stats response:', response.data);

            if (response.data.success) {
                setStats(response.data.data);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            setAlert({
                show: true,
                severity: 'error',
                message: error.response?.data?.message || 'Error fetching attendance statistics'
            });
        }
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Student</InputLabel>
                    <Select
                        value={selectedStudent || ''}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                    >
                        {students.map((student) => (
                            <MenuItem key={student.id} value={student.id}>
                                {student.name} - Class {student.class} {student.section}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Attendance Summary
                                    </Typography>
                                    <Typography variant="h3" color="primary">
                                        {stats.attendanceRate}%
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Present: {stats.presentDays} days
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Absent: {stats.absentDays} days
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Remarks</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {attendance.map((record) => (
                                            <TableRow key={record._id}>
                                                <TableCell>
                                                    {new Date(record.date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={record.status}
                                                        color={
                                                            record.status === 'present' ? 'success' :
                                                            record.status === 'absent' ? 'error' : 'warning'
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{record.remarks || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                )}

                <Snackbar
                    open={alert?.show}
                    autoHideDuration={6000}
                    onClose={() => setAlert(null)}
                >
                    <Alert
                        onClose={() => setAlert(null)}
                        severity={alert?.severity}
                    >
                        {alert?.message}
                    </Alert>
                </Snackbar>
            </Paper>
        </Box>
    );
};

export default Attendance;
