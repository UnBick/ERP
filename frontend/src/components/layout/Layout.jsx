import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import './styles.css';

const Layout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="layout-container">
      <Sidebar 
        isCollapsed={isCollapsed} 
        toggleSidebar={handleToggleSidebar}
      />
      <main className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;