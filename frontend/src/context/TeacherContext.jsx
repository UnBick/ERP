import React, { createContext, useContext, useState, useCallback } from 'react';

const TeacherContext = createContext();

export const TeacherProvider = ({ children }) => {
  const [teacherData, setTeacherData] = useState({});

  const updateTeacherData = useCallback((newData) => {
    setTeacherData(prev => ({ ...prev, ...newData }));
  }, []);

  return (
    <TeacherContext.Provider value={{ teacherData, updateTeacherData }}>
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeacher = () => {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error('useTeacher must be used within a TeacherProvider');
  }
  return context;
};
