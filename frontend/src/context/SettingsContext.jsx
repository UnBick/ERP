import React, { createContext, useState, useContext, useEffect } from 'react';
import { settingsApi } from '../services/settingsApi';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refreshSettings = async () => {
        try {
            setLoading(true);
            const response = await settingsApi.getSettings();
            
            if (response.success) {
                console.log('Settings refreshed:', response.data);
                setSettings(response.data);
            } else {
                console.error('Failed to refresh settings:', response.message);
                setSettings(settingsApi.getDefaultSettings());
                throw new Error(response.message || 'Failed to fetch settings');
            }
        } catch (error) {
            console.error('Settings refresh error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{
            settings,
            loading,
            error,
            refreshSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export default SettingsProvider;
