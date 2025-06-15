import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import './styles/SectionManager.css';

const ActivitiesManager = () => {
  const menuItems = [
    { title: 'Clubs', path: 'clubs', icon: '👥' },
    { title: 'Workshops', path: 'workshops', icon: '🛠️' },
    { title: 'Inter House', path: 'inter-house', icon: '🏆' },
    { title: 'Assemblies', path: 'assemblies', icon: '📢' },
    { title: 'Sports', path: 'sports', icon: '⚽' },
    { title: 'Cultural', path: 'cultural', icon: '🎭' }
  ];

  return (
    <AdminLayout title="Activities Section Management">
      <div className="section-grid">
        {menuItems.map(item => (
          <Link 
            key={item.path} 
            to={`/admin/activities/${item.path}`} 
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

export default ActivitiesManager;
