import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import SearchTool from './components/SearchTool.jsx';
import RatingChart from './components/RatingChart.jsx';
import Table from './components/Table.jsx';
import EntityTypeToggle from './components/EntityTypeToggle.jsx';
import RaceSelector from './components/RaceSelector.jsx';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import './App.css';
import { useMemo } from 'react';


function App() {
  const [data, setData] = useState({});
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [entityType, setEntityType] = useState('combined'); // "drivers" or "constructors"
  const [isLoading, setIsLoading] = useState(true);
  const [raceGroups, setRaceGroups] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [latestSeason, setLatestSeason] = useState(null);
  const [latestRaceName, setLatestRaceName] = useState(null);
  const [latestRound, setLatestRound] = useState(null);


  useEffect(() => {
    Papa.parse('/rapm_history_combined_cleaned.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const parsedData = results.data.reduce((acc, row) => {
          const entityId = row.entity_id;
          if (!acc[entityId]) {
            acc[entityId] = [];
          }

          acc[entityId].push({
            ...row,
            overall_round: parseInt(row.overall_round, 10), // Convert to integer
            rapm_blended: parseFloat(row.rapm_blended),
            current_primary_color: row.current_primary_color || '#e0e0e0',
          });

          return acc;
        }, {});

        setData(parsedData);

        const maxRoundRow = results.data.reduce((maxRow, currentRow) => {
          const currentRound = parseInt(currentRow.overall_round, 10);
          const maxRound = parseInt(maxRow?.overall_round || -1, 10);
          return currentRound > maxRound ? currentRow : maxRow;
        }, null);
        
        if (maxRoundRow) {
          setLatestSeason(maxRoundRow.season);
          setLatestRaceName(maxRoundRow.race_name);
          setLatestRound(parseInt(maxRoundRow.overall_round, 10)); // <-- Add this
        }
        
        setIsLoading(false);

        // Group races by season
        const groupedRaces = results.data.reduce((acc, row) => {
          const season = row.season;
          const raceFullName = row.race_full_name;

          if (!season || !raceFullName) return acc;

          if (!acc[season]) {
            acc[season] = [];
          }
          if (!acc[season].includes(raceFullName)) {
            acc[season].push(raceFullName);
          }

          return acc;
        }, {});

        const formattedRaces = Object.entries(groupedRaces)
        // Sort seasons in descending order
        .sort(([seasonA], [seasonB]) => parseInt(seasonB) - parseInt(seasonA))
        .map(([season, races]) => ({
          label: `${season} Season`,
          // Sort races numerically in descending order within each season
          options: races
            .sort((raceA, raceB) => {
              const numA = parseInt(raceA.match(/\\d+/)?.[0] || 0, 10);
              const numB = parseInt(raceB.match(/\\d+/)?.[0] || 0, 10);
              return numB - numA; // Descending order
            })
            .map((race) => ({
              value: race,
              label: race,
            })),
        }));
      
      // Set the default race to the latest race in the first (most recent) season
      setRaceGroups(formattedRaces);
      setSelectedRace(formattedRaces[0]?.options[0]?.value || null);
      },
    });
  }, []);

  useEffect(() => {
    if (!isLoading && selectedEntities.length === 0) {
      const allEntities = Object.keys(data);
      if (allEntities.length > 1) {
        const randomEntities = allEntities.sort(() => 0.5 - Math.random()).slice(0, 2);
        setSelectedEntities(randomEntities);
      }
    }
  }, [isLoading, data]);

  const defaultSortField =
  entityType === 'drivers'
    ? 'rapm_blended'
    : entityType === 'constructors'
    ? 'rapm_blended'
    : 'rapm_combined'; // for combined mode

  const handleEntitySelect = (selectedOptions) => {
    setSelectedEntities(selectedOptions.map(option => option.value));
  };

  const handleDownloadCSV = () => {
    const allRows = Object.values(data).flat();
  
    const selectedColumns = [
      'entity_id',
      'parent_constructor_id',
      'parent_constructor_name',
      'constructor_id',
      'driver_name',
      'model_date',
      'season',
      'round',
      'circuit',
      'race_name',
      'rapm_blended',
      'rapm_error',
    ];
  
    const filteredRows = allRows.map(row => {
      const filtered = {};
      selectedColumns.forEach(col => {
        filtered[col] = row[col] || '';
      });
      return filtered;
    });
  
    const csvContent = [
      selectedColumns.join(','), // header
      ...filteredRows.map(row => selectedColumns.map(col => row[col]).join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'f1_rapm_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  const handleRaceChange = (event) => {
    setSelectedRace(event.target.value);
  };

  const handleEntityTypeToggle = (type) => {
    setEntityType(type);
  };

  const sortedEntityOptions = useMemo(() => {
    return Object.entries(data)
      .map(([entityId, entityData]) => {
        const maxRound = Math.max(...entityData.map(d => parseInt(d.overall_round, 10) || 0));
        return {
          entityId,
          label: entityData?.[0]?.display_name || 'Unknown',
          lastRound: maxRound,
        };
      })
      .sort((a, b) => b.lastRound - a.lastRound)
      .map(({ entityId, label }) => ({
        value: entityId,
        label,
      }));
  }, [data]);

  const tableData = Object.values(data)
  .flat()
  .filter(row => row.race_full_name === selectedRace)
  .filter(row => {
    if (entityType === 'drivers') return row.entity_id.endsWith('-d');
    if (entityType === 'constructors') return row.entity_id.endsWith('-c');
    return row.entity_id.endsWith('-d'); // For combined, start with drivers
  })
  .map((row, index) => {
    const driverImage = `/Images/Drivers/png/${row.entity_id.replace('-d', '')}.png`;
    const constructorImage = `/Images/Constructor/png/${row.parent_constructor_id?.replace('-c', '')}.png`;

    if (entityType === 'combined') {
      const constructorEntityId = `${row.parent_constructor_id?.replace('-c', '')}-c`;
      const constructorRatingRow = data[constructorEntityId]?.find(
        d => d.race_full_name === selectedRace
      );

      const rapm_driver = parseFloat(row.rapm_blended.toFixed(2));
      const rapm_constructor = parseFloat((constructorRatingRow?.rapm_blended || 0).toFixed(2));
      const rapm_combined = parseFloat((rapm_driver + rapm_constructor).toFixed(2));

      return {
        id: index,
        display_name: row.display_name || '-',
        parent_constructor_name: row.parent_constructor_name || '-',
        rapm_driver,
        rapm_constructor,
        rapm_combined,
        driverImage,
        constructorImage,
        current_primary_color: row.current_primary_color || '#e0e0e0',
      };
    }

    return {
      id: index,
      display_name: row.display_name || '-',
      parent_constructor_name: row.parent_constructor_name || '-',
      rapm_blended: parseFloat(row.rapm_blended.toFixed(2)),
      driverImage,
      constructorImage,
      current_primary_color: row.current_primary_color || '#e0e0e0',
    };
  });

  const columns =
  entityType === 'drivers'
    ? [
        {
          field: 'display_name',
          headerName: 'Driver Name',
          flex: 1,
          renderCell: (params) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={params.row.driverImage}
                onError={(e) => { e.target.onerror = null; e.target.src = '/Images/Drivers/png/placeholder.png'; }}
                alt="Driver"
                style={{ width: 30, height: 30, marginRight: 10 }}
              />
              {params.value}
            </div>
          ),
        },
        {
          field: 'parent_constructor_name',
          headerName: 'Constructor',
          flex: 1,
          renderCell: (params) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={params.row.constructorImage}
                onError={(e) => { e.target.onerror = null; e.target.src = '/Images/Constructor/png/placeholder.png'; }}
                alt="Constructor"
                style={{ width: 101, height: 30, marginRight: 10 }}
              />
              {params.value}
            </div>
          ),
        },
        { field: 'rapm_blended', headerName: 'Driver Rating', flex: 1, sortable: true },
      ]
    : entityType === 'constructors'
    ? [
        {
          field: 'display_name',
          headerName: 'Constructor',
          flex: 1,
          renderCell: (params) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={params.row.constructorImage}
                onError={(e) => { e.target.onerror = null; e.target.src = '/Images/Constructor/png/placeholder.png'; }}
                alt="Constructor"
                style={{ width: 101, height: 30, marginRight: 10 }}
              />
              {params.value}
            </div>
          ),
        },
        { field: 'rapm_blended', headerName: 'Constructor Rating', flex: 1, sortable: true },
      ]
    : [
        {
          field: 'display_name',
          headerName: 'Driver Name',
          flex: 1,
          renderCell: (params) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={params.row.driverImage}
                onError={(e) => { e.target.onerror = null; e.target.src = '/Images/Drivers/png/placeholder.png'; }}
                alt="Driver"
                style={{ width: 30, height: 30, marginRight: 10 }}
              />
              {params.value}
            </div>
          ),
        },
        {
          field: 'parent_constructor_name',
          headerName: 'Constructor',
          flex: 1,
          renderCell: (params) => (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={params.row.constructorImage}
                onError={(e) => { e.target.onerror = null; e.target.src = '/Images/Constructor/png/placeholder.png'; }}
                alt="Constructor"
                style={{ width: 101, height: 30, marginRight: 10 }}
              />
              {params.value}
            </div>
          ),
        },
        { field: 'rapm_driver', headerName: 'Driver Rating', flex: 1, sortable: true },
        { field: 'rapm_constructor', headerName: 'Constructor Rating', flex: 1, sortable: true },
        { field: 'rapm_combined', headerName: 'Combined Rating', flex: 1, sortable: true },
      ];



  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
