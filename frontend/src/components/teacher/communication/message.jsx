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
    Tab,
    Tabs,
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
import { getApiUrl } from '../../../config/apiConfig';

// Update MessageContainer styling with gradient background
const MessageContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 64px)',
  width: '100%',
  display: 'flex',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
  position: 'relative',
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1)
  }
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

// Update ChatHeader with gradient
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

// Add missing ActionIconButton styled component
const ActionIconButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
    transition: 'all 0.2s ease',
    '&:hover': {
        color: theme.palette.primary.main,
        transform: 'scale(1.1)'
    }
}));

// Add missing MessageSkeleton styled component
const MessageSkeleton = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    animation: 'pulse 1.5s infinite',
    '@keyframes pulse': {
        '0%': { opacity: 0.6 },
        '50%': { opacity: 0.3 },
        '100%': { opacity: 0.6 }
    }
}));

// Update and add styled components
const ChatContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
  position: 'relative',  // Add this
  minHeight: 0  // Add this to allow proper flexbox behavior
}));

// Update SidebarContainer with glassmorphism effect
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

const MessageList = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column-reverse',
    flex: 1,
    minHeight: 0,  // Add this
    backgroundImage: `linear-gradient(to bottom, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
    '&::-webkit-scrollbar': {
        width: '4px'
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
        background: theme.palette.primary.light,
        borderRadius: '2px'
    }
}));

// Update MessageBubble with better colors and effects
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
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        [sent ? 'right' : 'left']: -10,
        width: 20,
        height: 20,
        background: 'inherit',
        clipPath: sent
            ? 'polygon(0 0, 100% 100%, 100% 0)'
            : 'polygon(0 0, 100% 100%, 0 100%)'
    }
}));

// Update RecipientListItem with hover effects
const RecipientListItem = styled(ListItem)(({ theme, selected }) => ({
    marginBottom: theme.spacing(0.5),
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.3s ease',
    backgroundColor: selected ? 
        `${theme.palette.primary.main}15` : 
        'transparent',
    '&:hover': {
        backgroundColor: `${theme.palette.primary.main}25`,
        transform: 'translateX(4px)',
        '& .MuiAvatar-root': {
            transform: 'scale(1.1)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
        }
    },
    '& .MuiAvatar-root': {
        transition: 'all 0.3s ease',
        backgroundColor: selected
            ? theme.palette.primary.main
            : theme.palette.grey[400],
        color: '#fff'
    },
    '& .MuiTypography-caption': {
        color: theme.palette.text.secondary,
        fontSize: '0.75rem'
    }
}));

const ChatFooter = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    height: 70,
    position: 'sticky',  // Add this
    bottom: 0,  // Add this
    left: 0,  // Add this
    right: 0,  // Add this
    zIndex: 10  // Add this
}));

const MessageInput = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: 25,
        backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(0,0,0,0.05)',
        '&.Mui-focused': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`
        }
    }
}));

const SearchField = styled(TextField)(({ theme }) => ({
    margin: theme.spacing(1),
    '& .MuiOutlinedInput-root': {
        borderRadius: 20,
        backgroundColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.05)'
    }
}));

// Add MainContent wrapper
const MainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100%',
  width: '100%',
  gap: theme.spacing(2),
  position: 'relative'
}));

// Update Tabs styling
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    minWidth: 100,
    textTransform: 'none',
    fontWeight: 500
  }
}));

// Update List styling to hide scrollbar
const StyledList = styled(List)(({ theme }) => ({
  overflow: 'auto',
  height: 'calc(100% - 112px)',
  '&::-webkit-scrollbar': {
    width: '4px',
    display: 'none'  // Hide scrollbar for webkit browsers
  },
  scrollbarWidth: 'none',  // Hide scrollbar for Firefox
  '-ms-overflow-style': 'none',  // Hide scrollbar for IE/Edge
  flex: 1
}));

// Add StyledAvatar component
const StyledAvatar = styled(Avatar)(({ theme }) => ({
    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    border: '2px solid #fff'
}));

