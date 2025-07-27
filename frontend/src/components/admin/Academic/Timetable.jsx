import React, { useState, useEffect, useRef } from 'react';
import ClassSectionStep from './steps/ClassSectionStep';
import TeacherSubjectStep from './steps/TeacherSubjectStep';
import ConfigurationStep from './steps/ConfigurationStep';
import GenerateStep from './steps/GenerateStep';
// Import the new professional CSS file
import './timetable.css';

const Timetable = () => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [stepValidation, setStepValidation] = useState({
    1: false,
    2: false,
    3: false,
    4: false
  });

  // Step 1: Class and Section Selection
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);

  // Step 2: Subject and Teacher Selection
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [hoursPerWeek, setHoursPerWeek] = useState({});
  const [continuousPeriods, setContinuousPeriods] = useState(true);
  const [subjectContinuitySettings, setSubjectContinuitySettings] = useState({});

  // Step 3: Configuration
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [startTime, setStartTime] = useState('09:00');
  const [periodDuration, setPeriodDuration] = useState(45);
  const [numberOfPeriods, setNumberOfPeriods] = useState(6);
  const [breakConfig, setBreakConfig] = useState([
    { afterPeriod: 2, duration: 15, name: 'Short Break' },
    { afterPeriod: 4, duration: 30, name: 'Lunch Break' }
  ]);

  // Step 4: Generation and Display
  const [timetable, setTimetable] = useState({});
  const [savedTimetables, setSavedTimetables] = useState([]);
  const [persistentTimetables, setPersistentTimetables] = useState({});
  const [teacherAssignmentMemory, setTeacherAssignmentMemory] = useState({});
  const [teacherAvailabilityMatrix, setTeacherAvailabilityMatrix] = useState({});
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // UI states
  const [fetchError, setFetchError] = useState(null);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Refs
  const printRef = useRef();

  // Steps configuration
  const steps = [
    { id: 1, title: 'Class & Section', component: 'ClassSectionStep' },
    { id: 2, title: 'Subject & Teacher', component: 'TeacherSubjectStep' },
    { id: 3, title: 'Configuration', component: 'ConfigurationStep' },
    { id: 4, title: 'Generate', component: 'GenerateStep' }
  ];

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedTimetables');
    if (saved) {
      setSavedTimetables(JSON.parse(saved));
    }
    
    const persistent = localStorage.getItem('persistentTimetables');
    if (persistent) {
      setPersistentTimetables(JSON.parse(persistent));
    }
    
    const teacherMemory = localStorage.getItem('teacherAssignmentMemory');
    if (teacherMemory) {
      setTeacherAssignmentMemory(JSON.parse(teacherMemory));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('savedTimetables', JSON.stringify(savedTimetables));
  }, [savedTimetables]);

  useEffect(() => {
    localStorage.setItem('persistentTimetables', JSON.stringify(persistentTimetables));
  }, [persistentTimetables]);

  useEffect(() => {
    localStorage.setItem('teacherAssignmentMemory', JSON.stringify(teacherAssignmentMemory));
  }, [teacherAssignmentMemory]);

  // Step validation logic
  useEffect(() => {
    setStepValidation(prev => ({
      ...prev,
      1: selectedClasses.length > 0 && selectedSections.length > 0
    }));
  }, [selectedClasses, selectedSections]);

  useEffect(() => {
    setStepValidation(prev => ({
      ...prev,
      2: selectedSubjects.length > 0 && selectedTeachers.length > 0
    }));
  }, [selectedSubjects, selectedTeachers]);

  useEffect(() => {
    setStepValidation(prev => ({
      ...prev,
      3: selectedDays.length > 0 && startTime && periodDuration > 0 && numberOfPeriods > 0
    }));
  }, [selectedDays, startTime, periodDuration, numberOfPeriods]);

  // Navigation functions
  const nextStep = () => {
    if (currentStep < 4 && stepValidation[currentStep]) {
      setCurrentStep(currentStep + 1);
      setFetchError(null);
    } else {
      setFetchError('Please complete all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setFetchError(null);
    }
  };

  const goToStep = (step) => {
    if (step <= currentStep || stepValidation[step - 1]) {
      setCurrentStep(step);
      setFetchError(null);
    }
  };

  // Step 1 props
  const step1Props = {
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
  };

  // Step 2 props
  const step2Props = {
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
  };

  // Step 3 props
  const step3Props = {
    selectedDays,
    setSelectedDays,
    startTime,
    setStartTime,
    periodDuration,
    setPeriodDuration,
    numberOfPeriods,
    setNumberOfPeriods,
    breakConfig,
    setBreakConfig,
    fetchError,
    setFetchError
  };

  // Step 4 props
  const step4Props = {
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
    setFetchError,
    classes
  };

  // Calculate progress percentage for step indicator
  const progressPercentage = (currentStep / steps.length) * 100;

  // Render current step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ClassSectionStep {...step1Props} />;
      case 2:
        return <TeacherSubjectStep {...step2Props} />;
      case 3:
        return <ConfigurationStep {...step3Props} />;
      case 4:
        return <GenerateStep {...step4Props} />;
      default:
        return <ClassSectionStep {...step1Props} />;
    }
  };

  return (
    <div className="timetable-container">
      {/* Professional Header */}
      <div className="timetable-header">
        <h1 className="timetable-title">Professional Timetable Generator</h1>
        <p className="timetable-subtitle">
          Create comprehensive timetables with our intuitive step-by-step process
        </p>
      </div>

      {/* Step Progress Indicator */}
      <div className="step-progress">
        <div className="step-progress-bar">
          {steps.map((step, index) => (
            <div key={step.id} className="step-item">
              <div
                className={`step-circle ${
                  currentStep === step.id ? 'active' : 
                  currentStep > step.id ? 'completed' : 'pending'
                } ${stepValidation[step.id] ? 'validated' : ''}`}
                onClick={() => goToStep(step.id)}
              >
                {currentStep > step.id && stepValidation[step.id] ? '✓' : step.id}
              </div>
              <div className="step-label">{step.title}</div>
              {index < steps.length - 1 && (
                <div className={`step-line ${currentStep > step.id ? 'completed' : ''}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {fetchError && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{fetchError}</span>
            <button 
              className="error-close" 
              onClick={() => setFetchError(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="step-content">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="step-navigation">
        <button
          className="nav-button prev-button"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          ← Previous
        </button>
        
        <div className="step-indicator">
          <span>Step {currentStep} of {steps.length}</span>
          <div 
            className="progress-bar"
            style={{ 
              '--progress': `${progressPercentage}%`,
              width: '8rem',
              height: '4px',
              background: '#e2e8f0',
              borderRadius: '2px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${progressPercentage}%`,
                background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
        
        {currentStep < 4 ? (
          <button
            className="nav-button next-button"
            onClick={nextStep}
            disabled={!stepValidation[currentStep]}
          >
            Next →
          </button>
        ) : (
          <button
            className="nav-button generate-button"
            onClick={() => {
              // The generate functionality will be handled in GenerateStep
              // This is just for UI consistency
            }}
          >
            Generate Timetable
          </button>
        )}
      </div>
    </div>
  );
};

export default Timetable;
