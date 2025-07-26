import React from 'react';
import { Button, ButtonGroup, Box } from '@mui/material';

function EntityTypeToggle({ entityType, onToggle }) {
  return (
    <Box my={3} display="flex" justifyContent="center">
      <ButtonGroup variant="contained">
      <Button
  sx={{
    backgroundColor: entityType === 'drivers' ? '#D53823' : '#ffffff',
    color: entityType === 'drivers' ? '#ffffff' : '#D53823',
    border: '1px solid',
    borderColor: '#D53823',
    '&:hover': {
      backgroundColor: entityType === 'drivers' ? '#c2301f' : '#fcecea',
      borderColor: '#D53823',
    },
  }}
  onClick={() => onToggle('drivers')}
>
  Drivers
</Button>

<Button
  sx={{
    backgroundColor: entityType === 'constructors' ? '#D53823' : '#ffffff',
    color: entityType === 'constructors' ? '#ffffff' : '#D53823',
    border: '1px solid',
    borderColor: '#D53823',
    '&:hover': {
      backgroundColor: entityType === 'constructors' ? '#c2301f' : '#fcecea',
      borderColor: '#D53823',
    },
  }}
  onClick={() => onToggle('constructors')}
>
  Constructors
</Button>

<Button
  sx={{
    backgroundColor: entityType === 'combined' ? '#D53823' : '#ffffff',
    color: entityType === 'combined' ? '#ffffff' : '#D53823',
    border: '1px solid',
    borderColor: '#D53823',
    '&:hover': {
      backgroundColor: entityType === 'combined' ? '#c2301f' : '#fcecea',
      borderColor: '#D53823',
    },
  }}
  onClick={() => onToggle('combined')}
>
  Combined
</Button>



      </ButtonGroup>
    </Box>
  );
}

export default EntityTypeToggle;
