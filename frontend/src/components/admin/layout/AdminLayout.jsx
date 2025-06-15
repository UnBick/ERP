import React from 'react';
import { Box } from '@mui/material';
import Sidebar from '../../common/Sidebar';
import './styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
