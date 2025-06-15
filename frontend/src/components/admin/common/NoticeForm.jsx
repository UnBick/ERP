import React, { useState } from 'react';
import ApiService from '../../../utils/ApiService';
import './styles/NoticeForm.css';

const NoticeForm = ({ onSubmit, initialData = null }) => {
  const [notice, setNotice] = useState(initialData || {
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    expiryDate: '',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'general',
    'academic',
    'examination',
    'sports',
    'cultural',
    'important'
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const result = await onSubmit(notice);
        if (result.success) {
          resetForm();
        }
      } catch (error) {
        setErrors({ submit: 'Failed to submit notice' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!notice.title.trim()) newErrors.title = 'Title is required';
    if (!notice.content.trim()) newErrors.content = 'Content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setNotice({
      title: '',
      content: '',
      category: 'general',
      priority: 'normal',
      expiryDate: '',
      attachments: []
    });
    setErrors({});
  };

  return (
    <form className="notice-form" onSubmit={handleSubmit}>
      {/* Form fields */}
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          value={notice.title}
          onChange={(e) => setNotice({ ...notice, title: e.target.value })}
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      {/* Other form fields... */}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Notice'}
        </button>
        <button type="button" onClick={resetForm}>
          Reset
        </button>
      </div>
    </form>
  );
};

export default NoticeForm;
