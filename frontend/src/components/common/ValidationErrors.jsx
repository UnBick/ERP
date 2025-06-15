import React from 'react';
import { Alert, Stack } from '@mui/material';


const ValidationErrors = ({ errors }) => {
  if (!errors || Object.keys(errors).length === 0) return null;

  return (
    <Stack spacing={1} className="validation-errors">
      {Object.entries(errors).map(([field, message]) => (
        <Alert key={field} severity="error">
          {message}
        </Alert>
      ))}
    </Stack>
  );
};

export default ValidationErrors;
