// src/components/auth/header.jsx
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const { settings } = useSettings();

  // Don't render header on homepage and login page
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: settings.appearance?.themeColor 
      }}
    >
      <nav>
        <Link to="/">Home</Link>
        {user ? (
          <>
            <span>Welcome, {user.name} ({user.role})</span>
            {user.role === 'admin' && <Link to="/admin/dashboard">Admin Dashboard</Link>}
            {user.role === 'teacher' && <Link to="/teacher/dashboard">Teacher Dashboard</Link>}
            {user.role === 'student' && <Link to="/student/dashboard">Student Dashboard</Link>}
            {user.role === 'parent' && <Link to="/parent/dashboard">Parent Dashboard</Link>}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </AppBar>
  );
};

export default Header;