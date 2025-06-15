import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Drawer,
  Chip,
  Badge,
} from '@mui/material';
import {
  Email,
  Message,
  Sms,
  Search,
  Delete,
  Archive,
  Star,
  StarBorder,
  Person,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getApiUrl, API_ENDPOINTS } from '../../../config/apiConfig';

const Inbox = () => {
  const [messages, setMessages] = useState({
    email: [],
    portal: [],
    sms: []
  });
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [filter, setFilter] = useState({
    role: 'all',
    status: 'all',
    search: '',
    startDate: null,
    endDate: null
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tabs = [
    { label: 'Email', icon: <Email />, type: 'email' },
    { label: 'Portal Messages', icon: <Message />, type: 'portal' },
    { label: 'SMS', icon: <Sms />, type: 'sms' }
  ];

  const roles = [
    { value: 'all', label: 'All' },
    { value: 'teacher', label: 'Teachers' },
    { value: 'student', label: 'Students' },
    { value: 'parent', label: 'Parents' }
  ];

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' },
    { value: 'starred', label: 'Starred' },
    { value: 'archived', label: 'Archived' }
  ];

  const fetchMessages = async (type) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Clean up query parameters to remove undefined/null values
      const params = {
        type,
        role: filter.role,
        status: filter.status,
        search: filter.search || '',
        ...(filter.startDate && { startDate: filter.startDate.toISOString() }),
        ...(filter.endDate && { endDate: filter.endDate.toISOString() })
      };

      // Filter out undefined/null/empty values
      const queryParams = new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== null && value !== undefined && value !== '')
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      );

      const response = await fetch(getApiUrl(API_ENDPOINTS.MESSAGES.LIST) + `?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch messages');
      }

      const data = await response.json();
      if (data.success) {
        setMessages(prev => ({
          ...prev,
          [type]: data.data
        }));
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to fetch messages'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessageAction = async (messageId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(API_ENDPOINTS.MESSAGES.ACTION(messageId, action)), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`Failed to ${action} message`);

      const data = await response.json();
      if (data.success) {
        // Refresh messages after action
        fetchMessages(tabs[tab].type);
        setAlert({
          severity: 'success',
          message: `Message ${action} successfully`
        });
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || `Failed to ${action} message`
      });
    }
  };

  const handleDownloadAttachment = async (messageId, attachmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        getApiUrl(API_ENDPOINTS.MESSAGES.ATTACHMENT(messageId, attachmentId)),
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to download attachment');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attachment_${attachmentId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to download attachment'
      });
    }
  };

  useEffect(() => {
    fetchMessages(tabs[tab].type);
  }, [tab, filter]);

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    setDrawerOpen(true);
    if (!message.read) {
      handleMessageAction(message.id, 'read');
    }
  };

  const renderMessageList = () => (
    <List>
      {messages[tabs[tab].type].map((message) => (
        <React.Fragment key={message.id}>
          <ListItem
            button
            onClick={() => handleMessageClick(message)}
            sx={{
              bgcolor: message.read ? 'inherit' : 'action.hover',
              '&:hover': { bgcolor: 'action.selected' }
            }}
          >
            <ListItemAvatar>
              <Avatar src={message.sender.avatar}>
                {message.sender.name.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">{message.sender.name}</Typography>
                  <Typography variant="caption">
                    {format(new Date(message.date), 'MMM d, yyyy')}
                  </Typography>
                </Box>
              }
              secondary={
                <Box>
                  <Typography
                    variant="body2"
                    color="textPrimary"
                    sx={{ fontWeight: message.read ? 'normal' : 'bold' }}
                  >
                    {message.subject}
                  </Typography>
                  <Typography variant="caption" noWrap>
                    {message.preview}
                  </Typography>
                </Box>
              }
            />
            {message.starred && <Star color="warning" />}
          </ListItem>
          <Divider variant="inset" component="li" />
        </React.Fragment>
      ))}
    </List>
  );

  const renderMessageDetail = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{ '& .MuiDrawer-paper': { width: '40%' } }}
    >
      {selectedMessage && (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">{selectedMessage.subject}</Typography>
            <Box>
              <IconButton onClick={() => handleMessageAction(selectedMessage.id, 'star')}>
                {selectedMessage.starred ? <Star color="warning" /> : <StarBorder />}
              </IconButton>
              <IconButton onClick={() => handleMessageAction(selectedMessage.id, 'archive')}>
                <Archive />
              </IconButton>
              <IconButton onClick={() => handleMessageAction(selectedMessage.id, 'delete')}>
                <Delete />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={selectedMessage.sender.avatar} sx={{ mr: 2 }}>
              {selectedMessage.sender.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">{selectedMessage.sender.name}</Typography>
              <Typography variant="caption" color="textSecondary">
                {format(new Date(selectedMessage.date), 'PPpp')}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {selectedMessage.content}
          </Typography>
          {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Attachments
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {selectedMessage.attachments.map((attachment) => (
                  <Chip
                    key={attachment.id}
                    label={attachment.name}
                    onClick={() => handleDownloadAttachment(selectedMessage.id, attachment.id)}
                    sx={{ '&:hover': { bgcolor: 'primary.light' } }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Drawer>
  );

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Paper sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            variant="fullWidth"
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>
        
        <Box sx={{ p: 2, display: 'flex', gap: 2, bgcolor: 'background.default' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={filter.role}
              onChange={(e) => setFilter({ ...filter, role: e.target.value })}
              label="Role"
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              label="Status"
            >
              {statuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            placeholder="Search messages..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {renderMessageList()}
        </Box>
      </Paper>
      {renderMessageDetail()}
    </Box>
  );
};

export default Inbox;
