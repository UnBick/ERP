import React, { useState, useEffect } from 'react';
import './style/TeacherSubjectStep.css';

const TeacherSubjectStep = ({
  selectedSections,
  subjects,
  setSubjects,
  selectedSubjects,
  setSelectedSubjects,
  teachers,
  setTeachers,
  selectedTeachers,
  setSelectedTeachers,
  hoursPerWeek,
  setHoursPerWeek,
  continuousPeriods,
  setContinuousPeriods,
  subjectContinuitySettings,
  setSubjectContinuitySettings,
  loadingTeachers,
  setLoadingTeachers,
  fetchError,
  setFetchError
}) => {
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [teacherSubjectMatrix, setTeacherSubjectMatrix] = useState({});

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const response = await fetch('/api/v1/admin/Academic/subjects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const data = await response.json();
        if (data.success) {
          setSubjects(data.data);
        }
      } catch (error) {
        setFetchError('Failed to load subjects: ' + error.message);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [setSubjects, setFetchError]);

  // Fetch teachers based on selected subjects
  useEffect(() => {
    const fetchTeachersBySubjects = async () => {
      if (selectedSubjects.length === 0) {
        setTeachers([]);
        return;
      }

      setLoadingTeachers(true);
      try {
        // Get subject names for the selected subject IDs
        const selectedSubjectNames = selectedSubjects.map(subjectId => {
          const subject = subjects.find(s => s._id === subjectId || s.id === subjectId);
          return subject?.name;
        }).filter(Boolean);

        console.log('Selected subject names:', selectedSubjectNames);

        if (selectedSubjectNames.length === 0) {
          setTeachers([]);
          return;
        }

        // Fetch teachers for each selected subject
        const teacherPromises = selectedSubjectNames.map(subjectName =>
          fetch(`/api/v1/teacher/teachers-by-subject?subject=${encodeURIComponent(subjectName)}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }).then(response => {
            if (!response.ok) {
              throw new Error(`Failed to fetch teachers for ${subjectName}`);
            }
            return response.json();
          })
        );

        const teacherResponses = await Promise.all(teacherPromises);
        
        // Combine all teachers and remove duplicates
        const allTeachers = [];
        const teacherIds = new Set();
        
        teacherResponses.forEach((response, index) => {
          if (response.success && response.data) {
            response.data.forEach(teacher => {
              const teacherId = teacher.id || teacher._id;
              if (!teacherIds.has(teacherId)) {
                teacherIds.add(teacherId);
                // Add the subject to teacher's subjects array if not already present
                const subjectName = selectedSubjectNames[index];
                if (!teacher.subjects) {
                  teacher.subjects = [];
                }
                if (!teacher.subjects.includes(subjectName)) {
                  teacher.subjects.push(subjectName);
                }
                // Ensure teacher has consistent ID field
                teacher.id = teacherId;
                allTeachers.push(teacher);
              } else {
                // Teacher already exists, just add the subject
                const existingTeacher = allTeachers.find(t => (t.id || t._id) === teacherId);
                const subjectName = selectedSubjectNames[index];
                if (existingTeacher && !existingTeacher.subjects.includes(subjectName)) {
                  existingTeacher.subjects.push(subjectName);
                }
              }
            });
          }
        });

        console.log('Fetched teachers:', allTeachers);
        setTeachers(allTeachers);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setFetchError('Failed to load teachers: ' + error.message);
        setTeachers([]);
      } finally {
        setLoadingTeachers(false);
      }
    };

    // Only fetch teachers if we have subjects data
    if (subjects.length > 0) {
      fetchTeachersBySubjects();
    }
  }, [selectedSubjects, subjects, setTeachers, setLoadingTeachers, setFetchError]);

  // Handle subject selection
  const handleSubjectSelect = (subjectId) => {
    setSelectedSubjects(prev => {
      const newSelection = prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId];
      
      console.log('Updated subject selection:', newSelection);
      return newSelection;
    });

    // Update hours per week for newly selected subjects
    setHoursPerWeek(prevHours => {
      const newHours = { ...prevHours };
      if (!selectedSubjects.includes(subjectId)) {
        newHours[subjectId] = 5; // Default to 5 hours per week for newly selected subject
      } else {
        delete newHours[subjectId]; // Remove hours for deselected subject
      }
      return newHours;
    });

    // Update continuity settings for newly selected subjects
    setSubjectContinuitySettings(prevSettings => {
      const newSettings = { ...prevSettings };
      if (!selectedSubjects.includes(subjectId)) {
        newSettings[subjectId] = { continuous: true, maxConsecutive: 2 }; // Default continuity settings
      } else {
        delete newSettings[subjectId]; // Remove continuity settings for deselected subject
      }
      return newSettings;
    });
  };

  // Handle teacher selection
  const handleTeacherSelect = (teacherId) => {
    setSelectedTeachers(prev =>
      prev.includes(teacherId)
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  // Handle teacher-subject assignment
  const handleTeacherSubjectAssignment = (teacherId, subjectId) => {
    setTeacherSubjectMatrix(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [subjectId]: !prev[teacherId]?.[subjectId]
      }
    }));
  };

  // Handle hours per week change
  const handleHoursChange = (subjectId, hours) => {
    setHoursPerWeek(prev => ({
      ...prev,
      [subjectId]: Math.max(1, Math.min(10, parseInt(hours) || 1))
    }));
  };

  // Handle continuity settings
  const handleContinuityChange = (subjectId, setting, value) => {
    setSubjectContinuitySettings(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [setting]: value
      }
    }));
  };

  // Handle select all subjects - FIXED
  const handleSelectAllSubjects = () => {
    const allIds = subjects.map(subject => subject._id || subject.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedSubjects.includes(id));

    if (allSelected) {
      // Deselect all subjects
      setSelectedSubjects([]);
      setHoursPerWeek({});
      setSubjectContinuitySettings({});
    } else {
      // Select all subjects
      setSelectedSubjects(allIds);
      // Set default hours for all subjects
      const defaultHours = {};
      const defaultContinuity = {};
      allIds.forEach(id => {
        defaultHours[id] = 5;
        defaultContinuity[id] = { continuous: true, maxConsecutive: 2 };
      });
      setHoursPerWeek(defaultHours);
      setSubjectContinuitySettings(defaultContinuity);
    }
  };

  // Handle select all teachers
  const handleSelectAllTeachers = () => {
    const allIds = teachers.map(teacher => teacher.id || teacher._id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedTeachers.includes(id));

    if (allSelected) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(allIds);
    }
  };

  return (
    <div className="tss-container">
      <div className="tss-header">
        <div className="tss-header-content">
          <h2 className="tss-title">Configure Subjects & Teachers</h2>
          <p className="tss-subtitle">Select subjects and teachers, then configure their assignments and scheduling preferences.</p>
        </div>
      </div>

      {fetchError && (
        <div className="tss-error-banner">
          <div className="tss-error-icon">⚠️</div>
          <span>{fetchError}</span>
        </div>
      )}

      <div className="tss-content">
        {/* Subjects Selection */}
        <div className="tss-section">
          <div className="tss-section-header">
            <div className="tss-section-title">
              <h3>📚 Select Subjects</h3>
              <span className="tss-selection-badge">
                {selectedSubjects.length} of {subjects.length} selected
              </span>
            </div>
            <button
              className="tss-select-all-btn"
              onClick={handleSelectAllSubjects}
              disabled={loadingSubjects || subjects.length === 0}
            >
              {subjects.length > 0 && selectedSubjects.length === subjects.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>

          {loadingSubjects ? (
            <div className="tss-loading">
              <div className="tss-spinner"></div>
              <span>Loading subjects...</span>
            </div>
          ) : (
            <div className="tss-grid">
              {subjects.map((subject) => {
                const subjectId = subject._id || subject.id;
                return (
                  <div
                    key={subjectId}
                    className={`tss-card ${selectedSubjects.includes(subjectId) ? 'tss-card-selected' : ''}`}
                    onClick={() => handleSubjectSelect(subjectId)}
                  >
                    <div className="tss-card-header">
                      <div className="tss-checkbox-wrapper">
                        <input
                          type="checkbox"
                          className="tss-checkbox"
                          checked={selectedSubjects.includes(subjectId)}
                          onChange={() => handleSubjectSelect(subjectId)}
                        />
                      </div>
                      <div className="tss-card-info">
                        <h4 className="tss-card-title">{subject.name}</h4>
                        <p className="tss-card-code">{subject.code}</p>
                        {subject.description && (
                          <p className="tss-card-description">{subject.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {selectedSubjects.includes(subjectId) && (
                      <div className="tss-card-config" onClick={(e) => e.stopPropagation()}>
                        <div className="tss-config-row">
                          <label className="tss-config-label">Weekly Hours</label>
                          <input
                            type="number"
                            className="tss-number-input"
                            min="1"
                            max="10"
                            value={hoursPerWeek[subjectId] || 5}
                            onChange={(e) => handleHoursChange(subjectId, e.target.value)}
                          />
                        </div>
                        <div className="tss-config-row">
                          <label className="tss-checkbox-label">
                            <input
                              type="checkbox"
                              className="tss-checkbox"
                              checked={subjectContinuitySettings[subjectId]?.continuous || false}
                              onChange={(e) => handleContinuityChange(subjectId, 'continuous', e.target.checked)}
                            />
                            Allow continuous periods
                          </label>
                        </div>
                        {subjectContinuitySettings[subjectId]?.continuous && (
                          <div className="tss-config-row">
                            <label className="tss-config-label">Max Consecutive</label>
                            <input
                              type="number"
                              className="tss-number-input"
                              min="1"
                              max="4"
                              value={subjectContinuitySettings[subjectId]?.maxConsecutive || 2}
                              onChange={(e) => handleContinuityChange(subjectId, 'maxConsecutive', parseInt(e.target.value))}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {subjects.length === 0 && !loadingSubjects && (
            <div className="tss-empty-state">
              <div className="tss-empty-icon">📖</div>
              <h3>No Subjects Found</h3>
              <p>Please add subjects to your system first.</p>
            </div>
          )}
        </div>

        {/* Teachers Selection */}
        <div className="tss-section">
          <div className="tss-section-header">
            <div className="tss-section-title">
              <h3>👨‍🏫 Select Teachers</h3>
              <span className="tss-selection-badge">
                {selectedTeachers.length} of {teachers.length} selected
              </span>
            </div>
            <button
              className="tss-select-all-btn"
              onClick={handleSelectAllTeachers}
              disabled={loadingTeachers || teachers.length === 0}
            >
              {teachers.length > 0 && selectedTeachers.length === teachers.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>

          {loadingTeachers ? (
            <div className="tss-loading">
              <div className="tss-spinner"></div>
              <span>Loading teachers...</span>
            </div>
          ) : (
            <div className="tss-grid">
              {teachers.map((teacher) => {
                const teacherId = teacher.id || teacher._id;
                return (
                  <div
                    key={teacherId}
                    className={`tss-card ${selectedTeachers.includes(teacherId) ? 'tss-card-selected' : ''}`}
                    onClick={() => handleTeacherSelect(teacherId)}
                  >
                    <div className="tss-card-header">
                      <div className="tss-checkbox-wrapper">
                        <input
                          type="checkbox"
                          className="tss-checkbox"
                          checked={selectedTeachers.includes(teacherId)}
                          onChange={() => handleTeacherSelect(teacherId)}
                        />
                      </div>
                      <div className="tss-card-info">
                        <h4 className="tss-card-title">{teacher.name}</h4>
                        <p className="tss-card-code">ID: {teacher.employeeId}</p>
                        {teacher.department && (
                          <p className="tss-card-department">Dept: {teacher.department}</p>
                        )}
                        {teacher.subjects && teacher.subjects.length > 0 && (
                          <div className="tss-subjects-tags">
                            {teacher.subjects.slice(0, 3).map((subject, index) => (
                              <span key={index} className="tss-subject-tag">{subject}</span>
                            ))}
                            {teacher.subjects.length > 3 && (
                              <span className="tss-subject-tag tss-more-tag">+{teacher.subjects.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {teachers.length === 0 && !loadingTeachers && selectedSubjects.length > 0 && (
            <div className="tss-empty-state">
              <div className="tss-empty-icon">👨‍🏫</div>
              <h3>No Teachers Found</h3>
              <p>No teachers found for the selected subjects.</p>
            </div>
          )}

          {selectedSubjects.length === 0 && (
            <div className="tss-empty-state">
              <div className="tss-empty-icon">📚</div>
              <h3>Select Subjects First</h3>
              <p>Please select subjects to see available teachers.</p>
            </div>
          )}
        </div>

        {/* Teacher-Subject Assignment Matrix */}
        {selectedSubjects.length > 0 && selectedTeachers.length > 0 && (
          <div className="tss-section">
            <div className="tss-section-header">
              <div className="tss-section-title">
                <h3>🔗 Teacher-Subject Assignment</h3>
                <span className="tss-info-text">Assign teachers to subjects they can teach</span>
              </div>
            </div>

            <div className="tss-matrix-container">
              <div className="tss-matrix">
                <div className="tss-matrix-header">
                  <div className="tss-matrix-cell tss-matrix-header-cell">Teacher</div>
                  {selectedSubjects.map(subjectId => {
                    const subject = subjects.find(s => (s._id || s.id) === subjectId);
                    return (
                      <div key={subjectId} className="tss-matrix-cell tss-matrix-header-cell">
                        <span className="tss-subject-name">{subject?.name}</span>
                        <span className="tss-subject-code">{subject?.code}</span>
                      </div>
                    );
                  })}
                </div>

                {selectedTeachers.map(teacherId => {
                  const teacher = teachers.find(t => (t.id || t._id) === teacherId);
                  return (
                    <div key={teacherId} className="tss-matrix-row">
                      <div className="tss-matrix-cell tss-matrix-teacher-cell">
                        <span className="tss-teacher-name">{teacher?.name}</span>
                        <span className="tss-teacher-id">ID: {teacher?.employeeId}</span>
                      </div>
                      {selectedSubjects.map(subjectId => (
                        <div key={subjectId} className="tss-matrix-cell tss-matrix-assignment-cell">
                          <input
                            type="checkbox"
                            className="tss-matrix-checkbox"
                            checked={teacherSubjectMatrix[teacherId]?.[subjectId] || false}
                            onChange={() => handleTeacherSubjectAssignment(teacherId, subjectId)}
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Global Settings */}
        <div className="tss-section">
          <div className="tss-section-header">
            <div className="tss-section-title">
              <h3>⚙️ Global Settings</h3>
            </div>
          </div>

          <div className="tss-settings-grid">
            <div className="tss-setting-card">
              <label className="tss-setting-label">
                <input
                  type="checkbox"
                  className="tss-checkbox"
                  checked={continuousPeriods}
                  onChange={(e) => setContinuousPeriods(e.target.checked)}
                />
                <span className="tss-setting-title">Allow continuous periods globally</span>
              </label>
              <p className="tss-setting-description">
                When enabled, subjects can have back-to-back periods across all classes
              </p>
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        {selectedSubjects.length > 0 && selectedTeachers.length > 0 && (
          <div className="tss-summary">
            <div className="tss-summary-header">
              <h3>📊 Selection Summary</h3>
            </div>
            <div className="tss-summary-grid">
              <div className="tss-summary-card">
                <div className="tss-summary-value">{selectedSubjects.length}</div>
                <div className="tss-summary-label">Subjects Selected</div>
              </div>
              <div className="tss-summary-card">
                <div className="tss-summary-value">{selectedTeachers.length}</div>
                <div className="tss-summary-label">Teachers Selected</div>
              </div>
              <div className="tss-summary-card">
                <div className="tss-summary-value">
                  {Object.values(hoursPerWeek).reduce((sum, hours) => sum + hours, 0)}
                </div>
                <div className="tss-summary-label">Total Hours/Week</div>
              </div>
              <div className="tss-summary-card">
                <div className="tss-summary-value">
                  {Object.values(teacherSubjectMatrix).reduce((total, teacherSubjects) => {
                    return total + Object.values(teacherSubjects).filter(Boolean).length;
                  }, 0)}
                </div>
                <div className="tss-summary-label">Teacher-Subject Assignments</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSubjectStep;