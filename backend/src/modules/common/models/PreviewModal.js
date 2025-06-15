import React from 'react';
import './styles/PreviewModal.css';

const PreviewModal = ({ content, pageType, onClose, onApprove }) => {
  const renderPreview = () => {
    switch (pageType) {
      case 'achievements':
        return <div className="preview-achievements">{/* Achievement preview */}</div>;
      case 'gallery':
        return <div className="preview-gallery">{/* Gallery preview */}</div>;
      // Add cases for other page types
      default:
        return <div>Preview not available</div>;
    }
  };

  return (
    <div className="preview-modal">
      <div className="preview-header">
        <h2>Preview Changes</h2>
        <div className="preview-actions">
          <button onClick={onApprove}>Approve & Publish</button>
          <button onClick={onClose}>Continue Editing</button>
        </div>
      </div>
      
      <div className="preview-content">
        <div className="preview-device mobile">
          {renderPreview()}
        </div>
        <div className="preview-device desktop">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
