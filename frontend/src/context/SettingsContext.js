import React, { createContext, useState, useContext, useEffect } from 'react';
import { settingsApi } from '../services/settingsApi';
import { useAuth } from '../contexts/AuthContext'; // Add this import

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Add this
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshSettings = async () => {
    try {
      // Only fetch settings if authenticated
      if (!isAuthenticated) {
        setSettings({
          general: { schoolName: 'School Name' },
          appearance: { theme: 'light', primaryColor: '#1976d2' }
        });
        return;
      }

      const data = await settingsApi.getSettings();
      setSettings(data);
      setError(null);
    } catch (error) {
      console.error('Settings refresh error:', error);
      setError(error.message);
      setSettings({
        general: { schoolName: 'School Name' },
        appearance: { theme: 'light', primaryColor: '#1976d2' }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, [isAuthenticated]); // Add isAuthenticated as dependency

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
