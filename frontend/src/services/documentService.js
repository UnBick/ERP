import axios from 'axios';
import { handleApiError } from './errorHandlingService';

export const generateDocument = async (data, onSuccess, onError) => {
    try {
        const response = await axios.post('/api/v1/admin/documents/generate', data, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            responseType: 'blob'
        });

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${data.documentType}_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        onSuccess?.('Document generated successfully');
    } catch (error) {
        handleApiError(error, onError);
    }
};