<h1 className="app-title">
  <span style={{ color: '#D53823' }}>Formula 1</span> Constructor & Driver Ratings
</h1>      <h2 className="subtitle">
  2014 through the {latestSeason && latestRaceName ? `${latestSeason} ${latestRaceName}` : 'Present'}
</h2>
<p className="attribution">
  Rating System + App by Saurabh Rane (
  <a href="https://x.com/SaurabhOnTap" target="_blank" rel="noopener noreferrer">Twitter</a> |
  <a href="https://saurabhr.com/" target="_blank" rel="noopener noreferrer">Website</a>). This model seeks to apply a regulaized adjusted
  plus-minus framework and apply to Formula 1 in an effort to decompose driver and constructor impact. While the model has predictive 
  applications, the predictions are notably lacking the interaction factor between driver & car in an effort to isolate constructor and 
  driver impact. Full methodology to be published later this year. 
</p>
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '1.5rem'  // Add spacing below
}}>
      <SearchTool
  options={sortedEntityOptions}
  onSelect={handleEntitySelect}
  value={selectedEntities.map(entityId => ({
    value: entityId,
    label: data[entityId]?.[0]?.display_name || 'Unknown',
  }))}
/>

      </div>

      <RatingChart data={selectedEntities.reduce((acc, entityId) => {
        if (data[entityId]) {
          acc[entityId] = data[entityId];
        }
        return acc;
      }, {})} />

      <EntityTypeToggle entityType={entityType} onToggle={handleEntityTypeToggle} />

      <RaceSelector
  options={raceGroups.map((group) => ({
    label: group.label,
    options: group.options,
  }))}
  onSelect={(selectedOption) => setSelectedRace(selectedOption.value)}
  value={selectedRace ? { value: selectedRace, label: selectedRace } : null}
/>
<Table
  columns={columns}
  data={tableData}
  title={`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Ratings Table`}
  defaultSortField={defaultSortField}
  customHeader={
    <button
      onClick={handleDownloadCSV}
      style={{
        fontFamily: 'Roboto, sans-serif',
        fontSize: '0.75rem',
        padding: '0.4rem 0.75rem',
        backgroundColor: '#D53823',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }}
    >
      Download Full Data (CSV)
    </button>
  }
/>

    </div>
  );
}

export default App;
