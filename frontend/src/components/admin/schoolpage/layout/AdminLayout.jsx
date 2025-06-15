
import React from 'react';
import PreviewModal from '../../../common/PreviewModal';
import '../../layout/styles/AdminLayout.css';

const AdminLayout = ({ title, children }) => {
  const [showPreview, setShowPreview] = React.useState(false);

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>{title}</h1>
        <button 
          className="preview-button"
          onClick={() => setShowPreview(true)}
        >
          Preview Section
        </button>
      </header>

      <main className="admin-content">
        {children}
      </main>

      {showPreview && (
        <PreviewModal 
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;