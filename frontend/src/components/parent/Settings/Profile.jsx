// src/components/parent/Settings/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Paper, Grid, TextField, Avatar, Button, Typography,
    CircularProgress, Snackbar, Alert, Divider, Card, CardContent,
    IconButton, InputAdornment, Badge, List, ListItem, ListItemText,
    MenuItem, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton as MuiIconButton
} from '@mui/material';
import {
    Edit as EditIcon,
    PhotoCamera,
    Save as SaveIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Home as HomeIcon,
    Work,
    Person as PersonOutline,
    Phone as ContactPhone,
    LocationOn,
    People,
    ContactEmergency,
    Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { getApiUrl } from '../../../config/apiConfig';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)'
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(15),
    height: theme.spacing(15),
    marginBottom: theme.spacing(2),
    border: `4px solid ${theme.palette.primary.main}`,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.primary.main,
        width: 32,
        height: 32,
        borderRadius: '50%',
        '&:hover': {
            backgroundColor: theme.palette.grey[200]
        }
    }
}));

const SectionCard = styled(Card)(({ theme }) => ({
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
    overflow: 'visible',
    borderRadius: theme.shape.borderRadius * 2,
    background: theme.palette.mode === 'dark' 
        ? 'linear-gradient(145deg, #1a237e 0%, #0d47a1 100%)'
        : 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
}));

const CardTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        '&.Mui-disabled': {
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent'
            },
            backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)',
        }
    },
    '& .MuiInputLabel-root': {
        color: theme.palette.text.secondary
    }
}));

const InfoValue = styled(Typography)(({ theme }) => ({
    fontWeight: 500,
    color: theme.palette.primary.main,
    marginTop: theme.spacing(0.5)
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    '& .MuiSvgIcon-root': {
        fontSize: 28,
        color: theme.palette.primary.main
    }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    position: 'relative',
    '&:after': {
        content: '""',
        position: 'absolute',
        bottom: -8,
        left: 0,
        width: 40,
        height: 3,
        backgroundColor: theme.palette.primary.main,
        borderRadius: 2
    }
}));

const DetailDialog = ({ open, onClose, title, children }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempData, setTempData] = useState(null);

    useEffect(() => {
        // Reset editing state when dialog opens/closes
        setIsEditing(false);
        setTempData(null);
    }, [open]);

    const handleEdit = () => {
        setIsEditing(true);
        setTempData(children.props.data);
    };

    const handleSave = async () => {
        try {
            await children.props.onSave(tempData);
            setIsEditing(false);
            setTempData(null);
        } catch (error) {
            console.error('Error saving:', error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempData(null);
    };

    // Render field based on edit mode
    const renderField = (label, value, onChange) => (
        <Box mb={2}>
            <Typography variant="subtitle2" color="textSecondary">
                {label}
            </Typography>
            {isEditing ? (
                <TextField
                    fullWidth
                    value={value}
                    onChange={onChange}
                    size="small"
                />
            ) : (
                <Typography variant="body1">{value || 'Not specified'}</Typography>
            )}
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{title}</Typography>
                    <Box>
                        {!isEditing ? (
                            <Button
                                startIcon={<EditIcon />}
                                onClick={handleEdit}
                                color="primary"
                            >
                                Edit
                            </Button>
                        ) : (
                            <>
                                <Button
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    sx={{ mr: 1 }}
                                    color="primary"
                                >
                                    Save
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    color="error"
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {React.cloneElement(children, {
                    isEditing,
                    data: isEditing ? tempData : children.props.data,
                    onChange: setTempData,
                    renderField
                })}
            </DialogContent>
        </Dialog>
    );
};

// Define section components before using them
const BasicInfoSection = ({ isEditing, data, onChange, renderField }) => (
    <Grid container spacing={3}>
        <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">Personal Details</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    {renderField("Full Name", data?.personalInfo?.name, (e) => 
                        onChange({...data, personalInfo: { ...data.personalInfo, name: e.target.value }})
                    )}
                    {renderField("Email", data?.personalInfo?.email, null)}
                    {renderField("Phone Number", data?.personalInfo?.phone, (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, phone: e.target.value }})
                    )}
                    {renderField("Alternate Contact", data?.personalInfo?.alternateContact, (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, alternateContact: e.target.value }})
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderField("Nationality", data?.personalInfo?.nationality, (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, nationality: e.target.value }})
                    )}
                    {renderField("Religion", data?.personalInfo?.religion, (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, religion: e.target.value }})
                    )}
                    {renderField("Marital Status", data?.personalInfo?.maritalStatus, (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, maritalStatus: e.target.value }})
                    )}
                    {renderField("Relationship to Student", data?.personalInfo?.relationship, (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, relationship: e.target.value }})
                    )}
                </Grid>
            </Grid>
        </Grid>
    </Grid>
);

