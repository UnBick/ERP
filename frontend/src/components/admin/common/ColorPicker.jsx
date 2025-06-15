import React, { useState, useEffect, useRef } from 'react';
import { SketchPicker } from 'react-color';
import './styles/ColorPicker.css';

const ColorPicker = ({ label, value, onChange }) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState(value);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setDisplayColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (color) => {
    setCurrentColor(color.hex);
    onChange(color.hex);
  };

  return (
    <div className="color-picker-container">
      <label className="color-picker-label">{label}</label>
      <div className="color-picker-preview">
        <div
          className="color-swatch"
          style={{ backgroundColor: currentColor }}
          onClick={() => setDisplayColorPicker(!displayColorPicker)}
        />
        <input
          type="text"
          value={currentColor}
          onChange={(e) => handleChange({ hex: e.target.value })}
          className="color-input"
        />
      </div>
      {displayColorPicker && (
        <div className="color-picker-popover" ref={pickerRef}>
          <SketchPicker
            color={currentColor}
            onChange={handleChange}
            disableAlpha={true}
            presetColors={[
              '#1a237e', '#0d47a1', '#4caf50', '#f44336',
              '#2196f3', '#ff9800', '#9c27b0', '#795548'
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