const Message = () => {
    // Initialize recipients as empty array
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [recipientType, setRecipientType] = useState('students');
    const messageEndRef = useRef(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [alert, setAlert] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const [messageStatus, setMessageStatus] = useState({});
    const [isReplying, setIsReplying] = useState(false);
    const [replyTo, setReplyTo] = useState(null);
    const [showEmoji, setShowEmoji] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        console.log('Fetching recipients for type:', recipientType);
        fetchRecipients();
    }, [recipientType]);

    useEffect(() => {
        if (!isMobile) {
            setSidebarOpen(true);
        } else {
            setSidebarOpen(false);
        }
    }, [isMobile]);

    const fetchRecipients = async () => {
        try {
            setRecipients([]); // Clear existing recipients while loading
            const token = localStorage.getItem('authToken');
            const response = await fetch(
                getApiUrl(`/api/v1/teacher/communication/recipients?type=${recipientType}`),
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            console.log('Recipients response:', data);
            if (data.success) {
                setRecipients(data.data || []);
            } else {
                throw new Error(data.message || 'Failed to fetch recipients');
            }
        } catch (error) {
            console.error('Error fetching recipients:', error);
            setAlert({
                show: true,
                severity: 'error',
                message: 'Failed to load recipients'
            });
            setRecipients([]); // Set to empty array on error
        }
    };

    const fetchMessages = async (recipientId) => {
        // Add validation before making the API call
        if (!recipientId) {
            console.error('Invalid recipient ID');
            setAlert({
                show: true,
                severity: 'error',
                message: 'Invalid recipient selected'
            });
            return;
        }

        try {
            setLoadingMessages(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(
                getApiUrl(`/api/v1/teacher/communication/messages/${recipientId}`),
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

    const selectRecipient = (recipient) => {
        // Log the full recipient object for debugging
        console.log('Selecting recipient:', recipient);

        if (!recipient?.user && !recipient?._id) {
            console.error('Invalid recipient: Missing user ID');
            setAlert({
                show: true,
                severity: 'error',
                message: 'Invalid recipient data'
            });
            return;
        }

        // Use either user._id or _id
        const recipientData = {
            _id: recipient.user || recipient._id,
            name: recipient.name,
            detail: recipient.detail,
            type: recipient.type
        };

        console.log('Setting recipient:', recipientData);
        setSelectedRecipient(recipientData);
        fetchMessages(recipientData._id);
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
            const response = await fetch(getApiUrl('/api/v1/teacher/communication/send'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    recipientId: selectedRecipient._id,
                    content: message,
                    recipientType: selectedRecipient.type,
                    type: 'direct',
                    subject: 'Direct Message',
                    attachments,
                    parentMessage: replyTo?._id,
                    contentType: 'text'
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
        setUploading(true);

        try {
            const uploadedFiles = await Promise.all(
                files.map(async (file) => {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch(getApiUrl('/api/v1/upload'), {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: formData
                    });

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
            setAlert({
                show: true,
                severity: 'error',
                message: 'Failed to upload files'
            });
        } finally {
            setUploading(false);
        }
    };

    const filteredRecipients = recipients.filter(recipient =>
        recipient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipient?.detail?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Update renderRecipients to handle null/undefined cases
    const renderRecipients = () => {
        if (!Array.isArray(filteredRecipients)) {
            console.warn('Recipients is not an array:', filteredRecipients);
            return null;
        }

        return filteredRecipients.map((recipient) => {
            if (!recipient) return null;

            const recipientId = recipient.user || recipient._id;
            if (!recipientId) {
                console.warn('Invalid recipient:', recipient);
                return null;
            }

            return (
                <RecipientListItem
                    button
                    key={recipientId}
                    selected={selectedRecipient?._id === recipientId}
                    onClick={() => selectRecipient(recipient)}
                >
                    <Avatar sx={{ mr: 2 }}>{recipient.name?.[0] || '?'}</Avatar>
                    <Box>
                        <Typography variant="subtitle1">{recipient.name || 'Unknown'}</Typography>
                        <Typography variant="caption" display="block">
                            {recipient.detail || 'No details available'}
                        </Typography>
                    </Box>
                </RecipientListItem>
            );
        }).filter(Boolean); // Remove null entries
    };

    // Add function to handle emoji selection
    const onEmojiClick = (event, emojiObject) => {
        setMessage(prev => prev + emojiObject.emoji);
        setShowEmoji(false);
    };

    // Add function to handle replies
    const handleReply = (message) => {
        setReplyTo(message);
        setIsReplying(true);
    };

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <MessageContainer>
            {isMobile && (
                <MenuToggle onClick={handleSidebarToggle}>
                    <Menu />
                </MenuToggle>
            )}
            <MainContent>
                <SidebarContainer open={sidebarOpen}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight="500">
                            Messages
                        </Typography>
                    </Box>

                    <StyledTabs
                        value={recipientType}
                        onChange={(e, v) => setRecipientType(v)}
                        variant="fullWidth"
                    >
                        <Tab value="students" label="Students" />
                        <Tab value="parents" label="Parents" />
                        <Tab value="admin" label="Admin" />
                    </StyledTabs>

                    <Box sx={{ p: 2 }}>
                        <TextField
                            fullWidth
                            placeholder="Search recipients..."
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

                    <StyledList>  {/* Replace the existing List component with StyledList */}
                        {filteredRecipients.length > 0 ? (
                            renderRecipients()
                        ) : (
                            <ListItem>
                                <Typography variant="body2" color="text.secondary">
                                    No recipients found
                                </Typography>
                            </ListItem>
                        )}
                    </StyledList>
                </SidebarContainer>
                {isMobile && sidebarOpen && (
                    <Box
                        sx={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            zIndex: 1100
                        }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Chat Area */}
                {selectedRecipient ? (
                    <ChatContainer>
                        {/* Chat Header */}
                        <ChatHeader>
                            <StyledAvatar sx={{ mr: 2 }}>{selectedRecipient.name[0]}</StyledAvatar>
                            <Typography variant="h6">{selectedRecipient.name}</Typography>
                            <ActionIconButton sx={{ ml: 'auto' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
                                <MoreVert />
                            </ActionIconButton>
                        </ChatHeader>

                        {/* Messages */}
                        <MessageList>
                            {loadingMessages ? (
                                <MessageSkeleton>
                                    <CircularProgress size={24} />
                                    <Typography variant="body2" sx={{ ml: 2 }}>Loading messages...</Typography>
                                </MessageSkeleton>
                            ) : (
                                messages.map((msg) => (
                                    <MessageBubble key={msg._id} sent={msg.sender === 'teacher'}>
                                        <Typography variant="body1">{msg.content}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </Typography>
                                    </MessageBubble>
                                ))
                            )}
                            <div ref={messageEndRef} />
                        </MessageList>
                        {/* Message Input */}
                        <ChatFooter>
                            <ActionIconButton>
                                <EmojiEmotions />
                            </ActionIconButton>
                            <ActionIconButton onClick={() => fileInputRef.current.click()}>
                                <AttachFile />
                            </ActionIconButton>
                            <MessageInput
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
                                Select a recipient to start messaging
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Choose from students, parents, or administrators
                            </Typography>
                        </Box>
                    </Box>
                )}
            </MainContent>

            {/* Alerts */}
            <Snackbar
                open={alert?.show}
                autoHideDuration={6000}
                onClose={() => setAlert(null)}
            >
                <Alert
                    onClose={() => setAlert(null)}
                    severity={alert?.severity}
                    variant="filled"
                >
                    {alert?.message}
                </Alert>
            </Snackbar>
            {/* Options Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem>View Profile</MenuItem>
                <MenuItem>Clear Chat</MenuItem>
                <MenuItem>Block</MenuItem>
            </Menu>
        </MessageContainer>
    );
};

export default Message;