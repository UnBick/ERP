import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    IconButton,
    Divider,
    Badge,
    Toolbar,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    CircularProgress
} from '@mui/material';
import {
    Email,
    Delete,
    Archive,
    MoreVert,
    Search,
    Star,
    StarBorder,
    AttachFile
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getApiUrl } from '../../../config/apiConfig';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
    height: 'calc(100vh - 100px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)'
}));

const MessageList = styled(List)(({ theme }) => ({
    overflow: 'auto',
    flex: 1,
    '&::-webkit-scrollbar': {
        width: '6px'
    },
    '&::-webkit-scrollbar-track': {
        background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
        background: theme.palette.primary.light,
        borderRadius: '3px'
    }
}));

const MessageItem = styled(ListItem)(({ theme, selected }) => ({
    transition: 'all 0.2s ease',
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(0.5),
    backgroundColor: selected ? theme.palette.action.selected : 'transparent',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateX(4px)'
    }
}));

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(
                getApiUrl('/api/v1/student/communication/inbox'),
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMessageAction = async (messageId, action) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(
                getApiUrl(`/api/v1/student/communication/messages/${messageId}/${action}`),
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.ok) {
                fetchMessages(); // Refresh messages after action
            }
        } catch (error) {
            console.error('Error performing message action:', error);
        }
    };

    const filteredMessages = messages.filter(message =>
        message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <StyledPaper>
            <Toolbar>
                <TextField
                    fullWidth
                    placeholder="Search messages..."
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
            </Toolbar>

            <Divider />

            <MessageList>
                {filteredMessages.map((message) => (
                    <React.Fragment key={message._id}>
                        <MessageItem
                            button
                            selected={selectedMessage?._id === message._id}
                            onClick={() => setSelectedMessage(message)}
                        >
                            <ListItemAvatar>
                                <Badge
                                    color="primary"
                                    variant="dot"
                                    invisible={message.read}
                                >
                                    <Avatar src={message.sender?.avatar}>
                                        {message.sender?.name?.[0]}
                                    </Avatar>
                                </Badge>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: message.read ? 'normal' : 'bold' }}>
                                            {message.sender?.name}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(message.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        <Typography variant="body2" color="textPrimary">
                                            {message.subject}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" noWrap>
                                            {message.content}
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                {message.attachments?.length > 0 && (
                                    <AttachFile fontSize="small" color="action" />
                                )}
                                <IconButton
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMessageAction(message._id, 'star');
                                    }}
                                >
                                    {message.starred ? (
                                        <Star color="warning" />
                                    ) : (
                                        <StarBorder />
                                    )}
                                </IconButton>
                            </Box>
                        </MessageItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </MessageList>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => handleMessageAction(selectedMessage?._id, 'archive')}>
                    Archive
                </MenuItem>
                <MenuItem onClick={() => handleMessageAction(selectedMessage?._id, 'delete')}>
                    Delete
                </MenuItem>
                <MenuItem onClick={() => handleMessageAction(selectedMessage?._id, 'mark-read')}>
                    Mark as read
                </MenuItem>
            </Menu>
        </StyledPaper>
    );
};

export default Inbox;
