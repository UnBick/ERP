// Use this file for ALL API calls in the frontend
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'https://backend-production-a762.up.railway.app/api/v1';

export function getApiUrl(path) {
  // Ensure no double slashes
  return `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : '/' + path}`;
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  
  ADMIN: {
    ACADEMIC: {
      BASE: '/admin/academics',
      SYLLABUS: '/admin/academics/syllabus',
      CURRICULUM: '/admin/academics/curriculum'
    },
    WEBSITE: {
      BASE: '/admin/website',
      CONTENT: '/admin/website/content',
      MEDIA: '/admin/website/media'
    }
  },
  
  PUBLIC: {
    CONTENT: '/content',
    MEDIA: '/media'
  },
  
  MESSAGES: {
    LIST: '/communication/messages',
    READ: (id) => `/communication/messages/${id}/read`,
    STAR: (id) => `/communication/messages/${id}/star`,
    ARCHIVE: (id) => `/communication/messages/${id}/archive`,
    DELETE: (id) => `/communication/messages/${id}/delete`,
    DOWNLOAD: (id, attachmentId) => `/communication/messages/${id}/attachments/${attachmentId}`
  },
  
  SETTINGS: {
    BASE: '/api/settings',
    USERS: '/api/settings/users',
    SIGNATURES: '/api/settings/signatures',
    GENERAL: '/api/settings/general',
    THEME: '/api/settings/theme',
    ADVANCED: '/api/settings/advanced',
    CLASS_DATA: '/settings/documents/class-data',
    SECTIONS: (classId) => `/settings/sections/class/${classId}`
  }
};

export const API_CONFIG = {
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'include'
};
