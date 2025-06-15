import React, { useState, useEffect } from 'react';
import AdminContentLayout from '../../../layout/AdminContentLayout';
import ColorPicker from '../../../common/ColorPicker';
import FontSelector from '../../../common/FontSelector';
import { toast } from 'react-toastify';
import './styles/ThemeManager.css';

const ThemeManager = () => {
  const [theme, setTheme] = useState({
    colors: {
      primary: '#4285f4',
      secondary: '#34a853',
      accent: '#fbbc05',
      text: '#333333',
      background: '#ffffff',
      header: '#1a237e',
      footer: '#0d47a1',
      link: '#1976d2',
      error: '#f44336'
    },
    fonts: {
      heading: 'Roboto',
      body: 'Open Sans',
      sizes: {
        base: 16,
        scale: 1.2
      }
    },
    spacing: {
      unit: 8,
      scale: 1.2
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12
    },
    shadows: {
      light: '0 2px 4px rgba(0,0,0,0.1)',
      medium: '0 4px 6px rgba(0,0,0,0.1)',
      heavy: '0 8px 16px rgba(0,0,0,0.1)'
    }
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedThemes, setSavedThemes] = useState([]);

  useEffect(() => {
    fetchCurrentTheme();
    fetchSavedThemes();
  }, []);

  const fetchCurrentTheme = async () => {
    try {
      const response = await fetch('/api/admin/theme/current');
      const data = await response.json();
      setTheme(data);
    } catch (error) {
      toast.error('Failed to load current theme');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedThemes = async () => {
    try {
      const response = await fetch('/api/admin/theme/saved');
      const data = await response.json();
      setSavedThemes(data);
    } catch (error) {
      toast.error('Failed to load saved themes');
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme)
      });
      
      if (!response.ok) throw new Error('Failed to save theme');
      toast.success('Theme saved successfully');
      
      // Update CSS variables
      applyTheme(theme);
    } catch (error) {
      toast.error('Failed to save theme');
    }
  };

  const applyTheme = (themeData) => {
    const root = document.documentElement;
    Object.entries(themeData.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    root.style.setProperty('--font-heading', themeData.fonts.heading);
    root.style.setProperty('--font-body', themeData.fonts.body);
    root.style.setProperty('--base-size', `${themeData.fonts.sizes.base}px`);
  };

  return (
    <AdminContentLayout pageType="theme-settings">
      <div className="theme-manager">
        <div className="controls-panel">
          <div className="panel-header">
            <h2>Theme Customization</h2>
            <div className="actions">
              <button onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? 'Edit Mode' : 'Preview'}
              </button>
              <button onClick={handleSave}>Save Theme</button>
            </div>
          </div>

          {!previewMode && (
            <>
              <div className="color-scheme">
                <h3>Color Scheme</h3>
                <div className="color-grid">
                  {Object.entries(theme.colors).map(([key, value]) => (
                    <ColorPicker
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={value}
                      onChange={(color) => {
                        setTheme(prev => ({
                          ...prev,
                          colors: { ...prev.colors, [key]: color }
                        }));
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="typography">
                <h3>Typography</h3>
                <FontSelector
                  headingFont={theme.fonts.heading}
                  bodyFont={theme.fonts.body}
                  baseSize={theme.fonts.sizes.base}
                  scale={theme.fonts.sizes.scale}
                  onChange={(fonts) => {
                    setTheme(prev => ({
                      ...prev,
                      fonts: { ...prev.fonts, ...fonts }
                    }));
                  }}
                />
              </div>

              <div className="spacing">
                <h3>Spacing & Layout</h3>
                <div className="spacing-controls">
                  <input
                    type="number"
                    value={theme.spacing.unit}
                    onChange={(e) => setTheme(prev => ({
                      ...prev,
                      spacing: { ...prev.spacing, unit: Number(e.target.value) }
                    }))}
                    min="4"
                    max="16"
                  />
                  <input
                    type="range"
                    value={theme.spacing.scale}
                    onChange={(e) => setTheme(prev => ({
                      ...prev,
                      spacing: { ...prev.spacing, scale: Number(e.target.value) }
                    }))}
                    min="1"
                    max="2"
                    step="0.1"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className={`preview-panel ${previewMode ? 'full-screen' : ''}`}>
          <div className="preview-content">
            <h1>Theme Preview</h1>
            <p>This is how your theme will look.</p>
            <button className="primary">Primary Button</button>
            <button className="secondary">Secondary Button</button>
            <a href="#">Sample Link</a>
            <div className="card">
              <h3>Sample Card</h3>
              <p>Card content with current theme applied.</p>
            </div>
          </div>
        </div>

        <div className="saved-themes">
          <h3>Saved Themes</h3>
          <div className="theme-presets">
            {savedThemes.map(savedTheme => (
              <div
                key={savedTheme.id}
                className="theme-preset"
                onClick={() => setTheme(savedTheme.theme)}
              >
                <div className="preset-preview"
                  style={{
                    backgroundColor: savedTheme.theme.colors.background,
                    border: `2px solid ${savedTheme.theme.colors.primary}`
                  }}
                >
                  <div className="color-sample primary"
                    style={{ backgroundColor: savedTheme.theme.colors.primary }}
                  />
                  <div className="color-sample secondary"
                    style={{ backgroundColor: savedTheme.theme.colors.secondary }}
                  />
                </div>
                <span>{savedTheme.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminContentLayout>
  );
};

export default ThemeManager;
