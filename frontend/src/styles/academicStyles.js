export const academicStyles = {
  timeSlot: {
    padding: '8px',
    margin: '4px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  occupied: {
    backgroundColor: '#e3f2fd',
    '&:hover': {
      backgroundColor: '#bbdefb',
    },
  },
  conflicted: {
    backgroundColor: '#ffebee',
    '&:hover': {
      backgroundColor: '#ffcdd2',
    },
  },
  timeTable: {
    '& .MuiTableCell-head': {
      backgroundColor: '#1976d2',
      color: 'white',
      fontWeight: 'bold',
    },
  },
  dashboard: {
    statCard: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    chart: {
      height: 300,
      marginTop: 2,
    },
  }
};
