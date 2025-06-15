import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Menu as MenuIcon } from '@mui/icons-material';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    List,
    ListItem,
    Avatar,
    InputAdornment,
    Button,
    Divider,
    Menu,
    MenuItem,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Send,
    AttachFile,
    MoreVert,
    Search,
    EmojiEmotions
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Update MessageContainer with student-specific colors
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

// Use all the same styled components from teacher message.jsx but modify the SidebarContainer
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

// Add missing MainContent component
const MainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  width: '100%',
  gap: theme.spacing(2),
  position: 'relative'
}));

// Add missing MenuToggle component
const MenuToggle = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  left: theme.spacing(2),
  top: theme.spacing(2),
  zIndex: 1300,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  },
  [theme.breakpoints.up('md')]: {
    display: 'none'
  }
}));

// Add ChatContainer styled component if missing
const ChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
  position: 'relative',
  minHeight: 0
}));

// Add ChatHeader styled component if missing
const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  borderTopLeftRadius: theme.shape.borderRadius * 2,
  borderTopRightRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
}));

// Add MessageList styled component if missing
const MessageList = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column-reverse',
  flex: 1,
  minHeight: 0,
  backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
}));

// Add ChatFooter styled component if missing
const ChatFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  height: 70,
  position: 'sticky',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 10
}));

// Add ActionIconButton component definition
const ActionIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
    transition: 'all 0.2s ease',
    '&:hover': {
        color: theme.palette.primary.main,
        transform: 'scale(1.1)'
    }
}));

// Add MessageBubble component definition (was missing in the error)
const MessageBubble = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'sent'
})(({ theme, sent }) => ({
    maxWidth: '70%',
    padding: theme.spacing(1.5, 2),
    borderRadius: sent ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
    marginBottom: theme.spacing(1),
    alignSelf: sent ? 'flex-end' : 'flex-start',
    backgroundColor: sent 
        ? theme.palette.primary.main 
        : 'rgba(255, 255, 255, 0.95)',
    color: sent 
        ? theme.palette.primary.contrastText 
        : theme.palette.text.primary,
    boxShadow: sent
        ? '0 4px 15px rgba(0, 0, 0, 0.1)'
        : '0 4px 15px rgba(0, 0, 0, 0.05)',
    position: 'relative',
    transition: 'all 0.2s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
    }
}));

