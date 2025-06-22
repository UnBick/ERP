import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Edit,
  Preview,
  CheckCircle,
  Settings,
  Add,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../../config/apiConfig';

const TemplateList = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState({
    idcard: [],
    reportcard: [],
    certificate: [],
    admission: []
  });
  const [documentTypes, setDocumentTypes] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [alert, setAlert] = useState(null);

  const defaultDocTypes = [
    { id: 'idcard', name: 'Student ID Card', currentTemplate: null },
    { id: 'reportcard', name: 'Report Card', currentTemplate: null },
    { id: 'certificate', name: 'Certificate', currentTemplate: null },
    { id: 'admission', name: 'Admission Form', currentTemplate: null }
  ];

  useEffect(() => {
    defaultDocTypes.forEach(docType => {
      fetchTemplates(docType.id);
    });
    fetchDocumentTypes();
  }, []);

  const fetchTemplates = async (type) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/settings/templates/type/${type}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setTemplates(prevTemplates => ({
          ...prevTemplates,
          [type]: data.data
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch templates');
      }
    } catch (error) {
      console.error(`Error fetching ${type} templates:`, error);
      setFetchError('Failed to fetch templates: ' + error.message);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      // Replace with actual API call when implemented
      setDocumentTypes(defaultDocTypes);
    } catch (error) {
      console.error('Error fetching document types:', error);
    }
  };

  const handleEditTemplate = (template) => {
    if (!template || !template.template) {
      console.error('Invalid template data:', template);
      return;
    }

    navigate('/admin/settings/design', { 
      state: { 
        editMode: true,
        template: {
          id: template.id,
          name: template.name,
          type: template.type,
          html: template.template?.html || '',  // Safely access nested property
          css: template.template?.css || '',    // Safely access nested property
          isDefault: template.isActive
        }
      }
    });
  };

  const handleCreateTemplate = () => {
    navigate('/admin/settings/design'); // Change to navigate to design page
  };

  const handleSetActive = async (templateId, docType) => {
    try {
      const response = await fetch(getApiUrl('/api/v1/settings/templates/set-active'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId,
          documentType: docType
        })
      });

      if (!response.ok) throw new Error('Failed to set active template');

      const data = await response.json();
      if (data.success) {
        // Update local templates state
        setTemplates(prevTemplates => ({
          ...prevTemplates,
          [docType]: prevTemplates[docType].map(template => ({
            ...template,
            isActive: template.id === templateId
          }))
        }));
        
        // Show success message
        setAlert({ type: 'success', message: 'Template set as active successfully' });
      }
    } catch (error) {
      console.error('Error setting active template:', error);
      setAlert({ type: 'error', message: error.message || 'Error setting active template' });
    }
  };

  useEffect(() => {
    // Check if any template type has no active template
    Object.entries(templates).forEach(([type, templateList]) => {
      if (templateList.length > 0 && !templateList.some(t => t.isActive)) {
        // Set first template as active by default
        handleSetActive(templateList[0].id, type);
      }
    });
  }, [templates]);

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setOpenDialog(true);
  };

  const DefaultImage = () => (
    <Box
      sx={{
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        color: 'text.secondary'
      }}
    >
      <Typography variant="body2">Template Preview</Typography>
    </Box>
  );

  const PreviewCard = ({ template }) => (
    <Box 
      sx={{ 
        width: '100%', 
        height: '200px',  
        overflow: 'hidden', 
        position: 'relative',
        border: '1px solid #eee',
        borderRadius: '4px'
      }}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: template.template.html
            .replace('{{schoolLogo}}', '/images/school-logo.png')
            .replace('{{schoolName}}', 'Demo School')
            .replace('{{studentPhoto}}', '/images/default-student.png')
            .replace('{{studentId}}', 'DEMO001')
            .replace('{{studentName}}', 'John Doe')
            .replace('{{className}}', 'Class X')
            .replace('{{dateOfBirth}}', '01/01/2000')
            .replace('{{address}}', 'Demo Address')
            .replace('{{phoneNumber}}', '1234567890')
            .replace('{{barcode}}', '')
            .replace('{{principalSignature}}', 'Principal')
        }}
        style={{
          transform: 'scale(0.45)',
          transformOrigin: 'top left',
          width: '450px' // Match the template width
        }}
      />
      <style>{template.template.css}</style>
    </Box>
  );

  return (
    <Box sx={{ 
      p: 3,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}> 
          Document Templates
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateTemplate}
          sx={{
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          Create New Template
        </Button>
      </Box>

      {/* Document Type Sections */}
      {documentTypes.map((docType) => (
        <Box key={docType.id} sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {docType.name}
          </Typography>
          <Grid container spacing={3}>
            {templates[docType.id]?.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card 
                  sx={{ 
                    position: 'relative', 
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      transition: 'all 0.3s ease'
                    },
                    border: template.isActive ? '2px solid #4caf50' : 'none'
                  }}
                >
                  <CardMedia
                    component="div"
                    sx={{ height: 200 }}
                  >
                    <PreviewCard template={template} />
                  </CardMedia>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center', 
                      mb: 1
                    }}>
                      <Typography variant="h6">
                        {template.name}
                      </Typography>
                      {template.isActive && (
                        <Chip
                          size="small"
                          color="success"
                          label="Active"
                          icon={<CheckCircle />}
                        />
                      )}
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Template">
                        <IconButton 
                          onClick={() => handleEditTemplate(template)}
                          size="small"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Preview">
                        <IconButton
                          onClick={() => handlePreview(template)}
                          size="small"
                        >
                          <Preview />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={template.isActive ? 'Active Template' : 'Set as Active'}>
                        <IconButton
                          onClick={() => handleSetActive(template.id, docType.id)}
                          color={template.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{
                            bgcolor: template.isActive ? 'success.light' : 'transparent',
                            '&:hover': {
                              bgcolor: template.isActive ? 'success.main' : 'action.hover'
                            }
                          }}
                        >
                          {template.isActive ? 
                            <CheckCircle /> : 
                            <RadioButtonUnchecked />
                          }
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Preview Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Template Preview
          <Typography variant="subtitle2" color="text.secondary">
            {selectedTemplate?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box sx={{ 
              width: '100%', 
              border: '1px solid #ddd',
              borderRadius: 1,
              overflow: 'hidden',
              p: 2,
              bgcolor: '#f5f5f5'
            }}>
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedTemplate.template.html
                    .replace('{{schoolLogo}}', '/images/school-logo.png')
                    .replace('{{schoolName}}', 'Demo School')
                    .replace('{{studentPhoto}}', '/images/default-student.png')
                    .replace('{{studentId}}', 'DEMO001')
                    .replace('{{studentName}}', 'John Doe')
                    .replace('{{className}}', 'Class X')
                    .replace('{{dateOfBirth}}', '01/01/2000')
                    .replace('{{address}}', 'Demo Address')
                    .replace('{{phoneNumber}}', '1234567890')
                    .replace('{{barcode}}', '')
                    .replace('{{principalSignature}}', 'Principal')
                }}
              />
              <style>{selectedTemplate.template.css}</style>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          <Button 
            variant="contained"
            onClick={() => {
              setOpenDialog(false);
              handleEditTemplate(selectedTemplate.id);
            }}
          >
            Edit Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for alerts */}
      {alert && (
        <Snackbar 
          open={!!alert} 
          autoHideDuration={6000} 
          onClose={() => setAlert(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setAlert(null)} 
            severity={alert.type}
            elevation={6}
            variant="filled"
          >
            {alert.message}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default TemplateList;
