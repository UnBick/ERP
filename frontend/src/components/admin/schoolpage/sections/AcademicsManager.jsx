import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import './styles/SectionManager.css';

const AcademicsManager = () => {
  const menuItems = [
    { title: 'Curriculum', path: 'curriculum', icon: '📚' },
    { title: 'Faculty', path: 'faculty', icon: '👨‍🏫' },
    { title: 'Syllabus', path: 'syllabus', icon: '📖' },
    { title: 'Question Papers', path: 'question-papers', icon: '📝' },
    { title: 'Scholar Badge', path: 'scholar-badge', icon: '🏅' },
    { title: 'Art Integration', path: 'art-integration', icon: '🎨' }
  ];

  // ...similar structure as AboutManager
};

export default AcademicsManager;
