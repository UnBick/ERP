import React, { useState } from 'react';
import MediaUploader from './MediaUploader';
import { validateForm } from '../../utils/validation';

const SportsEditor = ({ category, content, onSave, onPreview, validationRules }) => {
  const [formData, setFormData] = useState(content || {
    title: '',
    description: '',
    images: [],
    schedules: [],
    achievements: []
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData, validationRules);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSave(formData);
      setErrors({});
    } catch (error) {
      setErrors({ submit: 'Failed to save changes' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sports-editor-form">
      <div className="form-group">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Title"
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <MediaUploader
        files={formData.images}
        onChange={(images) => setFormData({ ...formData, images })}
        validationRules={validationRules.images}
      />

      <div className="actions">
        <button type="button" onClick={() => onPreview(formData)}>Preview</button>
        <button type="submit">Save Changes</button>
      </div>
    </form>
  );
};

export default SportsEditor;
