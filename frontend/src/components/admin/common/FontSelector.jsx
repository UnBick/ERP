import React, { useState, useEffect } from 'react';
import './styles/FontSelector.css';

const FontSelector = ({ headingFont, bodyFont, baseSize, scale, onChange }) => {
  const [availableFonts, setAvailableFonts] = useState([
    { name: 'Roboto', category: 'sans-serif' },
    { name: 'Open Sans', category: 'sans-serif' },
    { name: 'Lato', category: 'sans-serif' },
    { name: 'Merriweather', category: 'serif' },
    { name: 'Playfair Display', category: 'serif' },
    { name: 'Source Code Pro', category: 'monospace' }
  ]);

  const [preview, setPreview] = useState({
    heading: headingFont,
    body: bodyFont
  });

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${availableFonts.map(f => f.name.replace(' ', '+')).join('&family=')}`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleFontChange = (type, font) => {
    setPreview(prev => ({ ...prev, [type]: font }));
    onChange({
      headingFont: type === 'heading' ? font : headingFont,
      bodyFont: type === 'body' ? font : bodyFont,
      sizes: { base: baseSize, scale }
    });
  };

  return (
    <div className="font-selector">
      <div className="font-section">
        <h4>Heading Font</h4>
        <select
          value={preview.heading}
          onChange={(e) => handleFontChange('heading', e.target.value)}
          className="font-select"
        >
          {availableFonts.map(font => (
            <option 
              key={font.name} 
              value={font.name}
              style={{ fontFamily: font.name }}
            >
              {font.name}
            </option>
          ))}
        </select>
        <div 
          className="font-preview heading-preview"
          style={{ fontFamily: preview.heading }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
      </div>

      <div className="font-section">
        <h4>Body Font</h4>
        <select
          value={preview.body}
          onChange={(e) => handleFontChange('body', e.target.value)}
          className="font-select"
        >
          {availableFonts.map(font => (
            <option 
              key={font.name} 
              value={font.name}
              style={{ fontFamily: font.name }}
            >
              {font.name}
            </option>
          ))}
        </select>
        <div 
          className="font-preview body-preview"
          style={{ fontFamily: preview.body }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </div>
      </div>

      <div className="font-metrics">
        <div className="base-size">
          <label>Base Size (px)</label>
          <input
            type="number"
            min="12"
            max="24"
            value={baseSize}
            onChange={(e) => onChange({
              headingFont,
              bodyFont,
              sizes: { base: Number(e.target.value), scale }
            })}
          />
        </div>

        <div className="scale">
          <label>Type Scale</label>
          <input
            type="range"
            min="1.067"
            max="1.5"
            step="0.001"
            value={scale}
            onChange={(e) => onChange({
              headingFont,
              bodyFont,
              sizes: { base: baseSize, scale: Number(e.target.value) }
            })}
          />
          <span>{scale}x</span>
        </div>
      </div>
    </div>
  );
};

export default FontSelector;
