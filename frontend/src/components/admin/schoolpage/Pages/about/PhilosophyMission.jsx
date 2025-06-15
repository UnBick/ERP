import React, { useState } from 'react';
import AdminLayout from '../../../layout/AdminLayout';
import RichTextEditor from '../../../common/RichTextEditor';
import DragDropList from '../../../common/DragDropList';
import PreviewModal from '../../../common/PreviewModal';
import './styles/PhilosophyMission.css';

const PhilosophyMission = () => {
  const [content, setContent] = useState({
    vision: { text: '', image: '' },
    mission: { points: [], image: '' },
    coreValues: [
      { title: '', description: '', icon: '' }
    ]
  });

  const validationRules = {
    vision: {
      text: { minLength: 100, maxLength: 500 },
      image: { aspectRatio: '16:9', minWidth: 800 }
    },
    mission: {
      points: { min: 3, max: 8 },
      pointLength: { max: 150 }
    },
    coreValues: {
      min: 4,
      max: 8
    }
  };

  return (
    <AdminLayout title="Philosophy & Mission">
      <div className="philosophy-editor">
        <div className="section-tabs">
          <button onClick={() => setActiveSection('vision')}>Vision</button>
          <button onClick={() => setActiveSection('mission')}>Mission</button>
          <button onClick={() => setActiveSection('values')}>Core Values</button>
        </div>

        {/* Section specific editors */}
        {activeSection === 'vision' && (
          <div className="vision-editor">
            {/* Vision editing interface */}
          </div>
        )}

        {activeSection === 'mission' && (
          <div className="mission-editor">
            <DragDropList
              items={content.mission.points}
              onReorder={(newOrder) => {/* Reordering logic */}}
            />
          </div>
        )}

        {activeSection === 'values' && (
          <div className="values-editor">
            {/* Core values editing interface */}
          </div>
        )}

        <button className="preview-btn" onClick={() => setShowPreview(true)}>
          Preview Changes
        </button>
      </div>
    </AdminLayout>
  );
};

export default PhilosophyMission;
