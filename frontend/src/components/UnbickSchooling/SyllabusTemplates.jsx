import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Delete, Edit, Add } from '@mui/icons-material';

const SyllabusTemplates = ({ open, onClose, onSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [categories, setCategories] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // Fetch categories and permissions from the server
    const fetchData = async () => {
      try {
        const categoriesResponse = await fetch('/api/syllabus/categories');
        const permissionsResponse = await fetch('/api/syllabus/permissions');
        setCategories(await categoriesResponse.json());
        setPermissions(await permissionsResponse.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleAddTemplate = () => {/* Implementation */};
  const handleEditTemplate = (template) => {/* Implementation */};
  const handleDeleteTemplate = (templateId) => {/* Implementation */};

  const handleImport = async (file) => {
    const formData = new FormData();
    formData.append('template', file);
    try {
      const response = await fetch('/api/syllabus/templates/import', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setTemplates([...templates, data]);
    } catch (error) {
      console.error('Error importing template:', error);
    }
  };

  const handleShareTemplate = async (templateId, users) => {
    try {
      await fetch(`/api/syllabus/templates/${templateId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users })
      });
    } catch (error) {
      console.error('Error sharing template:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Syllabus Templates</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            {/* Template list and editor */}
            <List>
              {templates.map(template => (
                <ListItem key={template.id}>
                  <ListItemText primary={template.name} />
                  <IconButton onClick={() => handleEditTemplate(template)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteTemplate(template.id)}>
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            <Button startIcon={<Add />} onClick={handleAddTemplate}>
              Add Template
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Template Settings</Typography>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="h6" sx={{ mt: 2 }}>Permissions</Typography>
                <List>
                  {permissions.map(permission => (
                    <ListItem key={permission.id}>
                      <ListItemText primary={permission.name} />
                      <IconButton onClick={() => handleShareTemplate(selectedTemplate.id, permission.users)}>
                        <Add />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSelect(selectedTemplate)}>Use Template</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SyllabusTemplates;
