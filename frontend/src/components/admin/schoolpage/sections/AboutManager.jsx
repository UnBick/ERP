import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import './styles/SectionManager.css';

const AboutManager = () => {
  const menuItems = [
    { title: 'About School', path: 'school', icon: '🏫' },
    { title: "Principal's Message", path: 'principal-message', icon: '👨‍💼' },
    { title: 'Philosophy & Mission', path: 'philosophy-mission', icon: '🎯' },
    { title: 'Infrastructure', path: 'infrastructure', icon: '🏢' },
    { title: 'Student Council', path: 'student-council', icon: '👥' },
    { title: 'Awards', path: 'awards', icon: '🏆' },
    { title: 'Mandatory Disclosure', path: 'disclosure', icon: '📋' }
  ];

  return (
    <AdminLayout title="About Section Management">
      <div className="section-grid">
        {menuItems.map(item => (
          <Link 
            key={item.path} 
            to={`/admin/about/${item.path}`} 
            className="section-card"
          >
            <span className="section-icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <span className="edit-label">Edit Content →</span>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AboutManager;
