import React, { useState } from 'react';
import Books from '../../UnbickSchooling/Books';
import { Box, Button } from '@mui/material';

const TeacherBooks = () => {
  const [editMode, setEditMode] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const handleAssignBook = async (bookId, studentIds) => {
    try {
      await fetch('/api/teacher/assign-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, studentIds })
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Books 
        role="teacher" 
        editMode={editMode}
        onAssign={handleAssignBook}
        onTrackProgress={(bookId) => {/* Track reading progress */}}
      />
      <Button onClick={() => setEditMode(!editMode)}>
        {editMode ? 'View Mode' : 'Edit Mode'}
      </Button>
    </Box>
  );
};

export default TeacherBooks;