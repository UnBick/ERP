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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';
import { getApiUrl } from '../../../config/apiConfig';


const Grades = () => {
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [grades, setGrades] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState('all');
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            fetchGrades();
        }
    }, [selectedStudent, selectedTerm]);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                getApiUrl('/api/v1/parent/children'),
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
                severity: 'error',
                message: 'Error fetching students list'
            });
        }
    };

    const fetchGrades = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            console.log('Fetching grades for student:', selectedStudent);
            
            const response = await axios.get(
                getApiUrl(`/api/v1/parent/grades/${selectedStudent}`),
                {
                    headers: { 
                        'Authorization': `Bearer ${token}` 
                    },
                    params: { 
                        term: selectedTerm 
                    }
                }
            );

            console.log('Grades response:', response.data);

            if (response.data.success) {
                setGrades(response.data.data);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error fetching grades:', error);
            setAlert({
                severity: 'error',
                message: error.response?.data?.message || 'Error fetching grades'
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async (examId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                getApiUrl(`/api/v1/parent/grades/${selectedStudent}/report/${examId}`),
                {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/pdf'
                    },
                    responseType: 'blob'
                }
            );

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `grade_report_${examId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            setAlert({
                severity: 'error',
                message: 'Error downloading report'
            });
        }
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Select Student</InputLabel>
                            <Select
                                value={selectedStudent || ''}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                            >
                                {students.map((student) => (
                                    <MenuItem key={student.id} value={student.id}>
                                        {student.name} - Class {student.class}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Select Term</InputLabel>
                            <Select
                                value={selectedTerm}
                                onChange={(e) => setSelectedTerm(e.target.value)}
                            >
                                <MenuItem value="all">All Terms</MenuItem>
                                <MenuItem value="term1">Term 1</MenuItem>
                                <MenuItem value="term2">Term 2</MenuItem>
                                <MenuItem value="term3">Term 3</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {loading ? (
                        <Grid item xs={12} sx={{ textAlign: 'center' }}>
                            <CircularProgress />
                        </Grid>
                    ) : (
                        <>
                            <Grid item xs={12}>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Subject</TableCell>
                                                <TableCell>Average Score</TableCell>
                                                <TableCell>Grade</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {grades.subjects?.map((subject) => (
                                                <TableRow key={subject._id}>
                                                    <TableCell>{subject.subjectName}</TableCell>
                                                    <TableCell>
                                                        {subject.averageScore.toFixed(2)}%
                                                    </TableCell>
                                                    <TableCell>
                                                        {calculateGrade(subject.averageScore)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            startIcon={<DownloadIcon />}
                                                            onClick={() => downloadReport(subject._id)}
                                                        >
                                                            Report
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>

                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Overall Performance
                                        </Typography>
                                        <Typography variant="h4" color="primary">
                                            {grades.overallAverage?.toFixed(2)}%
                                        </Typography>
                                        <Typography variant="subtitle1">
                                            Grade: {calculateGrade(grades.overallAverage)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}
                </Grid>

                <Snackbar
                    open={alert !== null}
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

const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
};

export default Grades;
