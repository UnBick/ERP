import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import { toast } from 'react-toastify';
import './styles/SectionManager.css';

const HomePageManager = () => {
  const [sectionsStatus, setSectionsStatus] = useState({});
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { 
      title: 'Hero Section', 
      path: 'hero',
      icon: '🎯',
      description: 'Main banner and welcome message',
      component: 'HeroEditor',
      status: 'required'
    },
    { 
      title: 'Announcements & Notices', 
      path: 'notices', 
      icon: '📢',
      description: 'School announcements and important notices',
      component: 'NoticeEditor',
      status: 'required'
    },
    { 
      title: 'Photo Gallery', 
      path: 'gallery', 
      icon: '📸',
      description: 'Showcase school events and activities',
      component: 'GalleryEditor',
      status: 'optional'
    },
    { 
      title: 'Achievements', 
      path: 'achievements', 
      icon: '🏆',
      description: 'School and student achievements',
      component: 'AchievementEditor',
      status: 'optional'
    },
    { 
      title: 'Highlights', 
      path: 'highlights', 
      icon: '✨',
      description: 'School achievements and features'
    },

    { 
      title: 'Events Calendar', 
      path: 'calendar', 
      icon: '📅',
      description: 'Upcoming events and activities'
    },
    { 
      title: 'Stats Counter', 
      path: 'stats', 
      icon: '📊',
      description: 'School statistics and numbers'
    },
    
  ];

  useEffect(() => {
    fetchSectionsStatus();
  }, []);

  const fetchSectionsStatus = async () => {
    try {
      const response = await fetch('/api/admin/homepage/sections-status');
      const data = await response.json();
      setSectionsStatus(data);
    } catch (error) {
      toast.error('Failed to load sections status');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    window.open('/preview/homepage', '_blank');
  };

  const handlePublish = async () => {
    try {
      await fetch('/api/admin/homepage/publish', { method: 'POST' });
      toast.success('Changes published successfully');
    } catch (error) {
      toast.error('Failed to publish changes');
    }
  };

  const handleSectionClick = (item) => {
    if (!sectionsStatus[item.path]?.isConfigured && item.status === 'required') {
      toast.warning(`${item.title} needs to be configured before publishing`);
    }
  };

  return (
    <AdminLayout title="Homepage Content Management">
      <div className="section-manager">
        <div className="section-header">
          <h2>Homepage Sections</h2>
          <p>Manage different sections of your homepage</p>
        </div>

        <div className="section-grid">
          {menuItems.map(item => (
            <Link 
              key={item.path} 
              to={`/admin/homepage/editor/${item.path}`} 
              className={`section-card ${item.status}`}
              onClick={() => handleSectionClick(item)}
            >
              <div className="card-header">
                <span className="section-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                {item.status === 'required' && (
                  <span className="required-badge">Required</span>
                )}
              </div>
              
              <p className="section-description">{item.description}</p>
              
              <div className="card-footer">
                <span className="edit-label">
                  {sectionsStatus[item.path]?.isConfigured ? 'Edit Section' : 'Configure'}
                </span>
                <span className="status-indicator">
                  <span className={`dot ${sectionsStatus[item.path]?.isActive ? 'active' : ''}`}></span>
                  {sectionsStatus[item.path]?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="preview-actions">
          <button 
            onClick={handlePreview} 
            className="preview-btn"
            disabled={!Object.values(sectionsStatus).every(s => 
              s.isConfigured || s.status !== 'required'
            )}
          >
            Preview Homepage
          </button>
          <button 
            onClick={handlePublish} 
            className="publish-btn"
            disabled={!Object.values(sectionsStatus).every(s => 
              s.isConfigured || s.status !== 'required'
            )}
          >
            Publish Changes
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default HomePageManager;
