import React from 'react';
import './styles/PreviewWrapper.css';

const PreviewWrapper = ({ content, onClose }) => {
  return (
    <div className="preview-wrapper">
      <div className="preview-header">
        <h3>Preview</h3>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="preview-content">
        {/* Render content based on type */}
        {content.images && (
          <div className="media-preview">
            {content.images.map((img, index) => (
              <img key={index} src={img.url} alt={img.alt || 'Preview'} />
            ))}
          </div>
        )}
        {content.description && (
          <div className="text-preview">
            <p>{content.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewWrapper;
