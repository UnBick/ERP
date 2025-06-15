import React, { useState } from 'react';
import { Box, Button, Popover } from '@mui/material';
import { SketchPicker } from 'react-color';

const ColorPicker = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (color) => {
    onChange(color.hex);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        sx={{
          width: 40,
          height: 40,
          minWidth: 'auto',
          bgcolor: value,
          '&:hover': {
            bgcolor: value,
          },
          border: '2px solid #ddd',
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box p={1}>
          <SketchPicker
            color={value}
            onChange={handleChange}
          />
        </Box>
      </Popover>
    </>
  );
};

export default ColorPicker;
