import React, { useState } from 'react';
import MediaUploader from './MediaUploader';
import { validateForm } from '../../utils/validation';

const ClubEditor = ({ club, teachers, onSave, onCancel, validationRules }) => {
  const [formData, setFormData] = useState(club || {
    name: '',
    description: '',
    incharge: '',
    image: null,
    members: [],
    schedule: { day: '', time: '', location: '' }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData, validationRules);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="club-editor">
      {/* Form fields */}
      <div className="form-group">
        <label>Club Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Club Incharge</label>
        <select
          value={formData.incharge}
          onChange={(e) => setFormData({ ...formData, incharge: e.target.value })}
        >
          <option value="">Select Incharge</option>
          {teachers.map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name} - {teacher.department}
            </option>
          ))}
        </select>
      </div>

      <MediaUploader
        files={[formData.image]}
        onChange={([image]) => setFormData({ ...formData, image })}
        multiple={false}
        validationRules={validationRules.image}
      />

      <div className="actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="submit">Save Club</button>
      </div>
    </form>
  );
};

export default ClubEditor;
