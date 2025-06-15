export const shouldShowSidebar = (pathname) => {
  const allowedPaths = [
    '/login',
    '/admin',
    '/teacher',
    '/student',
    '/parent'
  ];
  
  return allowedPaths.some(path => pathname.startsWith(path));
};
