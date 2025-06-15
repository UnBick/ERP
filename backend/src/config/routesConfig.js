const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh'
  },
  
  ADMIN: {
    WEBSITE: {
      BASE: '/admin/website',
      CONTENT: '/admin/website/content',
      HOMEPAGE: '/admin/website/homepage',
      GALLERY: '/admin/website/gallery'
    },
    ACADEMICS: {
      BASE: '/admin/academics',
      CURRICULUM: '/admin/academics/curriculum',
      SYLLABUS: '/admin/academics/syllabus'
    }
  },
  
  PUBLIC: {
    WEBSITE: '/website',
    CONTACT: '/contact',
    GALLERY: '/gallery'
  }
};

module.exports = ROUTES;
