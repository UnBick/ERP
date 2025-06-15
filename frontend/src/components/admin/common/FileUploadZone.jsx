import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, LinearProgress, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { CloudUpload, InsertDriveFile, Delete } from '@mui/icons-material';

const FileUploadZone = ({ 
  onUpload, 
  acceptedFiles = ['.pdf', '.doc', '.docx'], 
  maxSize = 5000000,
  maxFiles = 5,
  existingFiles = []
}) => {
  const onDrop = useCallback(files => {
    onUpload(files);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFiles.join(','),
    maxSize,
    maxFiles
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here or click to select'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Accepted files: {acceptedFiles.join(', ')} (Max size: {maxSize / 1000000}MB)
        </Typography>
      </Box>

      {existingFiles.length > 0 && (
        <List>
          {existingFiles.map((file, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" aria-label="delete">
                  <Delete />
                </IconButton>
              }
            >
              <ListItemIcon>
                <InsertDriveFile />
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileUploadZone;