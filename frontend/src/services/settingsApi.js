import api from '../utils/api';

class SettingsApi {
    constructor() {
        // Change from /api/v1/admin/settings to /api/v1/settings
        this.baseUrl = '/api/v1/settings';
    }

    async getSettings() {
        try {
            console.log('Fetching settings from:', `${this.baseUrl}`);
            const { data } = await api.get(this.baseUrl);
            console.log('Settings response:', data);
            return data;
        } catch (error) {
            console.error('Error in getSettings:', error.response || error);
            return {
                success: false,
                error: error.message,
                data: this.getDefaultSettings()
            };
        }
    }

    async updateSettings(settings) {
        try {
            console.log('Updating settings:', settings);
            const { data } = await api.put(this.baseUrl, {
                general: {
                    schoolName: settings.schoolName || '',
                    address: settings.address || '',
                    phoneNumber: settings.phoneNumber || '',
                    email: settings.email || '',
                    website: settings.website || '',
                    taxNumber: settings.taxNumber || '',
                    registrationNumber: settings.registrationNumber || '',
                    academicYear: settings.academicYear || '',
                    timezone: settings.timezone || 'UTC',
                    dateFormat: settings.dateFormat || 'DD/MM/YYYY',
                    currency: settings.currency || 'INR',
                    language: settings.language || 'en'
                }
            });
            return data;
        } catch (error) {
            console.error('Error updating settings:', error.response?.data || error);
            throw error;
        }
    }

    async uploadLogo(file) {
        try {
            const formData = new FormData();
            formData.append('logo', file);
            
            const response = await api.post(`${this.baseUrl}/logo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('Logo upload response:', response.data);

            if (response.data.success && response.data.data.fileUrl) {
                // Don't modify the URL here, keep the original from server
                return response.data;
            }
            
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('Error uploading logo:', error);
            throw error;
        }
    }

    async deleteLogo() {
        try {
            const response = await api.delete(`${this.baseUrl}/logo`);
            return response.data;
        } catch (error) {
            console.error('Error deleting logo:', error);
            throw error;
        }
    }

    async updateTheme(themeSettings) {
        try {
            const response = await api.put(`${this.baseUrl}/theme`, themeSettings);
            return response.data;
        } catch (error) {
            console.error('Error updating theme:', error);
            throw error;
        }
    }

    async updateAdvancedSettings(advancedSettings) {
        try {
            const response = await api.put(`${this.baseUrl}/advanced`, advancedSettings);
            return response.data;
        } catch (error) {
            console.error('Error updating advanced settings:', error);
            throw error;
        }
    }

    getDefaultSettings() {
        return {
            general: {
                schoolName: 'School Name',
                address: '',
                phoneNumber: '',
                email: '',
                website: '',
                taxNumber: '',
                registrationNumber: '',
                academicYear: '',
                timezone: 'UTC',
                dateFormat: 'DD/MM/YYYY',
                currency: 'INR',
                language: 'en'
            },
            appearance: {
                theme: 'light',
                themeColor: '#1976d2'
            }
        };
    }
}

export const settingsApi = new SettingsApi();
export default settingsApi;
