import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../../config/apiConfig';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const slotsPerDay = 6;

const Timetable = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [hoursPerWeek, setHoursPerWeek] = useState({});
  const [timetable, setTimetable] = useState({});
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(getApiUrl('/api/v1/admin/classes'), {
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
      }
    };
    fetchClasses();
  }, []);

  // Fetch sections when a class is selected
  useEffect(() => {
    const fetchSections = async () => {
      if (!selectedClass) {
        setSections([]);
        setSelectedSections([]);
        return;
      }
      try {
        const response = await fetch(getApiUrl(`/api/v1/admin/sections/class/${selectedClass}`), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }
        const data = await response.json();
        if (data.success) {
          setSections(data.data);
          setSelectedSections([]);
        }
      } catch (error) {
        setFetchError('Failed to load sections: ' + error.message);
      }
    };
    fetchSections();
  }, [selectedClass]);

  // Fetch subjects when any section is selected
  useEffect(() => {
    const fetchSubjects = async () => {
      if (selectedSections.length === 0) {
        setSubjects([]);
        return;
      }
      try {
        const response = await fetch(getApiUrl('/api/v1/admin/academic/subjects'), {
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
      }
    };
    fetchSubjects();
  }, [selectedSections]);

  // Modify the teacher fetching useEffect
  useEffect(() => {
    const fetchTeachers = async () => {
      if (selectedSections.length === 0 || selectedSubjects.length === 0) {
        setTeachers([]);
        return;
      }
      setLoadingTeachers(true);
      try {
        // Get all qualified teachers for each selected subject
        const qualifiedTeachersPromises = selectedSubjects.map(async subjectId => {
          const subject = subjects.find(s => s._id === subjectId);
          if (!subject) return [];
          return getQualifiedTeachers(subject.name);
        });

        const qualifiedTeachersArrays = await Promise.all(qualifiedTeachersPromises);
        
        // Combine and deduplicate teachers based on _id
        const uniqueTeachers = qualifiedTeachersArrays
          .flat()
          .reduce((unique, teacher) => {
            if (!unique.some(t => t._id === teacher._id)) {
              unique.push(teacher);
            }
            return unique;
          }, []);

        setTeachers(uniqueTeachers);
      } catch (error) {
        setFetchError('Failed to load qualified teachers: ' + error.message);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, [selectedSections, selectedSubjects, subjects]); // Added selectedSubjects and subjects as dependencies

  // Handle section selection
  const handleSectionSelect = (sectionName) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionName)) {
        return prev.filter(name => name !== sectionName);
      }
      return [...prev, sectionName];
    });
  };

  const handleSubjectSelect = (subjectId) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        return prev.filter(id => id !== subjectId);
      }
      return [...prev, subjectId];
    });
  };

  const handleTeacherSelect = (teacherId) => {
    setSelectedTeachers(prev => {
      if (prev.includes(teacherId)) {
        return prev.filter(id => id !== teacherId);
      }
      return [...prev, teacherId];
    });
  };

  const handleHoursChange = (subjectId, hours) => {
    setHoursPerWeek(prev => ({
      ...prev,
      [subjectId]: Math.max(1, Math.min(10, parseInt(hours) || 1))
    }));
  };

  const getQualifiedTeachers = async (subject) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/teacher/teachers-by-subject?subject=${encodeURIComponent(subject)}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to fetch teachers');
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setFetchError('Failed to fetch teachers: ' + error.message);
      return [];
    }
  };

  const initializeTimetable = () => {
    const table = {};
    selectedSections.forEach((section) => {
      table[section] = {};
      days.forEach((day) => {
        table[section][day] = new Array(slotsPerDay).fill(null);
      });
    });
    return table;
  };

  const teacherAvailable = (teacherName, day, slot, currentTimetable) => {
    for (let section of Object.keys(currentTimetable)) {
      const assignment = currentTimetable[section][day][slot];
      if (assignment && assignment.teacher === teacherName) return false;
    }
    return true;
  };

  const generateTimetable = async () => {
    if (selectedSections.length === 0 || selectedSubjects.length === 0 || selectedTeachers.length === 0) {
      setFetchError('Please select at least one section, subject, and teacher');
      return;
    }

    let generated = initializeTimetable();
    const teacherLoad = {};
    const sectionSubjectTeachers = {};
    // Track subject slots per day for each section
    const subjectSlotsPerDay = {};

    // Generate timetable for each section
    for (const section of selectedSections) {
      sectionSubjectTeachers[section] = {};
      subjectSlotsPerDay[section] = {};
      days.forEach(day => {
        subjectSlotsPerDay[section][day] = {};
      });

      for (const subjectId of selectedSubjects) {
        const subject = subjects.find(s => s._id === subjectId);
        const requiredSlots = hoursPerWeek[subjectId] || 1;
        
        let assignedTeacher;
        
        if (sectionSubjectTeachers[section][subject.name]) {
          assignedTeacher = sectionSubjectTeachers[section][subject.name];
        } else {
          const qualifiedTeachers = await getQualifiedTeachers(subject.name);
          const availableTeachers = qualifiedTeachers.filter(t => selectedTeachers.includes(t._id));

          if (availableTeachers.length === 0) {
            console.warn(`No qualified teachers available for ${subject.name} in section ${section}. Skipping.`);
            continue;
          }

          assignedTeacher = availableTeachers[Math.floor(Math.random() * availableTeachers.length)];
          sectionSubjectTeachers[section][subject.name] = assignedTeacher;
        }

        let slotsAssigned = 0;
        let attempts = 0;

        while (slotsAssigned < requiredSlots && attempts < 1000) {
          attempts++;
          const day = days[Math.floor(Math.random() * days.length)];
          
          // Check if subject already has slots on this day
          const currentDaySlots = subjectSlotsPerDay[section][day][subject.name] || 0;
          if (currentDaySlots >= 2) continue; // Skip if subject already has 2 slots on this day
          
          // Determine how many slots we can assign on this day
          const maxSlotsForDay = Math.min(
            2 - currentDaySlots, // Maximum 2 slots per day minus already assigned
            requiredSlots - slotsAssigned // Remaining slots needed
          );

          // Find consecutive available slots
          let availableConsecutiveSlots = [];
          for (let startSlot = 0; startSlot <= slotsPerDay - maxSlotsForDay; startSlot++) {
            let consecutive = true;
            let teacherFree = true;
            
            // Check if we have enough consecutive slots available
            for (let offset = 0; offset < maxSlotsForDay; offset++) {
              const currentSlot = startSlot + offset;
              if (generated[section][day][currentSlot] || 
                  !teacherAvailable(assignedTeacher.name, day, currentSlot, generated)) {
                consecutive = false;
                teacherFree = false;
                break;
              }
            }
            
            if (consecutive && teacherFree) {
              availableConsecutiveSlots.push(startSlot);
            }
          }

          if (availableConsecutiveSlots.length === 0) continue;

          // Randomly select one of the available starting slots
          const startSlot = availableConsecutiveSlots[
            Math.floor(Math.random() * availableConsecutiveSlots.length)
          ];

          // Assign consecutive slots
          for (let offset = 0; offset < maxSlotsForDay; offset++) {
            const currentSlot = startSlot + offset;
            generated[section][day][currentSlot] = { 
              subject: subject.name, 
              teacher: assignedTeacher.name 
            };
            teacherLoad[assignedTeacher.name] = (teacherLoad[assignedTeacher.name] || 0) + 1;
            slotsAssigned++;
            
            // Update the subject slots counter for this day
            subjectSlotsPerDay[section][day][subject.name] = 
              (subjectSlotsPerDay[section][day][subject.name] || 0) + 1;
          }
        }

        if (slotsAssigned < requiredSlots) {
          console.warn(`Could not assign all slots for ${subject.name} in section ${section}.`);
        }
      }
    }

    // Add validation to check if all required slots were assigned
    const unassignedSlots = [];
    for (const section of selectedSections) {
      for (const subjectId of selectedSubjects) {
        const subject = subjects.find(s => s._id === subjectId);
        const requiredSlots = hoursPerWeek[subjectId] || 1;
        
        let assignedSlots = 0;
        for (const day of days) {
          for (const slot of generated[section][day]) {
            if (slot && slot.subject === subject.name) {
              assignedSlots++;
            }
          }
        }
        
        if (assignedSlots < requiredSlots) {
          unassignedSlots.push({
            section,
            subject: subject.name,
            required: requiredSlots,
            assigned: assignedSlots
          });
        }
      }
    }

    if (unassignedSlots.length > 0) {
      setFetchError(
        'Could not assign all required slots. Please check teacher availability:\n' +
        unassignedSlots.map(({ section, subject, required, assigned }) =>
          `${section} - ${subject}: ${assigned}/${required} slots assigned`
        ).join('\n')
      );
    }

    setTimetable(generated);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Timetable Generator</h1>

      {fetchError && <p style={{ color: 'red' }}>Error: {fetchError}</p>}

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Select Class:
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedClass && (
        <div style={{ marginBottom: '1rem' }}>
          <h3>Select Sections:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {sections.map((section) => (
              <div key={section._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id={`section-${section._id}`}
                  checked={selectedSections.includes(section.name)}
                  onChange={() => handleSectionSelect(section.name)}
                />
                <label htmlFor={`section-${section._id}`}>{section.name}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSections.length > 0 && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <h3>Select Subjects</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {subjects.map((subject) => (
                <div key={subject._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id={`subject-${subject._id}`}
                    checked={selectedSubjects.includes(subject._id)}
                    onChange={() => handleSubjectSelect(subject._id)}
                  />
                  <label htmlFor={`subject-${subject._id}`}>{subject.name}</label>
                  {selectedSubjects.includes(subject._id) && (
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={hoursPerWeek[subject._id] || 1}
                      onChange={(e) => handleHoursChange(subject._id, e.target.value)}
                      style={{ width: '50px' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h3>Select Teachers</h3>
            {loadingTeachers ? (
              <p>Loading qualified teachers...</p>
            ) : teachers.length === 0 ? (
              <p>No qualified teachers found for selected subjects</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {teachers.map((teacher) => (
                  <div key={teacher._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id={`teacher-${teacher._id}`}
                      checked={selectedTeachers.includes(teacher._id)}
                      onChange={() => handleTeacherSelect(teacher._id)}
                    />
                    <label htmlFor={`teacher-${teacher._id}`}>
                      {teacher.name} ({teacher.department || 'No Department'})
                      {teacher.teachingAssignments && (
                        <small style={{ marginLeft: '0.5rem', color: '#666' }}>
                          {teacher.teachingAssignments
                            .filter(assignment => assignment.subject)
                            .map(assignment => assignment.subject.name)
                            .join(', ')}
                        </small>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={generateTimetable} 
            disabled={selectedSubjects.length === 0 || selectedTeachers.length === 0}
          >
            Generate Timetable
          </button>
        </>
      )}

      {loadingTeachers && <p>Loading teachers...</p>}

      {Object.keys(timetable).length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          {selectedSections.map(section => (
            <div key={section} style={{ marginBottom: '2rem' }}>
              <h2>Generated Timetable for {section}</h2>
              <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Day / Slot</th>
                    {Array.from({ length: slotsPerDay }, (_, i) => (
                      <th key={i}>Slot {i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day}>
                      <td>{day}</td>
                      {timetable[section][day].map((entry, i) => (
                        <td key={i} style={{ minWidth: '100px' }}>
                          {entry ? (
                            <div>
                              <strong>{entry.subject}</strong>
                              <br />
                              <small>{entry.teacher}</small>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timetable;