const ProfessionalSection = ({ isEditing, data, onChange, renderField }) => (
    <Grid container spacing={3}>
        <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">Professional Information</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    {renderField("Occupation", data?.personalInfo?.occupation, (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, occupation: e.target.value }})
                    )}
                    {renderField("Employer", data?.personalInfo?.employer, (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, employer: e.target.value }})
                    )}
                    {renderField("Annual Income", data?.personalInfo?.annualIncome, (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, annualIncome: e.target.value }})
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderField("Education", data?.personalInfo?.education, (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, education: e.target.value }})
                    )}
                    {renderField("Office Location", data?.contactInfo?.officeAddress, (e) =>
                        onChange({...data, contactInfo: { ...data.contactInfo, officeAddress: e.target.value }})
                    )}
                    {renderField("Work Experience (Years)", data?.personalInfo?.workExperience, (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, workExperience: e.target.value }})
                    )}
                </Grid>
                <Grid item xs={12}>
                    {renderField("Professional Skills", data?.personalInfo?.skills?.join(', '), (e) =>
                        onChange({...data, personalInfo: { ...data.personalInfo, skills: e.target.value.split(',').map(s => s.trim()) }})
                    )}
                </Grid>
            </Grid>
        </Grid>
    </Grid>
);

const ContactSection = ({ isEditing, data, onChange, renderField }) => (
    <Grid container spacing={3}>
        <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">Contact & Address Information</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    {renderField("Email", data?.contactInfo?.email, null)}
                    {renderField("Primary Phone", data?.contactInfo?.phone, (e) =>
                        onChange({...data, contactInfo: { ...data.contactInfo, phone: e.target.value }})
                    )}
                    {renderField("Alternative Phone", data?.contactInfo?.alternatePhone, (e) =>
                        onChange({...data, contactInfo: { ...data.contactInfo, alternatePhone: e.target.value }})
                    )}
                    {renderField("Preferred Contact Time", data?.contactInfo?.preferredContactTime, (e) =>
                        onChange({...data, contactInfo: { ...data.contactInfo, preferredContactTime: e.target.value }})
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderField("Residential Address", data?.contactInfo?.address, (e) =>
                        onChange({...data, contactInfo: { ...data.contactInfo, address: e.target.value }})
                    )}
                    {renderField("City", data?.contactInfo?.city, (e) =>
                        onChange({...data, contactInfo: { ...data.contactInfo, city: e.target.value }})
                    )}
                    {renderField("State", data?.contactInfo?.state, (e) =>
                        onChange({...data, contactInfo: { ...data.contactInfo, state: e.target.value }})
                    )}
                    {renderField("Pincode", data?.contactInfo?.pincode, (e) =>
                        onChange({...data, contactInfo: { ...data.contactInfo, pincode: e.target.value }})
                    )}
                </Grid>
            </Grid>
        </Grid>
    </Grid>
);

const EmergencySection = ({ isEditing, data, onChange, renderField }) => (
    <Grid container spacing={3}>
        <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">Emergency Contact Details</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    {renderField("Contact Name", data?.emergencyContact?.name, (e) =>
                        onChange({...data, emergencyContact: { ...data.emergencyContact, name: e.target.value }})
                    )}
                    {renderField("Relationship", data?.emergencyContact?.relationship, (e) =>
                        onChange({...data, emergencyContact: { ...data.emergencyContact, relationship: e.target.value }})
                    )}
                    {renderField("Phone Number", data?.emergencyContact?.phone, (e) =>
                        onChange({...data, emergencyContact: { ...data.emergencyContact, phone: e.target.value }})
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                    {renderField("Alternative Phone", data?.emergencyContact?.alternatePhone, (e) =>
                        onChange({...data, emergencyContact: { ...data.emergencyContact, alternatePhone: e.target.value }})
                    )}
                    {renderField("Address", data?.emergencyContact?.address, (e) =>
                        onChange({...data, emergencyContact: { ...data.emergencyContact, address: e.target.value }})
                    )}
                    {renderField("Medical Information", data?.emergencyContact?.medicalInfo, (e) =>
                        onChange({...data, emergencyContact: { ...data.emergencyContact, medicalInfo: e.target.value }})
                    )}
                </Grid>
            </Grid>
        </Grid>
    </Grid>
);

const ChildrenSection = ({ isEditing, data, onChange, renderField }) => (
    <Grid container spacing={3}>
        <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">Children Information</Typography>
            {data.children?.map((child, index) => (
                <Box key={child.id} sx={{ mb: 2 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    {renderField("Student Name", child.name)}
                                    {renderField("Class", child.class)}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    {renderField("Section", child.section)}
                                    {renderField("Roll Number", child.rollNumber)}
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            ))}
        </Grid>
    </Grid>
);

const Profile = () => {
    const [profile, setProfile] = useState({
        personalInfo: {
            name: '',
            email: '',
            phone: '',
            alternateContact: '',
            occupation: '',
            employer: '',
            education: '',
            annualIncome: '',
            nationality: '',
            religion: '',
            maritalStatus: '',
            relationship: '', // Father/Mother/Guardian
        },
        contactInfo: {
            address: '',
            city: '',
            state: '',
            pincode: '',
            officeAddress: ''
        },
        emergencyContact: {
            name: '',
            relationship: '',
            phone: '',
            address: ''
        },
        children: [],
        avatar: null
    });

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                getApiUrl('/api/v1/parent/settings/profile'),
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                setProfile(response.data.data);
            }
        } catch (error) {
            setAlert({
                severity: 'error',
                message: error.response?.data?.message || 'Error fetching profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpdate = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                getApiUrl('/api/v1/parent/settings/profile/avatar'),
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                setProfile(prev => ({
                    ...prev,
                    avatar: response.data.data.avatarUrl
                }));
                setAlert({
                    severity: 'success',
                    message: 'Avatar updated successfully'
                });
            }
        } catch (error) {
            setAlert({
                severity: 'error',
                message: 'Error updating avatar'
            });
        }
    };

    const handleSectionClick = (section) => {
        setSelectedSection(section);
    };

    const handleSectionSave = async (section, data) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.put(
                getApiUrl(`/api/v1/parent/settings/profile/${section}`),
                data,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setProfile(prev => ({ ...prev, [section]: data }));
            setAlert({
                severity: 'success',
                message: 'Section updated successfully'
            });
        } catch (error) {
            setAlert({
                severity: 'error',
                message: error.response?.data?.message || 'Error updating section'
            });
            throw error;
        }
    };

    const renderSectionDialog = () => {
        if (!selectedSection) return null;

        const sections = {
            basic: BasicInfoSection,
            professional: ProfessionalSection,
            contact: ContactSection,       // Combined contact and address
            emergency: EmergencySection,
            children: ChildrenSection      // Add this new section
        };

        const SectionComponent = sections[selectedSection];
        if (!SectionComponent) return null;
        
        return (
            <DetailDialog
                open={!!selectedSection}
                onClose={() => setSelectedSection(null)}
                title={`${selectedSection?.charAt(0).toUpperCase()}${selectedSection?.slice(1)} Details`}
            >
                <SectionComponent 
                    data={profile}
                    onSave={(data) => handleSectionSave(selectedSection, data)}
                />
            </DetailDialog>
        );
    };

    const renderSection = (title, sectionKey, icon) => (
        <SectionCard elevation={3} onClick={() => handleSectionClick(sectionKey)} sx={{ cursor: 'pointer' }}>
            <CardContent sx={{ p: 3 }}>
                <SectionHeader>
                    {icon}
                    <SectionTitle variant="h6">{title}</SectionTitle>
                </SectionHeader>

                {/* Basic Info Section */}
                {sectionKey === 'basic' && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
                                <InfoValue>{profile.personalInfo?.name || 'Not specified'}</InfoValue>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                                <InfoValue>{profile.personalInfo?.email || 'Not specified'}</InfoValue>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                                <InfoValue>{profile.personalInfo?.phone || 'Not specified'}</InfoValue>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Relationship</Typography>
                                <InfoValue>{profile.personalInfo?.relationship || 'Not specified'}</InfoValue>
                            </Box>
                        </Grid>
                    </Grid>
                )}

                {/* Professional Details Section */}
                {sectionKey === 'professional' && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Occupation</Typography>
                                <InfoValue>{profile.personalInfo?.occupation || 'Not specified'}</InfoValue>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Employer</Typography>
                                <InfoValue>{profile.personalInfo?.employer || 'Not specified'}</InfoValue>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Education</Typography>
                                <InfoValue>{profile.personalInfo?.education || 'Not specified'}</InfoValue>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Annual Income</Typography>
                                <InfoValue>{profile.personalInfo?.annualIncome || 'Not specified'}</InfoValue>
                            </Box>
                        </Grid>
                    </Grid>
                )}

                {/* Contact & Address Section */}
                {sectionKey === 'contact' && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Primary Phone</Typography>
                                <InfoValue>{profile.contactInfo?.phone || 'Not specified'}</InfoValue>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                                <InfoValue>{profile.contactInfo?.email || 'Not specified'}</InfoValue>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                                <InfoValue>{profile.contactInfo?.address || 'Not specified'}</InfoValue>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">City</Typography>
                                <InfoValue>{profile.contactInfo?.city || 'Not specified'}</InfoValue>
                            </Box>
                        </Grid>
                    </Grid>
                )}

                {/* Emergency Contact Section */}
                {sectionKey === 'emergency' && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Emergency Contact</Typography>
                                <InfoValue>{profile.emergencyContact?.name || 'Not specified'}</InfoValue>
                            </Box>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Relationship</Typography>
                                <InfoValue>{profile.emergencyContact?.relationship || 'Not specified'}</InfoValue>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box mb={2}>
                                <Typography variant="subtitle2" color="textSecondary">Emergency Phone</Typography>
                                <InfoValue>{profile.emergencyContact?.phone || 'Not specified'}</InfoValue>
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="textSecondary">Emergency Address</Typography>
                                <InfoValue>{profile.emergencyContact?.address || 'Not specified'}</InfoValue>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </CardContent>
        </SectionCard>
    );

    // Update the main grid layout
    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <StyledPaper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h5" gutterBottom>Parent Profile</Typography>

                {/* Avatar Section */}
                <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
                    <StyledBadge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                            <IconButton
                                component="label"
                                sx={{ 
                                    bgcolor: 'background.paper',
                                    boxShadow: 1
                                }}
                            >
                                <input
                                    hidden
                                    accept="image/*"
                                    type="file"
                                    onChange={handleAvatarUpdate}
                                    ref={fileInputRef}
                                />
                                <PhotoCamera />
                            </IconButton>
                        }
                    >
                        <ProfileAvatar src={profile.avatar} />
                    </StyledBadge>
                </Grid>

                {/* Main Profile Content */}
                <Grid container spacing={3} sx={{ mt: 3 }}>
                    {/* Basic Information */}
                    <Grid item xs={12} md={6}>
                        {renderSection(
                            "Basic Information",
                            "basic",
                            <PersonOutline color="primary" />
                        )}
                    </Grid>

                    {/* Professional Details - Simple Card */}
                    <Grid item xs={12} md={6}>
                        <SectionCard 
                            elevation={3} 
                            onClick={() => handleSectionClick('professional')}
                            sx={{ cursor: 'pointer' }}
                        >
                            <CardContent>
                                <SectionHeader>
                                    <Work color="primary" />
                                    <SectionTitle variant="h6">Professional Details</SectionTitle>
                                </SectionHeader>
                                <Typography variant="body2" color="textSecondary">
                                    Click to view and edit professional information
                                </Typography>
                            </CardContent>
                        </SectionCard>
                    </Grid>

                    {/* Contact Information - Simple Card */}
                    <Grid item xs={12} md={6}>
                        <SectionCard 
                            elevation={3} 
                            onClick={() => handleSectionClick('contact')}
                            sx={{ cursor: 'pointer' }}
                        >
                            <CardContent>
                                <SectionHeader>
                                    <ContactPhone color="primary" />
                                    <SectionTitle variant="h6">Contact & Address</SectionTitle>
                                </SectionHeader>
                                <Typography variant="body2" color="textSecondary">
                                    Click to view and edit contact information
                                </Typography>
                            </CardContent>
                        </SectionCard>
                    </Grid>

                    {/* Emergency Contact - Simple Card */}
                    <Grid item xs={12} md={6}>
                        <SectionCard 
                            elevation={3} 
                            onClick={() => handleSectionClick('emergency')}
                            sx={{ cursor: 'pointer' }}
                        >
                            <CardContent>
                                <SectionHeader>
                                    <ContactEmergency color="primary" />
                                    <SectionTitle variant="h6">Emergency Contact</SectionTitle>
                                </SectionHeader>
                                <Typography variant="body2" color="textSecondary">
                                    Click to view and edit emergency contact details
                                </Typography>
                            </CardContent>
                        </SectionCard>
                    </Grid>

                    {/* Children Information */}
                    {profile.children?.length > 0 && (
                        <Grid item xs={12}>
                            <SectionCard elevation={3} onClick={() => handleSectionClick('children')}>
                                <CardContent>
                                    <SectionHeader>
                                        <People color="primary" />
                                        <SectionTitle variant="h6">Children Information</SectionTitle>
                                    </SectionHeader>
                                    <Grid container spacing={2}>
                                        {profile.children.map((child) => (
                                            <Grid item xs={12} md={4} key={child.id}>
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="subtitle1">
                                                            {child.name}
                                                        </Typography>
                                                        <Typography color="textSecondary">
                                                            Class {child.class} - Section {child.section}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </SectionCard>
                        </Grid>
                    )}
                </Grid>

                {/* Alert Snackbar */}
                <Snackbar
                    open={alert !== null}
                    autoHideDuration={6000}
                    onClose={() => setAlert(null)}
                >
                    <Alert
                        onClose={() => setAlert(null)}
                        severity={alert?.severity}
                    >
                        {alert?.message}
                    </Alert>
                </Snackbar>

                {/* Loading Overlay */}
                {loading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            zIndex: 1000
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
                {renderSectionDialog()}
            </StyledPaper>
        </Box>
    );
};

export default Profile;