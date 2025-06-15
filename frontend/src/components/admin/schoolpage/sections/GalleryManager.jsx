import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import './styles/SectionManager.css';

const GalleryManager = () => {
  const menuItems = [
    { title: 'Photo Gallery', path: 'photos', icon: '📸' },
    { title: 'Video Gallery', path: 'videos', icon: '🎥' },
    { title: 'Events', path: 'events', icon: '📅' },
    { title: 'News & Media', path: 'news', icon: '📰' }
  ];

  return (
    <AdminLayout title="Gallery Section Management">
      <div className="section-grid">
        {menuItems.map(item => (
          <Link 
            key={item.path} 
            to={`/admin/gallery/${item.path}`} 
            className="section-card"
          >
            <span className="section-icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <span className="edit-label">Edit Content →</span>
            <div className="card-footer">
              <span className="item-count">
                {/* Add count logic here */}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
};

export default GalleryManager;
