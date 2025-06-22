import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Visibility, Download, Upload, PictureAsPdf, Image } from '@mui/icons-material';
import { getApiUrl } from '../../../config/apiConfig';


const StaffDocuments = ({ onBack }) => {
  const [documents, setDocuments] = useState([]);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentType, setDocumentType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewDialog, setPreviewDialog] = useState({
    open: false,
    document: null
  });

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'identification', label: 'Identification' },
    { value: 'qualification', label: 'Qualifications' },
    { value: 'contract', label: 'Contracts' },
  ];

  useEffect(() => {
    // Fetch staff documents
  }, []);

  const handleFileUpload = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', documentType);

    try {
      const response = await fetch(getApiUrl('/api/admin/staff/documents/upload'), {
        method: 'POST',
        body: formData,
      });
      // Handle response
    } catch (error) {
      // Handle error
    }
  };

  const handleFileView = async (docId) => {
    try {
      const response = await fetch(getApiUrl(`/api/admin/staff/documents/${docId}/view`));
      const blob = await response.blob();
      window.open(URL.createObjectURL(blob));
    } catch (error) {
      // Handle error
    }
  };

  const handlePreview = (document) => {
    setPreviewDialog({
      open: true,
      document
    });
  };

  return (
    <Box>
      <Button onClick={onBack} sx={{ mb: 2 }}>Back to Menu</Button>
      <Typography variant="h6" gutterBottom>Staff Documents</Typography>
      
      <Tabs
        value={selectedCategory}
        onChange={(e, newValue) => setSelectedCategory(newValue)}
        sx={{ mb: 3 }}
      >
        {categories.map(category => (
          <Tab key={category.value} value={category.value} label={category.label} />
        ))}
      </Tabs>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button variant="contained" startIcon={<Upload />} onClick={() => setUploadDialog(true)}>
            Upload New Document
          </Button>
        </Grid>
        
        {documents.map((doc) => (
          <Grid item xs={12} md={4} key={doc.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{doc.name}</Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <IconButton onClick={() => handleFileView(doc.id)}>
                    <Visibility />
                  </IconButton>
                  <IconButton>
                    <Download />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
        <DialogTitle>Upload New Document</DialogTitle>
        <DialogContent>
          {/* Add upload form */}
        </DialogContent>
      </Dialog>

      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, document: null })}
        maxWidth="md"
        fullWidth
      >
        {/* Add document preview content */}
      </Dialog>
    </Box>
  );
};

export default StaffDocuments;
