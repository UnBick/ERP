import React, { useState, useEffect } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import FormEditor from '../../../common/FormEditor';
import './styles/Apply.css';

const Apply = () => {
  const [formFields, setFormFields] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [preview, setPreview] = useState(false);

  const validationRules = {
    field: {
      required: ['label', 'type', 'validation'],
      label: { minLength: 3 },
      options: { minItems: 2 }
    }
  };

  const handleFieldUpdate = async (field) => {
    try {
      // API call to update form field
      toast.success('Field updated successfully');
    } catch (error) {
      toast.error('Failed to update field');
    }
  };

  return (
    <AdminContentLayout pageType="application-form">
      <div className="form-builder">
        <div className="sections-panel">
          {/* Form sections */}
        </div>

        {activeSection && (
          <FormEditor
            fields={formFields}
            onFieldUpdate={handleFieldUpdate}
            onPreview={() => setPreview(true)}
            validationRules={validationRules}
          />
        )}

        {preview && (
          <PreviewWrapper
            content={{ fields: formFields }}
            onClose={() => setPreview(false)}
          />
        )}
      </div>
    </AdminContentLayout>
  );
};

export default Apply;
