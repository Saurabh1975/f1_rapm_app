import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

function CombinedTable({ data, modelDate }) {
  // Filter and join driver and constructor data
  const combinedData = Object.values(data)
    .flat()
    .filter(row => row.model_date?.toISOString() === modelDate?.toISOString() && row.driver_name)
    .map((row, index) => {
      const constructorData = data[row.parent_constructor_name]?.find(
        cRow => cRow.model_date?.toISOString() === modelDate?.toISOString()
      );

      const constructorRating = constructorData?.rapm_blended || 0;
      const combinedRating = parseFloat(row.rapm_blended) + parseFloat(constructorRating);

      return {
        id: index,
        driver_name: row.driver_name,
        driver_rating: parseFloat(row.rapm_blended.toFixed(2)),
        parent_constructor_name: row.parent_constructor_name,
        constructor_rating: parseFloat(constructorRating.toFixed(2)),
        combined_rating: parseFloat(combinedRating.toFixed(2)),
      };
    });

  // Define columns
  const columns = [
    { field: 'driver_name', headerName: 'Driver Name', flex: 1 },
    { field: 'driver_rating', headerName: 'Driver Rating', flex: 1, sortable: true },
    { field: 'parent_constructor_name', headerName: 'Constructor', flex: 1 },
    { field: 'constructor_rating', headerName: 'Constructor Rating', flex: 1, sortable: true },
    { field: 'combined_rating', headerName: 'Combined Rating', flex: 1, sortable: true },
  ];

  return (
    <Box mx={3} mt={4}>
      <Typography variant="h6" align="left" gutterBottom>
        Combined Ratings Table
      </Typography>
      <DataGrid
        rows={combinedData}
        columns={columns}
        autoHeight
        disableSelectionOnClick
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
        style={{ backgroundColor: '#fff', borderRadius: '4px', marginTop: '16px' }}
      />
    </Box>
  );
}

export default CombinedTable;
