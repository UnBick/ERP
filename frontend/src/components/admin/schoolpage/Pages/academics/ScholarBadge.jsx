import React, { useState } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import './styles/ScholarBadge.css';

const ScholarBadge = () => {
  const [criteria, setCriteria] = useState({
    academicScore: 90,
    attendance: 95,
    extraCurricular: 2
  });

  const [recipients, setRecipients] = useState([]);
  const [errors, setErrors] = useState({});

  const handleCriteriaUpdate = (field, value) => {
    const newCriteria = { ...criteria, [field]: value };
    const validationErrors = {};
    
    if (field === 'academicScore' && (value < 0 || value > 100)) {
      validationErrors.academicScore = 'Score must be between 0 and 100';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setCriteria(newCriteria);
    }
  };

  return (
    <AdminContentLayout pageType="scholar-badge">
      <div className="scholar-badge-manager">
        <section className="criteria-editor">
          <h3>Scholar Badge Criteria</h3>
          <div className="criteria-form">
            <div className="form-group">
              <label>Minimum Academic Score (%)</label>
              <input
                type="number"
                value={criteria.academicScore}
                onChange={(e) => handleCriteriaUpdate('academicScore', e.target.value)}
                className={errors.academicScore ? 'error' : ''}
              />
              {errors.academicScore && <span className="error-message">{errors.academicScore}</span>}
            </div>
            {/* Additional criteria inputs */}
          </div>
        </section>

        <section className="recipients-list">
          <h3>Current Recipients</h3>
          <div className="recipients-grid">
            {recipients.map(recipient => (
              <div key={recipient.id} className="recipient-card">
                {/* Recipient details */}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminContentLayout>
  );
};

export default ScholarBadge;
