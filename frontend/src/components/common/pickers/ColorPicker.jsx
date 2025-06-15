import React, { useState } from 'react';
import { Box, IconButton, Popover } from '@mui/material';
import { SketchPicker } from 'react-color';

const ColorPicker = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <Box>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          width: 40,
          height: 40,
          backgroundColor: value,
          '&:hover': { backgroundColor: value },
          border: '2px solid #ddd',
          borderRadius: 1
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <SketchPicker color={value} onChange={(color) => onChange(color.hex)} />
      </Popover>
    </Box>
  );
};

export default ColorPicker;
