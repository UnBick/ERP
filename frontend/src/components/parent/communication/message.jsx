import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Avatar,
    IconButton,
    CircularProgress,
    InputAdornment,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    Send,
    AttachFile,
    MoreVert,
    Search,
    EmojiEmotions,
    Delete,
    Star,
    StarBorder,
    Menu as MenuIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { getApiUrl } from '../../../config/apiConfig';


// Styled Components
const MessageContainer = styled(Box)(({ theme }) => ({
    height: 'calc(100vh - 64px)',
    width: '100%',
    display: 'flex',
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)'
        : 'linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)',
    position: 'relative',
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1)
    }
}));

const SidebarContainer = styled(Paper)(({ theme, open }) => ({
    width: 320,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    marginRight: theme.spacing(2),
    border: '1px solid rgba(255, 255, 255, 0.18)',
    [theme.breakpoints.down('md')]: {
        position: 'absolute',
        zIndex: 1200,
        width: 280,
        transform: open ? 'translateX(0)' : 'translateX(-100%)'
    }
}));

const MainContent = styled(Box)(({ theme }) => ({
    display: 'flex',
    height: '100%',
    width: '100%',
    gap: theme.spacing(2),
    position: 'relative'
}));

const TeacherListItem = ({ teacher, selected, onClick }) => (
    <ListItem
        button
        selected={selected}
        onClick={onClick}
    >
        <Avatar sx={{ mr: 2 }}>{teacher.name[0]}</Avatar>
        <ListItemText
            primary={teacher.name}
            secondary={teacher.detail}
        />
    </ListItem>
);

const message = () => {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const fileInputRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                getApiUrl('/api/v1/parent/communication/teachers'),
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setTeachers(response.data.data);
            }
        } catch (error) {
            setAlert({
                show: true,
                severity: 'error',
                message: error.response?.data?.message || 'Error fetching teachers'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (teacherId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                getApiUrl(`/api/v1/parent/communication/messages/${teacherId}`),
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setMessages(response.data.data);
            }
        } catch (error) {
            setAlert({
                show: true,
                severity: 'error',
                message: 'Error fetching messages'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() && attachments.length === 0) return;

        try {
            const token = localStorage.getItem('authToken');
            const formData = new FormData();
            formData.append('recipientId', selectedTeacher._id);
            formData.append('content', message);
            formData.append('type', 'direct');
            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            await axios.post(
                getApiUrl('/api/v1/parent/communication/send'),
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setMessage('');
            setAttachments([]);
            fetchMessages(selectedTeacher._id);
        } catch (error) {
            setAlert({
                show: true,
                severity: 'error',
                message: 'Error sending message'
            });
        }
    };

    const handleFileSelect = async (event) => {
        const files = Array.from(event.target.files);
        setAttachments([...attachments, ...files]);
    };

    return (
        <MessageContainer>
            <MainContent>
                <SidebarContainer open={sidebarOpen}>
                    {/* Teacher List Section */}
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6">Message Teachers</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search teachers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ mt: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    <List sx={{ flex: 1, overflow: 'auto' }}>
                        {teachers
                            .filter(teacher => 
                                teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                teacher.detail.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((teacher) => (
                                <TeacherListItem
                                    key={teacher._id}
                                    teacher={teacher}
                                    selected={selectedTeacher?._id === teacher._id}
                                    onClick={() => {
                                        setSelectedTeacher(teacher);
                                        fetchMessages(teacher._id);
                                    }}
                                />
                            ))}
                    </List>
                </SidebarContainer>

                {/* Chat Section */}
                {selectedTeacher ? (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Chat Header */}
                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ mr: 2 }}>{selectedTeacher.name[0]}</Avatar>
                                <Box>
                                    <Typography variant="h6">{selectedTeacher.name}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {selectedTeacher.detail}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Messages List */}
                        <Paper sx={{ flex: 1, mb: 2, overflow: 'auto', p: 2 }}>
                            {messages.map((msg) => (
                                <Box
                                    key={msg._id}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: msg.sender === 'parent' ? 'flex-end' : 'flex-start',
                                        mb: 1
                                    }}
                                >
                                    <Paper
                                        sx={{
                                            p: 1,
                                            maxWidth: '70%',
                                            bgcolor: msg.sender === 'parent' ? 'primary.main' : 'background.paper',
                                            color: msg.sender === 'parent' ? 'white' : 'text.primary'
                                        }}
                                    >
                                        <Typography variant="body1">{msg.content}</Typography>
                                        <Typography variant="caption" display="block">
                                            {new Date(msg.createdAt).toLocaleTimeString()}
                                        </Typography>
                                    </Paper>
                                </Box>
                            ))}
                        </Paper>

                        {/* Message Input */}
                        <Paper sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton onClick={() => fileInputRef.current.click()}>
                                    <AttachFile />
                                </IconButton>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Type a message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <IconButton color="primary" onClick={handleSendMessage}>
                                    <Send />
                                </IconButton>
                                <input
                                    type="file"
                                    hidden
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    multiple
                                />
                            </Box>
                        </Paper>
                    </Box>
                ) : (
                    <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h6" color="textSecondary">
                            Select a teacher to start messaging
                        </Typography>
                    </Paper>
                )}
            </MainContent>

            {alert && (
                <Snackbar
                    open={alert.show}
                    autoHideDuration={6000}
                    onClose={() => setAlert(null)}
                >
                    <Alert
                        onClose={() => setAlert(null)}
                        severity={alert.severity}
                    >
                        {alert.message}
                    </Alert>
                </Snackbar>
            )}
        </MessageContainer>
    );
};

export default message;
