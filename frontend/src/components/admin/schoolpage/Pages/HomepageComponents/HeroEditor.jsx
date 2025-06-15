import React, { useState, useEffect } from 'react';
import MediaManager from '../../../common/MediaManager';
import ColorPicker from '../../../common/ColorPicker';
import FileUpload from '../../../common/FileUpload';
import { toast } from 'react-toastify';
import PreviewModal from '../../../common/PreviewModal';
import ValidationMessage from '../../../common/ValidationMessage';
import './styles/HeroEditor.css';

const HeroEditor = ({ initialContent, onSave }) => {
  const [content, setContent] = useState(initialContent || {
    title: '',
    subtitle: '',
    backgroundType: 'video', // or 'image'
    backgroundUrl: '',
    buttons: [{
      text: 'Learn More',
      url: '',
      style: 'primary'
    }],
    overlay: {
      color: 'rgba(0,0,0,0.5)',
      enabled: true
    }
  });

  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    const validationErrors = validateContent(content);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await fetch('/api/homepage/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      toast.success('Hero section updated successfully');
    } catch (error) {
      toast.error('Failed to update hero section');
    }
  };

  const validationRules = {
    required: ['title', 'subtitle', 'backgroundUrl'],
    textLength: {
      title: { min: 10, max: 70 },
      subtitle: { min: 20, max: 150 }
    }
  };

  return (
    <div className="hero-editor">
      <div className="editor-actions">
        <button onClick={() => setPreview(!preview)}>
          {preview ? 'Edit Mode' : 'Preview'}
        </button>
        <button onClick={handleSave}>Save Changes</button>
      </div>

      <div className="editor-grid">
        <div className="content-section">
          {/* Content editing form */}
        </div>
        
        <div className="media-section">
          <MediaManager 
            type={content.backgroundType}
            onSelect={(media) => setContent({ ...content, backgroundUrl: media.url })}
          />
        </div>

        <div className="preview-section">
          {/* Live preview */}
        </div>
      </div>
    </div>
  );
};

export default HeroEditor;
