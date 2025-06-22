import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Grid, TextField, Button, Typography,
    FormControl, InputLabel, Select, MenuItem,
    CircularProgress, Snackbar, Alert
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';
import { getApiUrl } from '../../config/apiConfig';

const Message = ({ userRole }) => {
    const [recipients, setRecipients] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    // Define allowed recipient roles based on user role
    const allowedRoles = {
        teacher: ['student', 'parent'],
        parent: ['teacher'],
        student: ['teacher']
    };

    useEffect(() => {
        if (selectedRole) {
            fetchRecipients(selectedRole);
        }
    }, [selectedRole]);

    const fetchRecipients = async (role) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                getApiUrl(`/api/v1/messages/recipients/${role}`),
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setRecipients(response.data.data);
            }
        } catch (error) {
            setAlert({
                severity: 'error',
                message: 'Error fetching recipients'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        try {
            if (!selectedRecipient || !subject || !content) {
                setAlert({
                    severity: 'error',
                    message: 'Please fill all required fields'
                });
                return;
            }

            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                getApiUrl('/api/v1/messages/send'),
                {
                    recipientId: selectedRecipient,
                    recipientRole: selectedRole,
                    subject,
                    content
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setAlert({
                    severity: 'success',
                    message: 'Message sent successfully'
                });
                // Reset form
                setSelectedRecipient('');
                setSubject('');
                setContent('');
            }
        } catch (error) {
            setAlert({
                severity: 'error',
                message: error.response?.data?.message || 'Error sending message'
            });
        }
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Send Message
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Recipient Type</InputLabel>
                            <Select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                            >
                                {allowedRoles[userRole]?.map(role => (
                                    <MenuItem key={role} value={role}>
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Select Recipient</InputLabel>
                            <Select
                                value={selectedRecipient}
                                onChange={(e) => setSelectedRecipient(e.target.value)}
                                disabled={!selectedRole || loading}
                            >
                                {recipients.map(recipient => (
                                    <MenuItem key={recipient._id} value={recipient._id}>
                                        {recipient.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Message"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            endIcon={<SendIcon />}
                            onClick={handleSend}
                            disabled={loading}
                        >
                            Send Message
                        </Button>
                    </Grid>
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

export default Message;
