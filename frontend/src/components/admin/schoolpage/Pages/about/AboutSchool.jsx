import React, { useState } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import ContentEditor from '../../../common/ContentEditor';
import PreviewWrapper from '../../../common/PreviewWrapper';
import '../styles/About.css';

const AboutSchool = () => {
  const [content, setContent] = useState({
    sections: [
      { id: 'intro', title: 'Introduction', content: '' },
      { id: 'history', title: 'Our History', content: '' },
      { id: 'values', title: 'Core Values', content: '' }
    ],
    media: {
      mainImage: '',
      gallery: []
    }
  });

  return (
    <AdminContentLayout pageType="about">
      <div className="about-editor">
        <ContentEditor 
          content={content}
          onUpdate={setContent}
          validationRules={{
            required: ['sections.intro.content', 'media.mainImage'],
            minLength: { 'sections.*.content': 100 }
          }}
        />
        <PreviewWrapper 
          content={content}
          type="about"
        />
      </div>
    </AdminContentLayout>
  );
};

export default AboutSchool;
