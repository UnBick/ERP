import React, { useState } from 'react';
import {
  Box, Paper, Button, Grid, Typography, Card, CardContent, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, LinearProgress, Tabs, Tab, Snackbar, Alert
} from '@mui/material';
import { Visibility, Download, Upload, PictureAsPdf, Image } from '@mui/icons-material';

const categories = [
  { value: 'all', label: 'All Documents' },
  { value: 'identification', label: 'Identification' },
  { value: 'qualification', label: 'Qualifications' },
  { value: 'contract', label: 'Contracts' },
];

const StaffDocuments = ({ onBack }) => {
  const [documents, setDocuments] = useState([]);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentType, setDocumentType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewDialog, setPreviewDialog] = useState({ open: false, document: null });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async () => {
    if (!selectedFile || !documentType) {
      setAlert({ type: 'error', message: 'Please select a file and document type.' });
      return;
    }
    setLoading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', documentType);
      const response = await fetch('/api/admin/staff/documents/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      setAlert({ type: 'success', message: 'Document uploaded successfully' });
      setUploadDialog(false);
      setSelectedFile(null);
      setDocumentType('');
      // Optionally refresh documents list here
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleFileView = async (docId) => {
    try {
      const response = await fetch(`/api/admin/staff/documents/${docId}/view`);
      const blob = await response.blob();
      window.open(URL.createObjectURL(blob));
    } catch (error) {
      setAlert({ type: 'error', message: 'Error viewing document' });
    }
  };

  const handlePreview = (document) => {
    setPreviewDialog({ open: true, document });
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <Button onClick={onBack} sx={{ mb: 2 }}>Back to Menu</Button>
        <Typography variant="h6" gutterBottom>Staff Documents</Typography>
        <Tabs value={selectedCategory} onChange={(e, newValue) => setSelectedCategory(newValue)} sx={{ mb: 3 }}>
          {categories.map(category => (
            <Tab key={category.value} value={category.value} label={category.label} />
          ))}
        </Tabs>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Button variant="contained" startIcon={<Upload />} onClick={() => setUploadDialog(true)}>
              Upload New Document
            </Button>
          </Grid>
          {documents.length === 0 && (
            <Grid item xs={12}><Typography color="text.secondary">No documents found.</Typography></Grid>
          )}
          {documents.map((doc) => (
            <Grid item xs={12} md={4} key={doc.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{doc.name}</Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => handleFileView(doc.id)}><Visibility /></IconButton>
                    <IconButton><Download /></IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
          <DialogTitle>Upload New Document</DialogTitle>
          <DialogContent>
            <Box sx={{ my: 2 }}>
              <input type="file" onChange={e => setSelectedFile(e.target.files[0])} />
            </Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Document Type</InputLabel>
              <Select value={documentType} label="Document Type" onChange={e => setDocumentType(e.target.value)}>
                <MenuItem value="">Select Type</MenuItem>
                <MenuItem value="identification">Identification</MenuItem>
                <MenuItem value="qualification">Qualification</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
              </Select>
            </FormControl>
            {loading && <LinearProgress variant="determinate" value={uploadProgress} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
            <Button onClick={handleFileUpload} variant="contained" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={previewDialog.open} onClose={() => setPreviewDialog({ open: false, document: null })} maxWidth="md" fullWidth>
          <DialogTitle>Document Preview</DialogTitle>
          <DialogContent>
            {previewDialog.document ? (
              <Box>
                <Typography variant="subtitle1">{previewDialog.document.name}</Typography>
                {/* Add preview logic here, e.g., PDF/Image preview */}
                <Typography color="text.secondary">Preview not implemented.</Typography>
              </Box>
            ) : (
              <Typography>No document selected.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialog({ open: false, document: null })}>Close</Button>
          </DialogActions>
        </Dialog>
        {alert && (
          <Snackbar open={!!alert} autoHideDuration={6000} onClose={() => setAlert(null)}>
            <Alert severity={alert.type} onClose={() => setAlert(null)}>{alert.message}</Alert>
          </Snackbar>
        )}
      </Paper>
    </Box>
  );
};

export default StaffDocuments;
