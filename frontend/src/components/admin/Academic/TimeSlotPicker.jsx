import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { TIME_SLOTS } from '../../../utils/academicUtils';
import { academicStyles } from '../../../styles/academicStyles';

const TimeSlotPicker = ({ value, onChange, occupiedSlots = [] }) => {
  const handleSlotClick = (slot) => {
    if (!isSlotOccupied(slot)) {
      onChange(slot);
    }
  };

  const isSlotOccupied = (slot) => {
    return occupiedSlots.includes(slot);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Select Time Slot</Typography>
      <Grid container spacing={1}>
        {TIME_SLOTS.map((slot) => (
          <Grid item xs={4} sm={3} md={2} key={slot}>
            <Paper
              sx={{
                ...academicStyles.timeSlot,
                ...(isSlotOccupied(slot) && academicStyles.occupied),
                ...(value === slot && { backgroundColor: '#4caf50', color: 'white' })
              }}
              onClick={() => handleSlotClick(slot)}
            >
              <Typography variant="body2" align="center">
                {slot}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TimeSlotPicker;
