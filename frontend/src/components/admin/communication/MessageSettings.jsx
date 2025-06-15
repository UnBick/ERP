import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Switch,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Email,
  Sms,
  WhatsApp,
  NotificationsActive,
  Schedule,
  History,
  Settings,
  Send,
  Edit,
  Delete,
  AttachFile,
  Preview,
  SaveAlt,
  Groups,
  School,
  Person,
  ScheduleSend
} from '@mui/icons-material';
import { MESSAGE_ENDPOINTS } from '../../../utils/api';

const MessageSettings = () => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [messageConfig, setMessageConfig] = useState({
    channels: {
      email: true,
      sms: false,
      whatsapp: false,
      portal: true,
    },
    recipients: {
      teachers: false,
      students: false,
      parents: false,
      all: false,
    },
    message: '',
    subject: '',
  });
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [history, setHistory] = useState([]);
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: false,
    autoRespond: false,
    dailyLimit: 1000,
    defaultLanguage: 'english'
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchTemplates();
    fetchMessageHistory();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(MESSAGE_ENDPOINTS.SETTINGS, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      setAlert({
        severity: 'error',
        message: 'Failed to fetch settings'
      });
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(MESSAGE_ENDPOINTS.TEMPLATES, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Fetch templates error:', error);
      setAlert({
        severity: 'error',
        message: 'Failed to fetch templates'
      });
    }
  };

  const fetchMessageHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/admin/messages/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: 'Failed to fetch message history'
      });
    }
  };

  const handleSettingChange = async (setting, value) => {
    try {
      const response = await fetch(MESSAGE_ENDPOINTS.SETTINGS, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ [setting]: value })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update setting');
      }

      const data = await response.json();
      if (data.success) {
        setSettings(prev => ({ ...prev, [setting]: value }));
        setAlert({
          severity: 'success',
          message: 'Setting updated successfully'
        });
      }
    } catch (error) {
      console.error('Update setting error:', error);
      setAlert({
        severity: 'error',
        message: 'Failed to update setting'
      });
    }
  };

  const handleScheduleMessage = async () => {
    try {
      const response = await fetch(MESSAGE_ENDPOINTS.SCHEDULE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...messageConfig,
          scheduleDate: new Date(),
          sender: localStorage.getItem('userId') // Add sender ID
        })
      });

      if (!response.ok) {
        throw new Error('Failed to schedule message');
      }

      const data = await response.json();
      if (data.success) {
        setAlert({
          severity: 'success',
          message: 'Message scheduled successfully'
        });
        setMessageConfig(prev => ({ ...prev, message: '', subject: '' }));
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to schedule message'
      });
    }
  };

  const handleChannelChange = (channel) => {
    setMessageConfig((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel],
      },
    }));
  };

  const handleRecipientChange = (recipient) => {
    if (recipient === 'all') {
      const newValue = !messageConfig.recipients.all;
      setMessageConfig((prev) => ({
        ...prev,
        recipients: {
          teachers: newValue,
          students: newValue,
          parents: newValue,
          all: newValue,
        },
      }));
    } else {
      setMessageConfig((prev) => ({
        ...prev,
        recipients: {
          ...prev.recipients,
          [recipient]: !prev.recipients[recipient],
          all: false,
        },
      }));
    }
  };

  const handleSendMessage = async () => {
    setLoading(true);
    try {
      const response = await fetch(MESSAGE_ENDPOINTS.SEND, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...messageConfig,
          sender: localStorage.getItem('userId')
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      if (data.success) {
        setAlert({
          severity: 'success',
          message: 'Message sent successfully',
        });
        setMessageConfig((prev) => ({ ...prev, message: '', subject: '' }));
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: error.message || 'Failed to send message',
      });
    } finally {
      setLoading(false);
    }
  };

  const previewMessage = () => {
    const selectedChannels = Object.entries(messageConfig.channels)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    const selectedRecipients = Object.entries(messageConfig.recipients)
      .filter(([key, value]) => value && key !== 'all')
      .map(([key]) => key);

    setPreviewData({
      channels: selectedChannels,
      recipients: selectedRecipients,
      subject: messageConfig.subject,
      message: messageConfig.message
    });
    setPreviewOpen(true);
  };

  const handleUseTemplate = (template) => {
    setMessageConfig(prev => ({
      ...prev,
      subject: template.subject,
      message: template.content,
      type: template.type
    }));
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/admin/settings/message-templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        fetchTemplates(); // Refresh templates list
        setAlert({
          severity: 'success',
          message: 'Template deleted successfully'
        });
      }
    } catch (error) {
      setAlert({
        severity: 'error',
        message: 'Failed to delete template'
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Compose
        return (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Communication Channels
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox checked={messageConfig.channels.email} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="small" />
                        <span>Email</span>
                      </Box>
                    }
                    onChange={() => handleChannelChange('email')}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={messageConfig.channels.sms} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Sms fontSize="small" />
                        <span>SMS</span>
                      </Box>
                    }
                    onChange={() => handleChannelChange('sms')}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={messageConfig.channels.whatsapp} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WhatsApp fontSize="small" />
                        <span>WhatsApp</span>
                      </Box>
                    }
                    onChange={() => handleChannelChange('whatsapp')}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={messageConfig.channels.portal} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <NotificationsActive fontSize="small" />
                        <span>Portal</span>
                      </Box>
                    }
                    onChange={() => handleChannelChange('portal')}
                  />
                </FormGroup>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Recipients
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox checked={messageConfig.recipients.all} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Groups fontSize="small" />
                        <span>All</span>
                      </Box>
                    }
                    onChange={() => handleRecipientChange('all')}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={messageConfig.recipients.teachers} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School fontSize="small" />
                        <span>Teachers</span>
                      </Box>
                    }
                    onChange={() => handleRecipientChange('teachers')}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={messageConfig.recipients.students} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        <span>Students</span>
                      </Box>
                    }
                    onChange={() => handleRecipientChange('students')}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={messageConfig.recipients.parents} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        <span>Parents</span>
                      </Box>
                    }
                    onChange={() => handleRecipientChange('parents')}
                  />
                </FormGroup>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Subject"
              value={messageConfig.subject}
              onChange={(e) => setMessageConfig(prev => ({ ...prev, subject: e.target.value }))}
              sx={{ my: 2 }}
            />

            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={messageConfig.message}
              onChange={(e) => setMessageConfig(prev => ({ ...prev, message: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={previewMessage}>
                Preview
              </Button>
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={loading || !messageConfig.message}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Message'}
              </Button>
            </Box>
          </>
        );

      case 1: // Templates
        return (
          <List>
            {templates.map((template) => (
              <ListItem key={template._id}>
                <ListItemText
                  primary={template.name}
                  secondary={template.description}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleUseTemplate(template)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTemplate(template._id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        );

      case 2: // History
        return (
          <List>
            {history.map((record) => (
              <ListItem key={record._id}>
                <ListItemText
                  primary={record.subject}
                  secondary={`Sent to: ${record.recipients} via ${record.channel}`}
                />
                <Typography variant="caption">
                  {new Date(record.sentAt).toLocaleString()}
                </Typography>
              </ListItem>
            ))}
          </List>
        );

      case 3: // Settings
        return (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Channel Settings
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailEnabled}
                        onChange={(e) => handleSettingChange('emailEnabled', e.target.checked)}
                      />
                    }
                    label="Enable Email"
                  />
                  {/* Add more channel settings */}
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  General Settings
                </Typography>
                <TextField
                  fullWidth
                  label="Daily Message Limit"
                  type="number"
                  value={settings.dailyLimit}
                  onChange={(e) => handleSettingChange('dailyLimit', e.target.value)}
                  sx={{ mb: 2 }}
                />
                {/* Add more general settings */}
              </Grid>
            </Grid>
          </Box>
        );
    }
  };

  const renderPreviewDialog = () => (
    <Dialog 
      open={previewOpen} 
      onClose={() => setPreviewOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Preview />
          Message Preview
        </Box>
      </DialogTitle>
      <DialogContent>
        {previewData && (
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Sending via: {previewData.channels.join(', ')}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Recipients: {previewData.recipients.join(', ')}
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {previewData.subject}
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ p: 2, mt: 2, minHeight: '100px', whiteSpace: 'pre-wrap' }}
            >
              {previewData.message}
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setPreviewOpen(false)}>
          Close
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSendMessage}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Send Message'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings /> Message Settings
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab icon={<Send />} label="Compose" />
          <Tab icon={<ScheduleSend />} label="Templates" />
          <Tab icon={<History />} label="History" />
          <Tab icon={<Settings />} label="Settings" />
        </Tabs>

        {renderTabContent()}
        {renderPreviewDialog()}

        {alert && (
          <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert onClose={() => setAlert(null)} severity={alert.severity}>
              {alert.message}
            </Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default MessageSettings;
