import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import RichTextEditor from '../../../common/RichTextEditor';
import ImageUploader from '../../../common/ImageUploader';
import PreviewModal from '../../../common/PreviewModal';
import './styles/PrincipalMessage.css';

const PrincipalMessage = () => {
  const [content, setContent] = useState({
    name: '',
    title: '',
    qualifications: '',
    message: '',
    image: '',
    signature: ''
  });
  
  const [showPreview, setShowPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const validationRules = {
    required: ['name', 'message', 'image'],
    message: { minLength: 200, maxLength: 2000 },
    image: { aspectRatio: '3:4', minWidth: 400 }
  };

  const handleSave = async () => {
    try {
      await ApiService.updatePrincipalMessage(content);
      setHasChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <AdminLayout 
      title="Principal's Message"
      onSave={handleSave}
      hasChanges={hasChanges}
    >
      <div className="principal-message-editor">
        <div className="editor-grid">
          <div className="profile-section">
            <ImageUploader
              currentImage={content.image}
              onChange={(url) => {
                setContent(prev => ({ ...prev, image: url }));
                setHasChanges(true);
              }}
              validationRules={validationRules.image}
            />
            
            <div className="profile-details">
              <input
                type="text"
                placeholder="Principal's Name"
                value={content.name}
                onChange={(e) => {
                  setContent(prev => ({ ...prev, name: e.target.value }));
                  setHasChanges(true);
                }}
              />
              {/* Other profile fields */}
            </div>
          </div>

          <div className="message-section">
            <RichTextEditor
              content={content.message}
              onChange={(message) => {
                setContent(prev => ({ ...prev, message }));
                setHasChanges(true);
              }}
              validationRules={validationRules.message}
            />
          </div>
        </div>

        <button 
          className="preview-button"
          onClick={() => setShowPreview(true)}
        >
          Preview Changes
        </button>

        {showPreview && (
          <PreviewModal
            content={content}
            type="principalMessage"
            onClose={() => setShowPreview(false)}
            onApprove={handleSave}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default PrincipalMessage;
