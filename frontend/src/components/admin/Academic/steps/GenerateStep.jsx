import React, { useState, useEffect } from 'react';
import './style/GenerateStep.css'; // Import the CSS file

const GenerateStep = ({
  timetable,
  setTimetable,
  selectedClasses,
  selectedSections,
  selectedSubjects,
  selectedTeachers,
  hoursPerWeek,
  subjects,
  teachers,
  selectedDays,
  startTime,
  periodDuration,
  numberOfPeriods,
  breakConfig,
  continuousPeriods,
  subjectContinuitySettings,
  savedTimetables,
  setSavedTimetables,
  persistentTimetables,
  setPersistentTimetables,
  teacherAssignmentMemory,
  setTeacherAssignmentMemory,
  teacherAvailabilityMatrix,
  setTeacherAvailabilityMatrix,
  history,
  setHistory,
  historyIndex,
  setHistoryIndex,
  printRef,
  fetchError,
  classes,
  setFetchError
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, print
  const [conflicts, setConflicts] = useState([]);
  const [showConflicts, setShowConflicts] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [editHistory, setEditHistory] = useState([]);
  const [editHistoryIndex, setEditHistoryIndex] = useState(-1);

  // Load saved timetables from localStorage on component mount
  useEffect(() => {
    const loadSavedTimetables = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('savedTimetables') || '[]');
        setSavedTimetables(saved);
      } catch (error) {
        console.error('Error loading saved timetables:', error);
        setSavedTimetables([]);
      }
    };

    loadSavedTimetables();
  }, [setSavedTimetables]);

  // Save timetables to localStorage whenever savedTimetables changes
  useEffect(() => {
    try {
      localStorage.setItem('savedTimetables', JSON.stringify(savedTimetables));
    } catch (error) {
      console.error('Error saving timetables to localStorage:', error);
    }
  }, [savedTimetables]);

  // Initialize selected section
  useEffect(() => {
    if (selectedSections.length > 0 && !selectedSection) {
      setSelectedSection(selectedSections[0]);
    }
  }, [selectedSections, selectedSection]);

  // Initialize edit history when timetable changes
  useEffect(() => {
    if (timetable && Object.keys(timetable).length > 0) {
      setEditHistory([JSON.parse(JSON.stringify(timetable))]);
      setEditHistoryIndex(0);
    }
  }, [timetable]);

  // Generate time slots
  const generateTimeSlots = () => {
    if (!startTime || !periodDuration || !numberOfPeriods) return [];
    
    const [hours, minutes] = startTime.split(':').map(Number);
    let currentMinutes = hours * 60 + minutes;
    const slots = [];
    
    for (let i = 1; i <= numberOfPeriods; i++) {
      const startHours = Math.floor(currentMinutes / 60);
      const startMins = currentMinutes % 60;
      const endMinutes = currentMinutes + periodDuration;
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      
      slots.push({
        period: i,
        startTime: `${startHours.toString().padStart(2, '0')}:${startMins.toString().padStart(2, '0')}`,
        endTime: `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
      });
      
      currentMinutes = endMinutes;
      
      // Add break if configured
      const breakAfterPeriod = breakConfig.find(b => b.afterPeriod === i);
      if (breakAfterPeriod) {
        currentMinutes += breakAfterPeriod.duration;
      }
    }
    
    return slots;
  };

  // Save edit state for undo/redo
  const saveEditState = (newTimetable) => {
    const newHistory = [...editHistory.slice(0, editHistoryIndex + 1), JSON.parse(JSON.stringify(newTimetable))];
    setEditHistory(newHistory);
    setEditHistoryIndex(newHistory.length - 1);
  };

  // Drag and drop handlers
  const handleDragStart = (e, sourceData) => {
    setDraggedItem(sourceData);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetData) => {
    e.preventDefault();
    
    if (!draggedItem || !isEditMode) return;

    const { section: sourceSection, day: sourceDay, period: sourcePeriod } = draggedItem;
    const { section: targetSection, day: targetDay, period: targetPeriod } = targetData;

    // Don't allow drops on the same cell
    if (sourceSection === targetSection && sourceDay === targetDay && sourcePeriod === targetPeriod) {
      return;
    }

    const newTimetable = JSON.parse(JSON.stringify(timetable));
    
    // Get source and target cell data
    const sourceCell = newTimetable[sourceSection][sourceDay][sourcePeriod];
    const targetCell = newTimetable[targetSection][targetDay][targetPeriod];

    // Perform the swap
    newTimetable[sourceSection][sourceDay][sourcePeriod] = targetCell;
    newTimetable[targetSection][targetDay][targetPeriod] = sourceCell;

    // Check for conflicts
    const conflicts = validateTimetableEdit(newTimetable, targetSection, targetDay, targetPeriod, sourceCell);
    
    if (conflicts.length > 0) {
      setConflicts(conflicts);
      setShowConflicts(true);
      // Still allow the move but show conflicts
    } else {
      setConflicts([]);
      setShowConflicts(false);
    }

    // Save state for undo/redo
    saveEditState(newTimetable);
    setTimetable(newTimetable);
    setSuccessMessage('Timetable updated successfully!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  // Validate timetable edits for conflicts
  const validateTimetableEdit = (newTimetable, section, day, period, cellData) => {
    const conflicts = [];
    
    if (!cellData?.teacher || !cellData?.subject) return conflicts;

    // Check for teacher conflicts (same teacher in multiple places at same time)
    Object.keys(newTimetable).forEach(sectionKey => {
      if (sectionKey === section) return;
      
      const otherCell = newTimetable[sectionKey][day]?.[period];
      if (otherCell?.teacher?.id === cellData.teacher.id) {
        conflicts.push({
          type: 'Teacher Conflict',
          section: section,
          day: day,
          period: period,
          message: `${cellData.teacher.name} is already scheduled in ${sectionKey} during this time slot.`
        });
      }
    });

    return conflicts;
  };

  // Manual edit undo/redo
  const undoEdit = () => {
    if (editHistoryIndex > 0) {
      const newIndex = editHistoryIndex - 1;
      setEditHistoryIndex(newIndex);
      setTimetable(editHistory[newIndex]);
      setSuccessMessage('Edit undone');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  const redoEdit = () => {
    if (editHistoryIndex < editHistory.length - 1) {
      const newIndex = editHistoryIndex + 1;
      setEditHistoryIndex(newIndex);
      setTimetable(editHistory[newIndex]);
      setSuccessMessage('Edit redone');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  // Clear a time slot
  const clearTimeSlot = (section, day, period) => {
    if (!isEditMode) return;

    const newTimetable = JSON.parse(JSON.stringify(timetable));
    const timeSlots = generateTimeSlots();
    const slot = timeSlots.find(s => s.period === period);
    
    newTimetable[section][day][period] = {
      subject: null,
      teacher: null,
      startTime: slot?.startTime || '',
      endTime: slot?.endTime || ''
    };

    saveEditState(newTimetable);
    setTimetable(newTimetable);
    setSuccessMessage('Time slot cleared');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  // Assign subject to empty slot
  const assignSubjectToSlot = (section, day, period, subjectId, teacherId) => {
    if (!isEditMode) return;

    const subject = subjects.find(s => s._id === subjectId);
    const teacher = teachers.find(t => t.id === teacherId);
    
    if (!subject || !teacher) return;

    const newTimetable = JSON.parse(JSON.stringify(timetable));
    const timeSlots = generateTimeSlots();
    const slot = timeSlots.find(s => s.period === period);

    newTimetable[section][day][period] = {
      subject: subject,
      teacher: teacher,
      startTime: slot?.startTime || '',
      endTime: slot?.endTime || ''
    };

    // Check for conflicts
    const conflicts = validateTimetableEdit(newTimetable, section, day, period, newTimetable[section][day][period]);
    
    if (conflicts.length > 0) {
      setConflicts(conflicts);
      setShowConflicts(true);
    } else {
      setConflicts([]);
      setShowConflicts(false);
    }

    saveEditState(newTimetable);
    setTimetable(newTimetable);
    setSuccessMessage('Subject assigned successfully!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  // Timetable generation algorithm (existing code remains the same)
  const generateTimetable = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Initializing...');
    setConflicts([]);
    setFetchError('');
    setSuccessMessage('');

    try {
      // Step 1: Validate input
      setGenerationStatus('Validating input...');
      await new Promise(res => setTimeout(res, 200));
      setGenerationProgress(10);
      
      if (!selectedSections.length || !selectedSubjects.length || !selectedTeachers.length) {
        throw new Error('Please ensure all required selections are made in previous steps.');
      }
      
      // Step 2: Create base timetable structure
      setGenerationStatus('Creating timetable structure...');
      await new Promise(res => setTimeout(res, 200));
      setGenerationProgress(25);
      
      const newTimetable = {};
      const timeSlots = generateTimeSlots();
      
      selectedSections.forEach(section => {
        newTimetable[section] = {};
        selectedDays.forEach(day => {
          newTimetable[section][day] = {};
          timeSlots.forEach(slot => {
            newTimetable[section][day][slot.period] = {
              subject: null,
              teacher: null,
              startTime: slot.startTime,
              endTime: slot.endTime
            };
          });
        });
      });
      
      // Step 3: Distribute subjects based on hours per week
      setGenerationStatus('Distributing subjects...');
      await new Promise(res => setTimeout(res, 200));
      setGenerationProgress(50);
      
      const subjectDistribution = {};
      selectedSubjects.forEach(subjectId => {
        const subject = subjects.find(s => s._id === subjectId);
        const hours = hoursPerWeek[subjectId] || 5;
        subjectDistribution[subjectId] = {
          subject: subject,
          totalHours: hours,
          remainingHours: hours
        };
      });
      
      // Step 4: Assign subjects to time slots
      setGenerationStatus('Assigning subjects to time slots...');
      await new Promise(res => setTimeout(res, 200));
      setGenerationProgress(75);
      
      const teacherSchedule = {};
      const detectedConflicts = [];
      
      selectedTeachers.forEach(teacherId => {
        teacherSchedule[teacherId] = {};
        selectedDays.forEach(day => {
          teacherSchedule[teacherId][day] = {};
          timeSlots.forEach(slot => {
            teacherSchedule[teacherId][day][slot.period] = null;
          });
        });
      });
      
      for (const section of selectedSections) {
        const sectionSubjects = JSON.parse(JSON.stringify(subjectDistribution));
        
        for (const day of selectedDays) {
          for (const slot of timeSlots) {
            const availableSubjects = Object.keys(sectionSubjects).filter(
              subjectId => sectionSubjects[subjectId].remainingHours > 0
            );
            
            if (availableSubjects.length > 0) {
              const randomSubjectId = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
              const subjectInfo = sectionSubjects[randomSubjectId];
              const subject = subjectInfo.subject;
              
              const availableTeachers = selectedTeachers.filter(teacherId => {
                const teacher = teachers.find(t => t.id === teacherId);
                return teacher && 
                       teacher.subjects && 
                       teacher.subjects.includes(subject.name) &&
                       !teacherSchedule[teacherId][day][slot.period];
              });
              
              if (availableTeachers.length > 0) {
                const randomTeacherId = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
                const teacher = teachers.find(t => t.id === randomTeacherId);
                
                newTimetable[section][day][slot.period] = {
                  subject: subject,
                  teacher: teacher,
                  startTime: slot.startTime,
                  endTime: slot.endTime
                };
                
                teacherSchedule[randomTeacherId][day][slot.period] = section;
                subjectInfo.remainingHours--;

              } else {
                detectedConflicts.push({
                  type: 'Teacher Unavailable',
                  section: section,
                  day: day,
                  period: slot.period,
                  subject: subject.name,
                  message: `No available teacher for ${subject.name} in ${section} on ${day}, Period ${slot.period}.`
                });
              }
            }
          }
        }
      }
      
      // Step 5: Final validation
      setGenerationStatus('Finalizing and checking for conflicts...');
      await new Promise(res => setTimeout(res, 200));
      setGenerationProgress(90);
      
      setConflicts(detectedConflicts);
      
      // Step 6: Save timetable
      setGenerationStatus('Saving timetable...');
      setGenerationProgress(100);
      
      setTimetable(newTimetable);
      
      const newHistory = [...history.slice(0, historyIndex + 1), newTimetable];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      setGenerationStatus('Timetable generated successfully!');
      
    } catch (error) {
      setFetchError('Generation failed: ' + error.message);
      setGenerationStatus('Generation failed');
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
      }, 1000);
      setTimeout(() => {
        setGenerationProgress(0);
        setGenerationStatus('');
      }, 2000);
    }
  };
  
  // Save timetable with improved persistence
  const saveTimetable = () => {
    if (!timetable || Object.keys(timetable).length === 0) {
      setFetchError('No timetable to save.');
      return;
    }
    
    const savedData = {
      id: Date.now().toString(),
      name: `Timetable_${new Date().toISOString().split('T')[0]}`,
      timetable: timetable,
      config: {
        selectedSections,
        selectedSubjects,
        selectedTeachers,
        selectedDays,
        startTime,
        periodDuration,
        numberOfPeriods,
        breakConfig
      },
      createdAt: new Date().toISOString()
    };
    
    try {
      const updatedSavedTimetables = [...savedTimetables, savedData];
      setSavedTimetables(updatedSavedTimetables);
      localStorage.setItem('savedTimetables', JSON.stringify(updatedSavedTimetables));
      setSuccessMessage('Timetable saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setFetchError('Failed to save timetable: ' + error.message);
    }
  };
  
  // Load saved timetable
  const loadSavedTimetable = (savedData) => {
    setTimetable(savedData.timetable);
    setSuccessMessage(`Loaded timetable: ${savedData.name}`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  // Delete saved timetable
  const deleteSavedTimetable = (timetableId) => {
    try {
      const updatedSavedTimetables = savedTimetables.filter(s => s.id !== timetableId);
      setSavedTimetables(updatedSavedTimetables);
      localStorage.setItem('savedTimetables', JSON.stringify(updatedSavedTimetables));
      setSuccessMessage('Timetable deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setFetchError('Failed to delete timetable: ' + error.message);
    }
  };
  
  // Existing print functions remain the same...
  const printTimetable = () => {
    if (!timetable || Object.keys(timetable).length === 0) {
      setFetchError('No timetable to print.');
      return;
    }

    setIsPrinting(true);
    
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      setFetchError('Popup blocked. Please allow popups for printing.');
      setIsPrinting(false);
      return;
    }

    const printContent = generatePrintContent();
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Timetable - ${selectedSection}</title>
          <style>
            ${getPrintStyles()}
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsPrinting(false);
      }, 500);
    };
  };

  const generatePrintContent = () => {
    if (!timetable || !selectedSection || !timetable[selectedSection]) {
      return '<p>No timetable data available</p>';
    }

    const timeSlots = generateTimeSlots();
    const sectionData = timetable[selectedSection];
    const currentDate = new Date().toLocaleDateString();

    let html = `
      <div class="print-header">
        <h1>Class Timetable - ${selectedSection}</h1>
        <p>Generated on: ${currentDate}</p>
      </div>
      <table class="print-timetable">
        <thead>
          <tr>
            <th class="time-column">Time/Period</th>
            ${selectedDays.map(day => `<th>${day}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    timeSlots.forEach(slot => {
      html += `
        <tr>
          <td class="time-cell">
            <div class="period-info">
              <strong>Period ${slot.period}</strong><br>
              ${slot.startTime} - ${slot.endTime}
            </div>
          </td>
      `;

      selectedDays.forEach(day => {
        const cellData = sectionData[day]?.[slot.period];
        html += `
          <td class="subject-cell">
            ${cellData?.subject ? `
              <div class="subject-info">
                <div class="subject-name">${cellData.subject.name}</div>
                <div class="subject-code">${cellData.subject.code}</div>
                <div class="teacher-name">${cellData.teacher?.name || 'TBD'}</div>
              </div>
            ` : '<div class="free-period">Free</div>'}
          </td>
        `;
      });

      html += '</tr>';
    });

    html += `
        </tbody>
      </table>
    `;

    return html;
  };

  const getPrintStyles = () => {
    return `
      @media print {
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .print-header { text-align: center; margin-bottom: 30px; }
        .print-header h1 { margin: 0; font-size: 24px; color: #333; }
        .print-header p { margin: 5px 0 0 0; color: #666; }
        
        .print-timetable {
          width: 100%;
          border-collapse: collapse;
          margin: 0 auto;
          font-size: 12px;
        }
        
        .print-timetable th,
        .print-timetable td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
          vertical-align: top;
        }
        
        .print-timetable th {
          background-color: #f5f5f5;
          font-weight: bold;
          font-size: 13px;
        }
        
        .time-cell {
          background-color: #f9f9f9;
          font-weight: bold;
          width: 120px;
        }
        
        .period-info {
          line-height: 1.4;
        }
        
        .subject-cell {
          width: 140px;
          height: 60px;
        }
        
        .subject-info {
          padding: 4px;
        }
        
        .subject-name {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 2px;
        }
        
        .subject-code {
          font-size: 10px;
          color: #666;
          margin-bottom: 2px;
        }
        
        .teacher-name {
          font-size: 10px;
          color: #888;
        }
        
        .free-period {
          color: #999;
          font-style: italic;
        }
      }
      
      @page {
        margin: 1cm;
        size: A4 landscape;
      }
    `;
  };
  
  // Undo/Redo functionality
  const undoTimetable = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setTimetable(history[newIndex]);
    }
  };
  
  const redoTimetable = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setTimetable(history[newIndex]);
    }
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

  // Helper function to get display name for section (Class - Section)
  const getSectionDisplayName = (sectionKey) => {
    const classId = getClassIdFromKey(sectionKey);
    const sectionName = getSectionNameFromKey(sectionKey);
    
    // Find the class name
    const foundClass = classes.find(cls => String(cls.id) === String(classId) || String(cls._id) === String(classId));
    const className = foundClass ? foundClass.name : 'Unknown Class';
    
    return `${className} - ${sectionName}`;
  };

  // Render manual edit controls
  const renderManualEditControls = () => {
    if (!isEditMode) return null;

    return (
      <div className="manual-edit-controls">
        <div className="edit-instructions">
          <h4>Manual Edit Mode Active</h4>
          <p>• Drag and drop subjects between time slots</p>
          <p>• Double-click on empty slots to assign subjects</p>
          <p>• Right-click on filled slots to clear them</p>
        </div>
        
        <div className="edit-actions">
          <button className="edit-action-btn" onClick={undoEdit} disabled={editHistoryIndex <= 0}>
            ↶ Undo Edit
          </button>
          <button className="edit-action-btn" onClick={redoEdit} disabled={editHistoryIndex >= editHistory.length - 1}>
            ↷ Redo Edit
          </button>
        </div>

        <div className="available-subjects">
          <h4>Available Subjects & Teachers</h4>
          <div className="subject-teacher-list">
            {selectedSubjects.map(subjectId => {
              const subject = subjects.find(s => s._id === subjectId);
              const availableTeachers = selectedTeachers.filter(teacherId => {
                const teacher = teachers.find(t => t.id === teacherId);
                return teacher && teacher.subjects && teacher.subjects.includes(subject?.name);
              });

              return (
                <div key={subjectId} className="subject-item">
                  <span className="subject-name">{subject?.name} ({subject?.code})</span>
                  <span className="teacher-count">{availableTeachers.length} teachers</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced timetable cell with edit capabilities
  const renderEditableCell = (section, day, period, cellData) => {
    const cellKey = `${section}-${day}-${period}`;
    const isEmpty = !cellData?.subject;

    const handleDoubleClick = () => {
      if (!isEditMode || !isEmpty) return;
      
      // Show subject selection modal (you can implement a proper modal)
      const subjectId = prompt('Enter Subject ID to assign:');
      const teacherId = prompt('Enter Teacher ID to assign:');
      
      if (subjectId && teacherId) {
        assignSubjectToSlot(section, day, period, subjectId, teacherId);
      }
    };

    const handleRightClick = (e) => {
      e.preventDefault();
      if (!isEditMode || isEmpty) return;
      
      if (confirm('Clear this time slot?')) {
        clearTimeSlot(section, day, period);
      }
    };

    return (
      <div 
        key={cellKey}
        className={`timetable-cell ${isEditMode ? 'editable' : ''} ${isEmpty ? 'empty' : 'filled'}`}
        draggable={isEditMode && !isEmpty}
        onDragStart={(e) => handleDragStart(e, { section, day, period })}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, { section, day, period })}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleRightClick}
      >
        {cellData?.subject ? (
          <div className="subject-card">
            <div className="subject-name">{cellData.subject.name}</div>
            <div className="subject-code">{cellData.subject.code}</div>
            <div className="teacher-name">{cellData.teacher?.name}</div>
            {isEditMode && (
              <div className="edit-indicators">
                <span className="drag-handle">⋮⋮</span>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-cell">
            {isEditMode && <span className="add-icon">+</span>}
          </div>
        )}
      </div>
    );
  };
  
  // Render timetable grid with edit capabilities
  const renderTimetableGrid = () => {
    if (!timetable || !selectedSection || !timetable[selectedSection]) {
      return (
        <div className="empty-timetable">
          <div className="empty-icon">📅</div>
          <h3>No Timetable Generated</h3>
          <p>Click "Generate New Timetable" to create a new timetable.</p>
        </div>
      );
    }
    
    const timeSlots = generateTimeSlots();
    const sectionData = timetable[selectedSection];
    
    return (
      <div className={`timetable-grid ${isEditMode ? 'edit-mode' : ''}`}>
        <div className="timetable-header">
          <div className="time-column-header">Time</div>
          {selectedDays.map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
        </div>
        
        {timeSlots.map(slot => (
          <div key={slot.period} className="timetable-row">
            <div className="time-column">
              <div className="period-number">Period {slot.period}</div>
              <div className="time-range">{slot.startTime} - {slot.endTime}</div>
            </div>
            
            {selectedDays.map(day => {
              const cellData = sectionData[day]?.[slot.period];
              return renderEditableCell(selectedSection, day, slot.period, cellData);
            })}
          </div>
        ))}
      </div>
    );
  };
  
  // Render timetable list view (existing code remains the same)
  const renderTimetableList = () => {
    if (!timetable || !selectedSection) return null;
    
    const timeSlots = generateTimeSlots();
    const sectionData = timetable[selectedSection];
    
    return (
      <div className="timetable-list">
        {selectedDays.map(day => (
          <div key={day} className="day-schedule">
            <h3 className="day-title">{day}</h3>
            <div className="day-periods">
              {timeSlots.map(slot => {
                const cellData = sectionData[day]?.[slot.period];
                return (
                  <div key={slot.period} className="period-item">
                    <div className="period-time">
                      <span className="period-number">Period {slot.period}</span>
                      <span className="time-range">{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <div className="period-content">
                      {cellData?.subject ? (
                        <div className="subject-details">
                          <div className="subject-name">{cellData.subject.name}</div>
                          <div className="subject-teacher">Teacher: {cellData.teacher?.name}</div>
                        </div>
                      ) : (
                        <div className="free-period">Free Period</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Step 4: Generate & View Timetable</h2>
        <p>Generate, customize, and manage your school's timetables.</p>
      </div>
      
      <div className="step-content-wrapper">
        <div className="generation-section">
          <div className="section-header">
            <h3>Controls</h3>
            <div className="generation-controls">
              <button className="generate-button primary" onClick={generateTimetable} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate New Timetable'}
              </button>
              
              {Object.keys(timetable).length > 0 && (
                <>
                  <button className="save-button" onClick={saveTimetable} disabled={isGenerating}>
                    Save Timetable
                  </button>
                  <button 
                    className={`edit-mode-button ${isEditMode ? 'active' : ''}`} 
                    onClick={() => setIsEditMode(!isEditMode)}
                    disabled={isGenerating}
                  >
                    {isEditMode ? '✓ Exit Edit Mode' : '✏️ Edit Mode'}
                  </button>
                </>
              )}
            </div>
          </div>
          
          {isGenerating && (
            <div className="generation-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${generationProgress}%` }}></div>
              </div>
              <div className="progress-status">{generationStatus}</div>
            </div>
          )}
          
          {fetchError && <div className="error-message">{fetchError}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          {conflicts.length > 0 && (
            <div className="conflicts-section">
              <button className="conflicts-toggle" onClick={() => setShowConflicts(!showConflicts)}>
                ⚠️ {conflicts.length} Conflicts Found {showConflicts ? '(Hide)' : '(Show)'}
              </button>
              
              {showConflicts && (
                <div className="conflicts-list">
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="conflict-item">
                      <div className="conflict-type">{conflict.type}</div>
                      <div className="conflict-message">{conflict.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Manual Edit Controls */}
          {renderManualEditControls()}
        </div>
        
        {Object.keys(timetable).length > 0 && (
          <div className="timetable-section" id="timetable-display">
            <div className="section-header">
              <h3>Generated Timetable {isEditMode && <span className="edit-badge">EDIT MODE</span>}</h3>
              <div className="timetable-controls">
                <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="section-selector">
                  {selectedSections.map(sectionKey => (
                    <option key={sectionKey} value={sectionKey}>
                      {getSectionDisplayName(sectionKey)}
                    </option>
                  ))}
                </select>
                
                <div className="view-mode-toggle">
                  <button className={`view-button ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>Grid</button>
                  <button className={`view-button ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List</button>
                </div>
                
                <div className="action-buttons">
                  <button className="action-btn" onClick={undoTimetable} disabled={historyIndex <= 0}>↶ Undo</button>
                  <button className="action-btn" onClick={redoTimetable} disabled={historyIndex >= history.length - 1}>↷ Redo</button>
                  <button className="action-btn print-btn" onClick={printTimetable} disabled={isPrinting}>
                    {isPrinting ? '🖨️ Printing...' : '🖨️ Print'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="timetable-content" ref={printRef}>
              {viewMode === 'grid' ? renderTimetableGrid() : renderTimetableList()}
            </div>
          </div>
        )}
        
        {savedTimetables.length > 0 && (
          <div className="saved-timetables-section">
            <div className="section-header">
              <h3>Saved Timetables ({savedTimetables.length})</h3>
            </div>
            <div className="saved-timetables-list">
              {savedTimetables.map(saved => (
                <div key={saved.id} className="saved-timetable-item">
                  <div className="saved-info">
                    <h4>{saved.name}</h4>
                    <p>Created: {new Date(saved.createdAt).toLocaleDateString()}</p>
                    <p>Sections: {saved.config?.selectedSections?.join(', ') || 'N/A'}</p>
                  </div>
                  <div className="saved-actions">
                    <button className="load-button" onClick={() => loadSavedTimetable(saved)}>Load</button>
                    <button className="delete-button" onClick={() => deleteSavedTimetable(saved.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateStep;