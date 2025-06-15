import api from './index';
import { API_ENDPOINTS } from '../../config/apiConfig';

export const websiteService = {
  getContent: (pageId) => 
    api.get(`${API_ENDPOINTS.WEBSITE.CONTENT}/${pageId}`),
    
  updateContent: (pageId, content) =>
    api.put(`${API_ENDPOINTS.WEBSITE.CONTENT}/${pageId}`, content),
    
  uploadMedia: (formData, type) =>
    api.post(`${API_ENDPOINTS.WEBSITE.CONTENT}/media/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};
