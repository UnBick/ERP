import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';

const TimetablePreview = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Preview ({data.length} entries)
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Teacher</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.className}</TableCell>
                <TableCell>{row.sectionName}</TableCell>
                <TableCell>{row.day}</TableCell>
                <TableCell>{row.subjectName}</TableCell>
                <TableCell>{`${row.startTime} - ${row.endTime}`}</TableCell>
                <TableCell>{row.teacherName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TimetablePreview;
