import React, { useState } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import ContentEditor from '../../../common/ContentEditor';
import PreviewWrapper from '../../../common/PreviewWrapper';
import './styles/CurriculumEditor.css';

const CurriculumEditor = () => {
  const [sections, setSections] = useState({
    primary: { title: 'Primary Section', grades: '1-5', subjects: [] },
    middle: { title: 'Middle Section', grades: '6-8', subjects: [] },
    secondary: { title: 'Secondary Section', grades: '9-10', subjects: [] },
    senior: { title: 'Senior Secondary', grades: '11-12', subjects: [] }
  });
  const [errors, setErrors] = useState({});
  const [previewSection, setPreviewSection] = useState(null);

  const validateSection = (sectionData) => {
    const newErrors = {};
    
    if (!sectionData.subjects || sectionData.subjects.length < 1) {
      newErrors.subjects = 'At least one subject is required';
    }

    sectionData.subjects.forEach((subject, index) => {
      if (!subject.name || !subject.description) {
        newErrors[`subject${index}`] = 'Subject name and description are required';
      }
    });

    return newErrors;
  };

  const handleSectionUpdate = async (sectionKey, data) => {
    const sectionErrors = validateSection(data);
    
    if (Object.keys(sectionErrors).length > 0) {
      setErrors({ ...errors, [sectionKey]: sectionErrors });
      return;
    }

    try {
      // API call to save section data
      setSections(prev => ({
        ...prev,
        [sectionKey]: { ...prev[sectionKey], ...data }
      }));
      toast.success('Section updated successfully');
    } catch (error) {
      toast.error('Failed to update section');
    }
  };

  return (
    <AdminContentLayout pageType="curriculum">
      <div className="curriculum-editor">
        {Object.entries(sections).map(([key, section]) => (
          <div key={key} className="section-editor">
            <h3>{section.title}</h3>
            <ContentEditor
              content={section}
              onChange={(data) => handleSectionUpdate(key, data)}
              validationRules={{
                required: ['subjects'],
                minItems: { subjects: 1 }
              }}
              errors={errors[key]}
            />
            <button 
              className="preview-btn"
              onClick={() => setPreviewSection(key)}
            >
              Preview Section
            </button>
          </div>
        ))}

        {previewSection && (
          <PreviewWrapper
            content={sections[previewSection]}
            onClose={() => setPreviewSection(null)}
          />
        )}
      </div>
    </AdminContentLayout>
  );
};

export default CurriculumEditor;
