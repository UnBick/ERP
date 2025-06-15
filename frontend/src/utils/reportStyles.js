import { StyleSheet } from '@react-pdf/renderer';

export const reportStyles = {
  academic: StyleSheet.create({
    // Academic report specific styles
    grade: {
      color: '#1976d2',
      fontWeight: 'bold',
    },
    subject: {
      backgroundColor: '#f5f5f5',
    },
  }),
  
  attendance: StyleSheet.create({
    // Attendance report specific styles
    present: {
      color: '#4caf50',
    },
    absent: {
      color: '#f44336',
    },
    late: {
      color: '#ff9800',
    },
  }),

  // Add more report-specific styles
};
