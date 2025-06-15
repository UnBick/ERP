import React from 'react';
import { motion } from 'framer-motion';
import './styles/SectionPreview.css';

const SectionPreview = ({ content, section, changes }) => {
  const renderPreviewContent = () => {
    switch (section) {
      case 'hero':
        return (
          <div className="preview-hero">
            <h1 className={changes?.heading ? 'changed' : ''}>
              {content.heading}
            </h1>
            <p className={changes?.subheading ? 'changed' : ''}>
              {content.subheading}
            </p>
            {content.backgroundVideo && (
              <div className="video-preview">
                <video src={content.backgroundVideo} muted loop />
              </div>
            )}
          </div>
        );
      
      case 'achievements':
        return (
          <div className="preview-achievements">
            {content.items?.map((item, index) => (
              <motion.div
                key={index}
                className={`achievement-card ${changes?.items?.[index] ? 'changed' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.div>
            ))}
          </div>
        );
      
      // Add other section previews...
      
      default:
        return <div>No preview available</div>;
    }
  };

  return (
    <div className="section-preview">
      <div className="preview-header">
        <h3>Preview: {section}</h3>
        {changes && Object.keys(changes).length > 0 && (
          <div className="changes-indicator">
            Changes pending
          </div>
        )}
      </div>
      <div className="preview-container">
        {renderPreviewContent()}
      </div>
    </div>
  );
};

export default SectionPreview;
