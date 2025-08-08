import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import useIsMobile from '../hooks/useIsMobile';

function Table({ columns, data, title, entityType }) {
  const isMobile = useIsMobile();

  const defaultSortField = (() => {
    if (entityType === 'combined') return 'rapm_combined';
    if (entityType === 'drivers') return 'rapm_blended';
    if (entityType === 'constructors') return 'rapm_blended';
    return 'rapm_blended'; // fallback
  })();

  return (
    <Box mx={3} mt={4} style={{ overflowX: 'auto' }}>
      <Typography
        variant="h6"
        align="left"
        gutterBottom
        sx={{ fontSize: isMobile ? '1rem' : '1.25rem', fontFamily: 'Roboto, sans-serif' }}
      >
        {title}
      </Typography>

      <div style={{ minWidth: isMobile ? '600px' : '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          autoHeight
          disableSelectionOnClick
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          initialState={{
            sorting: {
              sortModel: [{ field: defaultSortField, sort: 'desc' }],
            },
          }}
          getRowClassName={(params) => `row-${params.row.id}`}
          componentsProps={{
            row: {
              style: (params) => ({
                '--hover-color': params.row.current_primary_color || '#e0e0e0',
              }),
            },
          }}
          sx={{
            fontSize: isMobile ? 'clamp(0.7rem, 2vw, 0.85rem)' : '1rem',
            fontFamily: 'Roboto, sans-serif',

            // Header styling
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: isMobile ? 'clamp(0.65rem, 1.8vw, 0.8rem)' : '0.95rem',
              whiteSpace: 'normal',
              overflow: 'visible',
              textAlign: 'center',
              lineHeight: 1.2,
              fontFamily: 'Roboto Slab, sans-serif',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 500
            },

            '& .MuiDataGrid-columnHeaders': {
              minHeight: isMobile ? '42px' : '56px',
              maxHeight: isMobile ? '60px' : undefined,
            },

            // General cell styling
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 500,
            },

            // Use Roboto Mono for rating columns
            '& .MuiDataGrid-cell[data-field*="rapm"]': {
              fontFamily: 'Roboto Mono, monospace',
            },

            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'var(--hover-color)',
            },
          }}
          style={{
            backgroundColor: '#fff',
            borderRadius: '4px',
            marginTop: '16px',
          }}
        />
      </div>
    </Box>
  );
}

export default Table;
