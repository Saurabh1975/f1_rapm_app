import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

function Table({ columns, data, title, defaultSortField, customHeader }) {
  return (
    <Box mx={3} mt={4}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Typography variant="h6" align="left" gutterBottom>
        {title}
      </Typography>
      {customHeader}
    </Box>
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
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'var(--hover-color)',
          },
        }}
        style={{ backgroundColor: '#fff', borderRadius: '4px', marginTop: '16px' }}
      />
    </Box>
  );
}

export default Table;
