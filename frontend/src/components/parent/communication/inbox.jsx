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
    Search,
    Star,
    StarBorder,
    AttachFile,
    MoreVert,
    Archive,
    Delete,
    MarkEmailRead
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getApiUrl } from '../../../config/apiConfig';


// Styled components for inbox
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

// ... rest of styled components ...

const ParentInbox = () => {
    const [messages, setMessages] = useState({});
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(getApiUrl(
                '/api/v1/parent/communication/inbox'),
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
                // Group messages by child
                const messagesByChild = data.data.reduce((acc, message) => {
                    const childName = message.childName || 'General';
                    if (!acc[childName]) {
                        acc[childName] = [];
                    }
                    acc[childName].push(message);
                    return acc;
                }, {});
                
                setMessages(messagesByChild);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setAlert({
                severity: 'error',
                message: 'Failed to load messages'
            });
        } finally {
            setLoading(false);
        }
    };

    // ... rest of the component methods ...

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

            {/* Message list grouped by child */}
            <List sx={{ overflow: 'auto', flex: 1 }}>
                {Object.entries(messages).map(([childName, childMessages]) => (
                    <React.Fragment key={childName}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                p: 2,
                                bgcolor: 'background.default',
                                fontWeight: 'bold'
                            }}
                        >
                            {childName}
                        </Typography>
                        {/* Message items */}
                        {childMessages.map((message) => (
                            <MessageListItem
                                key={message._id}
                                message={message}
                                selected={selectedMessage?._id === message._id}
                                onSelect={setSelectedMessage}
                                onAction={handleMessageAction}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </List>

            {/* Context menu for message actions */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => handleMessageAction('archive')}>
                    <Archive sx={{ mr: 1 }} /> Archive
                </MenuItem>
                <MenuItem onClick={() => handleMessageAction('delete')}>
                    <Delete sx={{ mr: 1 }} /> Delete
                </MenuItem>
                <MenuItem onClick={() => handleMessageAction('mark-read')}>
                    <MarkEmailRead sx={{ mr: 1 }} /> Mark as read
                </MenuItem>
            </Menu>
        </StyledPaper>
    );
};

export default ParentInbox;
