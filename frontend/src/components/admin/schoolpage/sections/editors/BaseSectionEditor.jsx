import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layout/AdminLayout';
import { toast } from 'react-toastify';
import '../styles/SectionEditor.css';

const BaseSectionEditor = ({ 
  sectionKey, 
  title, 
  validationRules,
  children 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (data) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/homepage/${sectionKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to save changes');
      toast.success('Changes saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title={`Edit ${title}`}>
      <div className="section-editor">
        <div className="editor-header">
          <h2>{title}</h2>
          <div className="actions">
            {hasChanges && (
              <button 
                onClick={() => handleSave()}
                disabled={loading}
                className="save-btn"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="edit-toggle-btn"
            >
              {isEditing ? 'Preview' : 'Edit'}
            </button>
          </div>
        </div>

        <div className={`editor-content ${isEditing ? 'editing' : 'preview'}`}>
          {children}
        </div>
      </div>
    </AdminLayout>
  );
};

export default BaseSectionEditor;
