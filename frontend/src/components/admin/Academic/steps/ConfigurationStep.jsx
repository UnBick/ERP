import React, { useState } from 'react';
import './style/ConfigurationStep.css';

const ConfigurationStep = ({
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
}) => {
  const [showBreakConfig, setShowBreakConfig] = useState(false);

  const daysOfWeek = [
    { id: 'Mon', name: 'Monday' },
    { id: 'Tue', name: 'Tuesday' },
    { id: 'Wed', name: 'Wednesday' },
    { id: 'Thu', name: 'Thursday' },
    { id: 'Fri', name: 'Friday' },
    { id: 'Sat', name: 'Saturday' },
    { id: 'Sun', name: 'Sunday' }
  ];

  // Handle day selection
  const handleDaySelect = (dayId) => {
    setSelectedDays(prev => {
      if (prev.includes(dayId)) {
        return prev.filter(id => id !== dayId);
      } else {
        return [...prev, dayId];
      }
    });
  };

  // Handle select all days
  const handleSelectAllDays = () => {
    const workingDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const allWorkingSelected = workingDays.every(day => selectedDays.includes(day));
    
    if (allWorkingSelected) {
      setSelectedDays([]);
    } else {
      setSelectedDays(workingDays);
    }
  };

  // Handle break configuration
  const handleBreakConfigChange = (index, field, value) => {
    setBreakConfig(prev => {
      const newConfig = [...prev];
      newConfig[index] = {
        ...newConfig[index],
        [field]: field === 'duration' || field === 'afterPeriod' ? parseInt(value) || 0 : value
      };
      return newConfig;
    });
  };

  // Add new break
  const addBreak = () => {
    setBreakConfig(prev => [
      ...prev,
      { afterPeriod: numberOfPeriods, duration: 15, name: 'Break' }
    ]);
  };

  // Remove break
  const removeBreak = (index) => {
    setBreakConfig(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate end time
  const calculateEndTime = () => {
    if (!startTime || !periodDuration || !numberOfPeriods) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    const periodsMinutes = numberOfPeriods * periodDuration;
    const breakMinutes = breakConfig.reduce((sum, breakItem) => sum + breakItem.duration, 0);
    
    const endMinutes = totalMinutes + periodsMinutes + breakMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // Generate time slots preview
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
        const breakEndMinutes = currentMinutes + breakAfterPeriod.duration;
        const breakEndHours = Math.floor(breakEndMinutes / 60);
        const breakEndMins = breakEndMinutes % 60;
        
        slots.push({
          period: `Break`,
          name: breakAfterPeriod.name,
          startTime: `${Math.floor(currentMinutes / 60).toString().padStart(2, '0')}:${(currentMinutes % 60).toString().padStart(2, '0')}`,
          endTime: `${breakEndHours.toString().padStart(2, '0')}:${breakEndMins.toString().padStart(2, '0')}`,
          duration: breakAfterPeriod.duration,
          isBreak: true
        });
        
        currentMinutes = breakEndMinutes;
      }
    }
    
    return slots;
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Step 3: Configure Timetable Settings</h2>
        <p>Set up the basic structure and timing for your timetable.</p>
      </div>

      <div className="step-content-wrapper">
        {/* Days Selection */}
        <div className="config-section">
          <div className="section-header">
            <h3>Select Working Days</h3>
            <div className="selection-controls">
              <button
                className="select-all-button"
                onClick={handleSelectAllDays}
              >
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].every(day => selectedDays.includes(day))
                  ? 'Deselect Working Days'
                  : 'Select Working Days'}
              </button>
              <span className="selection-count">
                {selectedDays.length} days selected
              </span>
            </div>
          </div>

          <div className="days-grid">
            {daysOfWeek.map(day => (
              <div
                key={day.id}
                className={`day-card ${selectedDays.includes(day.id) ? 'selected' : ''}`}
                onClick={() => handleDaySelect(day.id)}
              >
                <div className="day-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day.id)}
                    onChange={() => handleDaySelect(day.id)}
                  />
                </div>
                <div className="day-content">
                  <h4>{day.id}</h4>
                  <p>{day.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Configuration */}
        <div className="config-section">
          <div className="section-header">
            <h3>Time Configuration</h3>
          </div>

          <div className="time-config-grid">
            <div className="config-item">
              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="time-input"
              />
            </div>

            <div className="config-item">
              <label>Period Duration (minutes)</label>
              <input
                type="number"
                min="30"
                max="90"
                step="5"
                value={periodDuration}
                onChange={(e) => setPeriodDuration(parseInt(e.target.value) || 45)}
                className="number-input"
              />
            </div>

            <div className="config-item">
              <label>Number of Periods</label>
              <input
                type="number"
                min="4"
                max="10"
                value={numberOfPeriods}
                onChange={(e) => setNumberOfPeriods(parseInt(e.target.value) || 6)}
                className="number-input"
              />
            </div>

            <div className="config-item">
              <label>End Time</label>
              <div className="calculated-time">
                {calculateEndTime() || '--:--'}
              </div>
            </div>
          </div>
        </div>

        {/* Break Configuration */}
        <div className="config-section">
          <div className="section-header">
            <h3>Break Configuration</h3>
            <button
              className="toggle-button"
              onClick={() => setShowBreakConfig(!showBreakConfig)}
            >
              {showBreakConfig ? 'Hide' : 'Show'}
            </button>
          </div>

          {showBreakConfig && (
            <div className="break-config">
              <div className="break-list">
                {breakConfig.map((breakItem, index) => (
                  <div key={index} className="break-item">
                    <div className="break-inputs">
                      <div className="input-group">
                        <label>Break Name</label>
                        <input
                          type="text"
                          value={breakItem.name}
                          onChange={(e) => handleBreakConfigChange(index, 'name', e.target.value)}
                          placeholder="Break name"
                        />
                      </div>
                      
                      <div className="input-group">
                        <label>After Period</label>
                        <select
                          value={breakItem.afterPeriod}
                          onChange={(e) => handleBreakConfigChange(index, 'afterPeriod', e.target.value)}
                        >
                          {Array.from({ length: numberOfPeriods }, (_, i) => i + 1).map(period => (
                            <option key={period} value={period}>
                              Period {period}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="input-group">
                        <label>Duration (minutes)</label>
                        <input
                          type="number"
                          min="5"
                          max="60"
                          step="5"
                          value={breakItem.duration}
                          onChange={(e) => handleBreakConfigChange(index, 'duration', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <button
                      className="remove-break-button"
                      onClick={() => removeBreak(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="add-break-button"
                onClick={addBreak}
              >
                + Add Break
              </button>
            </div>
          )}
        </div>

        {/* Time Slots Preview */}
        {selectedDays.length > 0 && startTime && periodDuration && numberOfPeriods && (
          <div className="config-section">
            <div className="section-header">
              <h3>Time Slots Preview</h3>
              <p>Preview of how your timetable will be structured</p>
            </div>

            <div className="time-slots-preview">
              {generateTimeSlots().map((slot, index) => (
                <div
                  key={index}
                  className={`time-slot ${slot.isBreak ? 'break-slot' : 'period-slot'}`}
                >
                  <div className="slot-period">
                    {slot.isBreak ? slot.name : `Period ${slot.period}`}
                  </div>
                  <div className="slot-time">
                    {slot.startTime} - {slot.endTime}
                  </div>
                  {slot.duration && (
                    <div className="slot-duration">
                      {slot.duration} min
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Summary */}
        <div className="config-section">
          <div className="section-header">
            <h3>Configuration Summary</h3>
          </div>

          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Working Days:</span>
              <span className="summary-value">{selectedDays.length} days</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Daily Schedule:</span>
              <span className="summary-value">
                {startTime} - {calculateEndTime()}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Period Duration:</span>
              <span className="summary-value">{periodDuration} minutes</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Periods per Day:</span>
              <span className="summary-value">{numberOfPeriods}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Breaks:</span>
              <span className="summary-value">{breakConfig.length}</span>
            </div>
          </div>

          <div className="selected-days">
            <h4>Selected Days:</h4>
            <div className="selected-tags">
              {selectedDays.map(day => (
                <span key={day} className="selected-tag">
                  {daysOfWeek.find(d => d.id === day)?.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationStep;