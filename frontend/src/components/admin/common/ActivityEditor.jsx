import React, { useState } from 'react';
import MediaUploader from './MediaUploader';
import DatePicker from './DatePicker';
import { toast } from 'react-toastify';

const ActivityEditor = ({ activity, categories, validationRules, onSave, onCancel }) => {
  const [formData, setFormData] = useState(activity || {});
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
      toast.success('Activity saved successfully');
    } catch (error) {
      toast.error('Failed to save activity');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="activity-editor">
      {/* Form fields */}
      <div className="form-controls">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save Activity</button>
      </div>
    </form>
  );
};

export default ActivityEditor;
