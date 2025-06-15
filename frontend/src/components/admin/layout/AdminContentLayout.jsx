import React from 'react';
import { Box, Paper } from '@mui/material';
import PreviewModal from '../../common/PreviewModal';
import ValidationErrors from '../../common/ValidationErrors';
import './styles/AdminContentLayout.css';

const AdminContentLayout = ({ children, pageTitle, errors }) => {
  return (
    <Box className="admin-content-layout">
      <Paper elevation={3} className="content-paper">
        {errors && <ValidationErrors errors={errors} />}
        {children}
      </Paper>
    </Box>
  );
};

export default AdminContentLayout;
