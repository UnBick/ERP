import React, { useState, useEffect } from 'react';
import './style/ClassSectionStep.css';

const ClassSectionStep = ({
  selectedClasses,
  setSelectedClasses,
  classes,
  setClasses,
  sections,
  setSections,
  selectedSections,
  setSelectedSections,
  fetchError,
  setFetchError
}) => {
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClass, setExpandedClass] = useState(null);
  const [classSections, setClassSections] = useState({});

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const response = await fetch('/api/v1/admin/classes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        const data = await response.json();
        if (data.success) {
          setClasses(data.data);
        }
      } catch (error) {
        setFetchError('Failed to load classes: ' + error.message);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [setClasses, setFetchError]);

  // Fetch sections for a specific class
  const fetchClassSections = async (classId) => {
    if (classSections[classId]) {
      return; // Already fetched
    }

    setLoadingSections(prev => ({ ...prev, [classId]: true }));
    try {
      const response = await fetch(`/api/v1/admin/sections/class/${classId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sections for class ' + classId);
      }

      const data = await response.json();
      if (data.success) {
        setClassSections(prev => ({
          ...prev,
          [classId]: data.data
        }));
      }
    } catch (error) {
      setFetchError('Failed to load sections: ' + error.message);
    } finally {
      setLoadingSections(prev => ({ ...prev, [classId]: false }));
    }
  };

  // Helper function to create section key
  const createSectionKey = (classId, sectionName) => `${classId}-${sectionName}`;

  // Helper function to get sections for a specific class from selectedSections
  const getSelectedSectionsForClass = (classId) => {
    return selectedSections.filter(sectionKey => sectionKey.startsWith(`${classId}-`));
  };

  // Helper function to get section name from section key
  const getSectionNameFromKey = (sectionKey) => {
    const parts = sectionKey.split('-');
    if (parts.length < 2) return sectionKey; // Return original if invalid format
    return parts.slice(1).join('-'); // Handle section names that might contain hyphens
  };

  // Helper function to get class ID from section key
  const getClassIdFromKey = (sectionKey) => {
    const parts = sectionKey.split('-');
    return parts[0];
  };

  // Handle class selection and expansion
  const handleClassSelect = async (classId) => {
    // Toggle class selection
    const isCurrentlySelected = selectedClasses.includes(classId);
    
    if (isCurrentlySelected) {
      // Remove class and its sections from selection
      setSelectedClasses(prev => prev.filter(id => id !== classId));
      const sectionsToRemove = getSelectedSectionsForClass(classId);
      setSelectedSections(prev => prev.filter(sectionKey => !sectionsToRemove.includes(sectionKey)));
      setExpandedClass(null);
    } else {
      // Add class to selection
      setSelectedClasses(prev => [...prev, classId]);
      // Expand to show sections
      setExpandedClass(classId);
      await fetchClassSections(classId);
    }
  };

  // Handle section selection
  const handleSectionSelect = (sectionName, classId) => {
    const sectionKey = createSectionKey(classId, sectionName);
    
    // Safety check for valid inputs
    if (!sectionName || !classId) {
      return;
    }
    
    setSelectedSections(prev => {
      // Remove duplicates and ensure clean array
      const cleanPrev = [...new Set(prev.filter(key => key && key.includes('-')))];
      
      const newSections = cleanPrev.includes(sectionKey) 
        ? cleanPrev.filter(key => key !== sectionKey)
        : [...cleanPrev, sectionKey];
      
      return newSections;
    });
  };

  // Handle select all sections for a class
  const handleSelectAllClassSections = (classId) => {
    const sections = classSections[classId] || [];
    const sectionKeys = sections.map(section => createSectionKey(classId, section.name));
    const allSelected = sectionKeys.every(key => selectedSections.includes(key));

    if (allSelected) {
      setSelectedSections(prev => prev.filter(key => !sectionKeys.includes(key)));
    } else {
      setSelectedSections(prev => [...new Set([...prev, ...sectionKeys])]);
    }
  };

  // Filter classes based on search term
  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.description && cls.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Helper function to get display sections for summary (section names only)
  const getDisplaySections = () => {
    return selectedSections
      .map(sectionKey => {
        const classId = getClassIdFromKey(sectionKey);
        const sectionName = getSectionNameFromKey(sectionKey);
        
        // Find the class, ensuring ID comparison works for both string and number IDs
        const foundClass = classes.find(cls => String(cls.id) === String(classId));
        
        if (!foundClass) {
          return null; // Filter out unknown classes
        }
        
        return `${foundClass.name} - ${sectionName}`;
      })
      .filter(Boolean); // Remove null entries
  };

  return (
    <div className="step-wrapper">
      <div className="step-header">
        <h2 className="step-title">Select Classes and Sections</h2>
        <p className="step-description">
          Choose the classes and their sections for which you want to generate timetables. 
          Click on a class to view and select its sections.
        </p>
      </div>

      <div className="step-content">
        {/* Search and Controls */}
        <div className="controls-section">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="selection-counter">
            <span className="counter-value">{selectedClasses.length}</span>
            <span className="counter-label">classes selected</span>
            <span className="counter-divider">•</span>
            <span className="counter-value">{selectedSections.length}</span>
            <span className="counter-label">sections selected</span>
          </div>
        </div>

        {/* Classes and Sections List */}
        <div className="classes-list">
          {loadingClasses ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
              </div>
              <p className="loading-text">Loading classes...</p>
            </div>
          ) : filteredClasses.length === 0 && searchTerm ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h4>No classes found</h4>
              <p>Try adjusting your search terms or clear the search filter.</p>
              <button 
                className="action-button secondary small"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            </div>
          ) : classes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h4>No Classes Available</h4>
              <p>Please add classes to your system before generating timetables.</p>
            </div>
          ) : (
            filteredClasses.map((cls) => (
              <div key={cls.id} className="class-row">
                {/* Class Card */}
                <div
                  className={`class-card ${
                    selectedClasses.includes(cls.id) ? 'selected' : ''
                  } ${expandedClass === cls.id ? 'expanded' : ''}`}
                  onClick={() => handleClassSelect(cls.id)}
                >
                  <div className="class-card-content">
                    <div className="card-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls.id)}
                        onChange={() => handleClassSelect(cls.id)}
                        className="checkbox-input"
                      />
                    </div>
                    <div className="card-info">
                      <h4 className="card-title">{cls.name}</h4>
                      <p className="card-description">
                        {cls.description || 'No description available'}
                      </p>
                    </div>
                    <div className="expand-indicator">
                      {selectedClasses.includes(cls.id) ? (
                        <span className="expand-arrow expanded">▼</span>
                      ) : (
                        <span className="expand-arrow">▶</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sections Panel - Positioned to the right */}
                {selectedClasses.includes(cls.id) && (
                  <div className="sections-panel-right">
                    <div className="sections-header">
                      <h5 className="sections-title">
                        <span className="sections-icon">🏫</span>
                        Sections for {cls.name}
                      </h5>
                      {classSections[cls.id] && classSections[cls.id].length > 0 && (
                        <button
                          className="action-button secondary small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAllClassSections(cls.id);
                          }}
                        >
                          {classSections[cls.id].every(section => 
                            selectedSections.includes(createSectionKey(cls.id, section.name))
                          ) ? 'Deselect All' : 'Select All'}
                        </button>
                      )}
                    </div>

                    <div className="sections-content">
                      {loadingSections[cls.id] ? (
                        <div className="loading-state small">
                          <div className="loading-spinner small">
                            <div className="spinner-ring"></div>
                          </div>
                          <p className="loading-text">Loading sections...</p>
                        </div>
                      ) : !classSections[cls.id] || classSections[cls.id].length === 0 ? (
                        <div className="empty-state small">
                          <div className="empty-icon">🏫</div>
                          <p>No sections available for this class</p>
                        </div>
                      ) : (
                        <div className="sections-list-vertical">
                          {classSections[cls.id].map((section) => {
                            const sectionKey = createSectionKey(cls.id, section.name);
                            return (
                              <div
                                key={section._id}
                                className={`section-item ${
                                  selectedSections.includes(sectionKey) ? 'selected' : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSectionSelect(section.name, cls.id);
                                }}
                              >
                                <div className="section-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={selectedSections.includes(sectionKey)}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      handleSectionSelect(section.name, cls.id);
                                    }}
                                    className="checkbox-input"
                                  />
                                </div>
                                <div className="section-info">
                                  <h6 className="section-name">{section.name}</h6>
                                  {section.capacity && (
                                    <p className="section-capacity">
                                      Capacity: {section.capacity} students
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Selection Summary */}
        {selectedClasses.length > 0 && selectedSections.length > 0 && (
          <div className="selection-summary">
            <div className="summary-header">
              <h3 className="summary-title">
                <span className="summary-icon">📋</span>
                Selection Summary
              </h3>
              <div className="summary-badge">
                Ready to proceed
              </div>
            </div>
            
            <div className="summary-content">
              <div className="summary-stats">
                <div className="stat-item">
                  <div className="stat-value">{selectedClasses.length}</div>
                  <div className="stat-label">Classes Selected</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-value">{selectedSections.length}</div>
                  <div className="stat-label">Sections Selected</div>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <div className="stat-value">{selectedSections.length}</div>
                  <div className="stat-label">Timetables to Generate</div>
                </div>
              </div>
              
              <div className="selected-items-preview">
                <h4 className="preview-title">Selected Sections:</h4>
                <div className="selected-tags">
                  {getDisplaySections().slice(0, 6).map((displayName, index) => (
                    <span key={selectedSections[index]} className="selected-tag">
                      {displayName}
                    </span>
                  ))}
                  {selectedSections.length > 6 && (
                    <span className="selected-tag more">
                      +{selectedSections.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassSectionStep;