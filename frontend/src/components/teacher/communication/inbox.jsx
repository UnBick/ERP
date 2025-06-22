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
    Chip,
    Toolbar,
    TextField,
    InputAdornment,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Email,
    Delete,
    Archive,
    MoreVert,
    Search,
    Star,
    StarBorder,
    AttachFile,
    Notifications
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getApiUrl } from '../../../config/apiConfig';

const StyledPaper = styled(Paper)(({ theme }) => ({
    margin: theme.spacing(2),
    height: 'calc(100vh - 100px)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
}));

const Inbox = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(
                getApiUrl('/api/v1/teacher/communication/inbox'),
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            const data = await response.json();
            setMessages(data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    const handleMessageAction = async (messageId, action) => {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(
                getApiUrl(`/api/v1/teacher/communication/messages/${messageId}/${action}`),
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            fetchMessages();
        } catch (error) {
            console.error('Error updating message:', error);
        }
    };

    return (
        <StyledPaper>
            <Toolbar>
                <TextField
                    placeholder="Search messages..."
                    variant="outlined"
                    size="small"
                    fullWidth
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

            <List sx={{ overflow: 'auto', flex: 1 }}>
                {messages.map((message) => (
                    <React.Fragment key={message._id}>
                        <ListItem
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
                                    <Avatar src={message.sender.avatar}>
                                        {message.sender.name[0]}
                                    </Avatar>
                                </Badge>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: message.read ? 'normal' : 'bold' }}
                                        >
                                            {message.sender.name}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {new Date(message.timestamp).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="textPrimary"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                fontWeight: message.read ? 'normal' : 'bold'
                                            }}
                                        >
                                            {message.subject}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {message.preview}
                                        </Typography>
                                    </Box>
                                }
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                {message.attachments && (
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
                        </ListItem>
                        <Divider />
                    </React.Fragment>
                ))}
            </List>

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
