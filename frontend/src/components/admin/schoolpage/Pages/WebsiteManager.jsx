import React, { useState } from 'react';
import AdminContentLayout from '../../layout/AdminContentLayout';
import PreviewModal from '../../../../shared/models/PreviewModal';
import './styles/WebsiteManager.css';

const WebsiteManager = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [previewData, setPreviewData] = useState(null);

  const sections = {
    home: ['hero', 'achievements', 'gallery', 'notices'],
    about: ['school', 'principal', 'mission', 'infrastructure'],
    academics: ['curriculum', 'faculty', 'syllabus', 'papers'],
    activities: ['clubs', 'sports', 'cultural', 'workshops'],
    gallery: ['photos', 'videos', 'events', 'news'],
    admissions: ['process', 'apply', 'fees', 'faqs']
  };

  const handleSectionPreview = (section, subsection) => {
    setPreviewData({ section, subsection });
  };

  return (
    <div className="website-manager">
      <div className="section-navigator">
        {Object.entries(sections).map(([section, subsections]) => (
          <div key={section} className="section-group">
            <h3>{section.toUpperCase()}</h3>
            <div className="subsection-grid">
              {subsections.map(sub => (
                <button
                  key={sub}
                  onClick={() => handleSectionPreview(section, sub)}
                  className="preview-btn"
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {previewData && (
        <PreviewModal
          section={previewData.section}
          subsection={previewData.subsection}
          onClose={() => setPreviewData(null)}
        />
      )}
    </div>
  );
};

export default WebsiteManager;
