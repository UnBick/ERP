import React, { useState, useEffect } from 'react';
import Books from '../../UnbickSchooling/Books';
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Bookmark,
  History,
  TrendingUp,
  Category,
} from '@mui/icons-material';

const StudentBooks = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [bookmarks, setBookmarks] = useState([]);
  const [readingStats, setReadingStats] = useState({
    totalMinutes: 0,
    booksCompleted: 0,
    currentStreak: 0
  });

  const actions = [
    { icon: <Bookmark />, name: 'Bookmarks' },
    { icon: <History />, name: 'History' },
    { icon: <TrendingUp />, name: 'Progress' },
  ];

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          <Books role="student" />
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Reading Stats</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography>Total Reading Time: {readingStats.totalMinutes} mins</Typography>
                <Typography>Books Completed: {readingStats.booksCompleted}</Typography>
                <Typography>Current Streak: {readingStats.currentStreak} days</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <SpeedDial
        ariaLabel="Book actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default StudentBooks;