const Message = () => {
    // State declarations
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messageEndRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [alert, setAlert] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Fetch teachers on component mount
    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            
            console.log('Fetching teachers...');
            
            const response = await fetch(
                'http://localhost:5000/api/v1/student/communication/teachers',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch teachers');
            }

            const data = await response.json();
            console.log('Teachers response:', data); // Debug log

            if (data.success && Array.isArray(data.data)) {
                setRecipients(data.data);
            } else {
                console.error('Invalid data format:', data);
                throw new Error('Invalid data format received');
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            setAlert({
                show: true,
                severity: 'error',
                message: 'Failed to load teachers: ' + error.message
            });
            setRecipients([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const selectRecipient = (teacher) => {
        // Log the full teacher object for debugging
        console.log('Selecting teacher:', teacher);

        if (!teacher?._id) {
            console.error('Invalid teacher: Missing ID');
            setAlert({
                show: true,
                severity: 'error',
                message: 'Invalid teacher data'
            });
            return;
        }

        // Create recipient data object
        const recipientData = {
            _id: teacher._id,
            name: teacher.name,
            detail: teacher.detail,
            type: 'teacher'
        };

        console.log('Setting recipient:', recipientData);
        setSelectedRecipient(recipientData);

        // Fetch messages for this teacher
        fetchMessages(recipientData._id);
    };

    const fetchMessages = async (teacherId) => {
        try {
            setLoadingMessages(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(
                `http://localhost:5000/api/v1/student/communication/messages/${teacherId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            if (data.success) {
                setMessages(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch messages');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setAlert({
                show: true,
                severity: 'error',
                message: 'Error fetching messages'
            });
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async () => {
        if (!message.trim() && attachments.length === 0) {
            setAlert({
                show: true,
                severity: 'error',
                message: 'Please enter a message or add attachments'
            });
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/api/v1/student/communication/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    teacherId: selectedRecipient._id,
                    content: message,
                    type: 'direct',
                    attachments
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            if (data.success) {
                setMessage('');
                fetchMessages(selectedRecipient._id);
                setAlert({
                    show: true,
                    severity: 'success',
                    message: 'Message sent successfully'
                });
                setAttachments([]); // Clear attachments after sending
            } else {
                throw new Error(data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Send message error:', error);
            setAlert({
                show: true,
                severity: 'error',
                message: error.message || 'Error sending message'
            });
        }
    };

    const handleFileSelect = async (event) => {
        const files = Array.from(event.target.files);
        
        try {
            const uploadedFiles = await Promise.all(
                files.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch('http://localhost:5000/api/v1/upload', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('Failed to upload file');
                    }

                    const data = await response.json();
                    return {
                        name: file.name,
                        url: data.url,
                        type: file.type
                    };
                })
            );

            setAttachments(prev => [...prev, ...uploadedFiles]);
        } catch (error) {
            console.error('File upload error:', error);
            setAlert({
                show: true,
                severity: 'error',
                message: 'Failed to upload files'
            });
        }
    };

    const renderRecipients = () => {
        if (!Array.isArray(recipients)) {
            console.warn('Recipients is not an array:', recipients);
            return null;
        }

        return recipients.map((teacher) => {
            if (!teacher?._id) {
                console.warn('Invalid teacher data:', teacher);
                return null;
            }

            return (
                <ListItem
                    button
                    key={teacher._id}
                    selected={selectedRecipient?._id === teacher._id}
                    onClick={() => selectRecipient(teacher)}
                >
                    <Avatar sx={{ mr: 2 }}>{teacher.name?.[0] || '?'}</Avatar>
                    <Box>
                        <Typography variant="subtitle1">{teacher.name || 'Unknown'}</Typography>
                        <Typography variant="caption" display="block">
                            {teacher.detail || 'Teacher'}
                        </Typography>
                    </Box>
                </ListItem>
            );
        }).filter(Boolean);
    };

    return (
        <MessageContainer>
            {isMobile && (
                <MenuToggle onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <MenuIcon />
                </MenuToggle>
            )}
            <MainContent>
                <SidebarContainer open={sidebarOpen}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight="500">
                            Message Teachers
                        </Typography>
                    </Box>

                    <Box sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            placeholder="Search teachers..."
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    <List sx={{ overflow: 'auto', flexGrow: 1 }}>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                <CircularProgress />
                            </Box>
                        ) : recipients.length > 0 ? (
                            renderRecipients()
                        ) : (
                            <ListItem>
                                <Typography variant="body2" color="text.secondary">
                                    No teachers found
                                </Typography>
                            </ListItem>
                        )}
                    </List>
                </SidebarContainer>

                {selectedRecipient ? (
                    <ChatContainer>
                        <ChatHeader>
                            <Avatar sx={{ mr: 2 }}>{selectedRecipient.name[0]}</Avatar>
                            <Typography variant="h6">{selectedRecipient.name}</Typography>
                            <ActionIconButton sx={{ ml: 'auto' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
                                <MoreVert />
                            </ActionIconButton>
                        </ChatHeader>

                        <MessageList>
                            {loadingMessages ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                messages.map((msg) => (
                                    <MessageBubble key={msg._id} sent={msg.sender === req.user?._id}>
                                        <Typography variant="body1">{msg.content}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </Typography>
                                    </MessageBubble>
                                ))
                            )}
                        </MessageList>

                        <ChatFooter>
                            <ActionIconButton>
                                <EmojiEmotions />
                            </ActionIconButton>
                            <ActionIconButton onClick={() => fileInputRef.current.click()}>
                                <AttachFile />
                            </ActionIconButton>
                            <TextField
                                fullWidth
                                placeholder="Type a message..."
                                variant="outlined"
                                size="small"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                sx={{ mx: 1 }}
                            />
                            <ActionIconButton color="primary" onClick={handleSendMessage}>
                                <Send />
                            </ActionIconButton>
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                        </ChatFooter>
                    </ChatContainer>
                ) : (
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 2
                    }}>
                        <Box sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Select a teacher to start messaging
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Choose from your teachers to start a conversation
                            </Typography>
                        </Box>
                    </Box>
                )}
            </MainContent>

            {/* Alerts and menus remain the same as teacher message.jsx */}
        </MessageContainer>
    );
};

export default Message;
