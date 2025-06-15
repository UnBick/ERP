import api from './index';
import { API_ENDPOINTS } from '../../config/apiConfig';

export const academicService = {
  getSyllabus: (classId) => 
    api.get(`${API_ENDPOINTS.ADMIN.ACADEMIC.SYLLABUS}/class/${classId}`),
  
  updateSyllabus: (data) =>
    api.put(API_ENDPOINTS.ADMIN.ACADEMIC.SYLLABUS, data),
    
  uploadSyllabusFile: (formData, onProgress) =>
    api.post(API_ENDPOINTS.ADMIN.ACADEMIC.SYLLABUS + '/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
    }),

  // ...other academic related methods
};
