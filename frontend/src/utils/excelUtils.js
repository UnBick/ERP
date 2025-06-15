import * as XLSX from 'xlsx';

export const generateEmptyTimetableTemplate = () => {
  const template = [
    ['Class', 'Section', 'Day', 'Subject', 'Start Time', 'End Time', 'Teacher'],
    // Example row
    ['Class 1', 'A', 'Monday', 'Mathematics', '09:00', '10:00', 'John Doe']
  ];

  const ws = XLSX.utils.aoa_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Timetable Template');
  
  // Generate and download file
  XLSX.writeFile(wb, 'timetable_template.xlsx');
};

export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Remove header row and empty rows
        const validData = jsonData
          .slice(1)
          .filter(row => row.length > 0)
          .map(row => ({
            className: row[0],
            sectionName: row[1],
            day: row[2],
            subjectName: row[3],
            startTime: row[4],
            endTime: row[5],
            teacherName: row[6]
          }));

        resolve(validData);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const generateGradeTemplate = () => {
  const template = [
    ['Grade', 'GPA', 'Minimum Marks', 'Maximum Marks', 'Description', 'Remarks'],
    ['A+', '4.0', '90', '100', 'Outstanding', 'Excellent performance'],
    // Example row
  ];

  const ws = XLSX.utils.aoa_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Grade Template');
  XLSX.writeFile(wb, 'grade_template.xlsx');
};

export const parseGradeExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const validData = jsonData
          .slice(1)
          .filter(row => row.length > 0)
          .map(row => ({
            grade: row[0],
            gpa: row[1],
            minMarks: row[2],
            maxMarks: row[3],
            description: row[4],
            remarks: row[5]
          }));

        resolve(validData);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const generateMarksTemplate = () => {
  const template = [
    ['Student ID', 'Student Name', 'Class', 'Section', 'Subject', 'Exam Type', 'Marks Obtained', 'Total Marks', 'Remarks'],
    ['STD001', 'John Doe', 'Class 10', 'A', 'Mathematics', 'Mid Term', '85', '100', 'Good performance']
  ];

  const ws = XLSX.utils.aoa_to_sheet(template);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Marks Template');
  XLSX.writeFile(wb, 'marks_template.xlsx');
};

export const parseMarksExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const validData = jsonData
          .slice(1)
          .filter(row => row.length > 0)
          .map(row => ({
            studentId: row[0],
            studentName: row[1],
            class: row[2],
            section: row[3],
            subject: row[4],
            examType: row[5],
            marksObtained: row[6],
            totalMarks: row[7],
            remarks: row[8]
          }));

        resolve(validData);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

// Add validation function for marks data
export const validateMarksData = (data) => {
  const errors = [];
  if (!data.studentId) errors.push('Student ID is required');
  if (!data.marksObtained) errors.push('Marks obtained is required');
  if (!data.totalMarks) errors.push('Total marks is required');
  if (parseFloat(data.marksObtained) > parseFloat(data.totalMarks)) {
    errors.push('Marks obtained cannot be greater than total marks');
  }
  return errors;
};
