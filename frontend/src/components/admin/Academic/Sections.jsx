import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress
} from '@mui/material';
import {
    Add,
    Edit,
    Delete
} from '@mui/icons-material';

const Sections = () => { 
    const [sections, setSections] = useState([]);
    const [classes, setClasses] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [formData, setFormData] = useState({ id: null, name: '', classId: '', capacity: '30', classTeacher: '' });

    useEffect(() => { 
        fetchSections();
        fetchClasses();
    }, []);

    const fetchClasses = async () => { 
        try { 
            const response = await fetch('/api/v1/admin/academic/classes', { 
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
                    'Content-Type': 'application/json' 
                } 
            });
            if (!response.ok) throw new Error('Failed to fetch classes');
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) { 
                setClasses(result.data);
            } 
        } catch (error) { 
            console.error('Error fetching classes:', error);
            setAlert({ type: 'error', message: 'Error fetching classes' });
            setClasses([]);
        } 
    };

    const fetchSections = async () => { 
        setLoading(true);
        try { 
            const response = await fetch('/api/v1/admin/sections', { 
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, 
                    'Content-Type': 'application/json' 
                } 
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Sections data:', data);
            
            if (data.success && Array.isArray(data.data)) {
                setSections(data.data);
            } else {
                throw new Error('Invalid data structure received');
            }
        } catch (error) { 
            console.error('Error fetching sections:', error);
            setAlert({ type: 'error', message: `Error fetching sections: ${error.message}` });
            setSections([]);
        } finally { 
            setLoading(false);
        } 
    };

    const handleAddSection = () => { 
        setFormData({ id: null, name: '', classId: '', capacity: '30', classTeacher: '' });
        setOpenDialog(true);
    };

    const handleEditSection = (section) => { 
        setFormData({ id: section.id, name: section.name, classId: section.classId, capacity: section.capacity?.toString() || '30', classTeacher: section.classTeacher || '' });
        setOpenDialog(true);
    };

    const handleDeleteSection = async (sectionId) => { 
        if (window.confirm('Are you sure you want to delete this section?')) { 
            try { 
                const response = await fetch(`/api/v1/admin/academic/sections/${sectionId}`, { 
                    method: 'DELETE', 
                    headers: { 
                        'Authorization': `Bearer ${localStorage.getItem('token')}` 
                    } 
                });
                if (!response.ok) throw new Error('Failed to delete section');
                await fetchSections();
                setAlert({ type: 'success', message: 'Section deleted successfully' });
            } catch (error) { 
                setAlert({ type: 'error', message: 'Error deleting section' });
            } 
        } 
    };

    const handleSaveSection = async () => { 
        setLoading(true);
        try { 
            const url = formData.id ? `/api/v1/admin/academic/sections/${formData.id}` : '/api/v1/admin/academic/sections';
            const response = await fetch(url, { 
                method: formData.id ? 'PUT' : 'POST', 
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                }, 
                body: JSON.stringify({ 
                    name: formData.name, 
                    classId: formData.classId, 
                    capacity: parseInt(formData.capacity), 
                    classTeacher: formData.classTeacher 
                }) 
            });
            if (!response.ok) { 
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save section');
            } 
            setOpenDialog(false);
            await fetchSections();
            setAlert({ type: 'success', message: `Section ${formData.id ? 'updated' : 'created'} successfully` });
        } catch (error) { 
            setAlert({ type: 'error', message: `Error saving section: ${error.message}` });
        } finally { 
            setLoading(false);
        } 
    };

    return ( 
        <Box sx={{ width: '100%', p: 3 }}> 
            <Paper elevation={3} sx={{ p: 4 }}> 
                <Typography variant="h5" gutterBottom> Sections Management </Typography> 
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}> 
                    <Button variant="contained" startIcon={<Add />} onClick={handleAddSection} > Add Section </Button> 
                </Box> 
                <TableContainer> 
                    <Table> 
                        <TableHead> 
                            <TableRow> 
                                <TableCell>Name</TableCell> 
                                <TableCell>Class</TableCell> 
                                <TableCell>Class Teacher</TableCell> 
                                <TableCell>Capacity</TableCell> 
                                <TableCell>Actions</TableCell> 
                            </TableRow> 
                        </TableHead> 
                        <TableBody> 
                            {loading ? ( 
                                <TableRow> 
                                    <TableCell colSpan={5} align="center"> 
                                        <CircularProgress size={24} /> 
                                    </TableCell> 
                                </TableRow> 
                            ) : ( 
                                sections.map((section) => ( 
                                    <TableRow key={section.id}> 
                                        <TableCell>{section.name}</TableCell> 
                                        <TableCell>{section.className}</TableCell> 
                                        <TableCell>{section.classTeacher || 'Not Assigned'}</TableCell> 
                                        <TableCell>{section.capacity}</TableCell> 
                                        <TableCell> 
                                            <Button startIcon={<Edit />} onClick={() => handleEditSection(section)} > Edit </Button> 
                                            <Button startIcon={<Delete />} color="error" onClick={() => handleDeleteSection(section.id)} > Delete </Button> 
                                        </TableCell> 
                                    </TableRow> 
                                )) 
                            )} 
                        </TableBody> 
                    </Table> 
                </TableContainer> 
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth > 
                    <DialogTitle> {formData.id ? 'Edit Section' : 'Add New Section'} </DialogTitle> 
                    <DialogContent> 
                        <Grid container spacing={2} sx={{ mt: 1 }}> 
                            <Grid item xs={12}> 
                                <TextField fullWidth label="Section Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /> 
                            </Grid> 
                            <Grid item xs={12}> 
                                <FormControl fullWidth required> 
                                    <InputLabel>Class</InputLabel> 
                                    <Select value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })} label="Class" > 
                                        {Array.isArray(classes) && classes.map((cls) => ( 
                                            <MenuItem key={cls._id || cls.id} value={cls._id || cls.id}> 
                                                {cls.name} 
                                            </MenuItem> 
                                        ))} 
                                    </Select> 
                                </FormControl> 
                            </Grid> 
                            <Grid item xs={12}> 
                                <TextField fullWidth label="Class Teacher" value={formData.classTeacher} onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })} placeholder="Enter class teacher's name" /> 
                            </Grid> 
                            <Grid item xs={12}> 
                                <TextField fullWidth label="Capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} inputProps={{ min: 1, max: 100 }} required /> 
                            </Grid> 
                        </Grid> 
                    </DialogContent> 
                    <DialogActions> 
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button> 
                        <Button variant="contained" onClick={handleSaveSection} disabled={loading} > 
                            {loading ? <CircularProgress size={24} /> : 'Save'} 
                        </Button> 
                    </DialogActions> 
                </Dialog> 
                {alert && ( 
                    <Snackbar open={Boolean(alert)} autoHideDuration={6000} onClose={() => setAlert(null)} > 
                        <Alert onClose={() => setAlert(null)} severity={alert.type} sx={{ width: '100%' }} > 
                            {alert.message} 
                        </Alert> 
                    </Snackbar> 
                )} 
            </Paper> 
        </Box> 
    );
};

export default Sections;
