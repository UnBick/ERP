import React from 'react';
import './styles/DocumentViewer.css';

const DocumentViewer = ({ url, title }) => {
  const handleView = () => {
    window.open(url, '_blank');
  };

  return (
    <div className="document-viewer">
      <div className="document-preview">
        <i className="fas fa-file-pdf"></i>
        <h3>{title}</h3>
        <button onClick={handleView} className="view-btn">
          View Document
        </button>
      </div>
    </div>
  );
};

export default DocumentViewer;
