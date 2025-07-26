import React from 'react';
import { Button, ButtonGroup, Box } from '@mui/material';

function EntityTypeToggle({ entityType, onToggle }) {
  return (
    <Box my={3} display="flex" justifyContent="center">
      <ButtonGroup variant="outlined">

      <Button
          variant="outlined"
          sx={{
            backgroundColor: entityType === 'combined' ? '#D53823' : '#ffffff',
            color: entityType === 'combined' ? '#ffffff' : '#D53823',
            border: '1px solid #D53823 !important',
            borderColor: '#D53823 !important',
            '&:hover': {
              backgroundColor: entityType === 'combined' ? '#c2301f' : '#fcecea',
              borderColor: '#D53823 !important',
            },
          }}
          onClick={() => onToggle('combined')}
        >
          Driver + Constructor
        </Button>
        <Button
          variant="outlined"
          sx={{
            backgroundColor: entityType === 'drivers' ? '#D53823' : '#ffffff',
            color: entityType === 'drivers' ? '#ffffff' : '#D53823',
            border: '1px solid #D53823 !important',
            borderColor: '#D53823 !important',
            '&:hover': {
              backgroundColor: entityType === 'drivers' ? '#c2301f' : '#fcecea',
              borderColor: '#D53823 !important',
            },
          }}
          onClick={() => onToggle('drivers')}
        >
          Drivers
        </Button>

        <Button
          variant="outlined"
          sx={{
            backgroundColor: entityType === 'constructors' ? '#D53823' : '#ffffff',
            color: entityType === 'constructors' ? '#ffffff' : '#D53823',
            border: '1px solid #D53823 !important',
            borderColor: '#D53823 !important',
            '&:hover': {
              backgroundColor: entityType === 'constructors' ? '#c2301f' : '#fcecea',
              borderColor: '#D53823 !important',
            },
          }}
          onClick={() => onToggle('constructors')}
        >
          Constructors
        </Button>


      </ButtonGroup>
    </Box>
  );
}

export default EntityTypeToggle;
