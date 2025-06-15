import React, { useState, useEffect } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import { SubjectCard } from '../../../common/SubjectCard';
import { SearchFilter } from '../../../common/SearchFilter';
import { LoadingSpinner } from '../../../common/LoadingSpinner';
import './styles/Curriculum.css';

const Curriculum = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('primary');
  const [activeStream, setActiveStream] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [curriculumData, setCurriculumData] = useState({
    primary: {
      title: 'Primary Classes (I-V)',
      subjects: [],
      outcomes: []
    },
    middle: {
      title: 'Middle Classes (VI-VIII)',
      subjects: [],
      outcomes: []
    },
    secondary: {
      title: 'Secondary Classes (IX-X)',
      subjects: [],
      outcomes: []
    },
    senior: {
      title: 'Senior Secondary (XI-XII)',
      subjects: [],
      streams: ['Science', 'Commerce', 'Humanities'],
      streamSubjects: {}
    }
  });

  useEffect(() => {
    fetchCurriculumData();
  }, []);

  const fetchCurriculumData = async () => {
    try {
      setLoading(true);
      // API call to fetch curriculum data
      const response = await fetch('/api/curriculum');
      const data = await response.json();
      setCurriculumData(data);
    } catch (err) {
      setError('Failed to load curriculum data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSubjects = () => {
    let subjects = activeSection === 'senior' && activeStream
      ? curriculumData.senior.streamSubjects[activeStream] || []
      : curriculumData[activeSection].subjects;

    if (searchTerm) {
      subjects = subjects.filter(subject => 
        subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return subjects;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <AdminContentLayout pageType="curriculum-view">
      <div className="curriculum-container">
        <nav className="section-nav">
          {Object.entries(curriculumData).map(([key, section]) => (
            <button
              key={key}
              className={`section-btn ${activeSection === key ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(key);
                setActiveStream(null);
              }}
            >
              {section.title}
            </button>
          ))}
        </nav>

        <div className="curriculum-content">
          <SearchFilter
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search subjects..."
          />

          {activeSection === 'senior' && (
            <div className="stream-selector">
              {curriculumData.senior.streams.map(stream => (
                <button
                  key={stream}
                  className={`stream-btn ${activeStream === stream ? 'active' : ''}`}
                  onClick={() => setActiveStream(stream)}
                >
                  {stream}
                </button>
              ))}
            </div>
          )}

          <div className="subjects-grid">
            {getFilteredSubjects().map((subject, index) => (
              <SubjectCard
                key={index}
                subject={subject}
                sectionType={activeSection}
                stream={activeStream}
              />
            ))}
          </div>

          <div className="learning-outcomes">
            <h3>Learning Outcomes</h3>
            <ul>
              {curriculumData[activeSection].outcomes.map((outcome, index) => (
                <li key={index}>{outcome}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AdminContentLayout>
  );
};

export default Curriculum;
