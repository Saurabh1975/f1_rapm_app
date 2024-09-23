import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import SearchTool from './components/SearchTool.jsx';
import RatingChart from './components/RatingChart.jsx';
import './App.css';

function App() {
  const [data, setData] = useState({});
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [modelLastUpdate, setModelLastUpdate] = useState(null);


  useEffect(() => {
    Papa.parse('/rapm_history_combined_cleaned.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const parsedData = results.data
          .filter(row => row.entity_id && row.rapm_blended && row.model_date && row.overall_round && row.season)
          .reduce((acc, row) => {
            const entityId = row.driver_name || row.parent_constructor_name;
            if (!acc[entityId]) {
              acc[entityId] = [];
            }
            acc[entityId].push({
              ...row,
              rapm_blended: parseFloat(row.rapm_blended),
              rapm_error: parseFloat(row.rapm_error),
              overall_round: parseInt(row.overall_round),
              season: parseInt(row.season),
              model_date: new Date(row.model_date)
            });
            return acc;
          }, {});
        setData(parsedData);
        setIsLoading(false);

        // Find the latest model_date
        const latestModelDate = new Date(Math.max(...Object.values(parsedData).flatMap(arr => arr.map(item => item.model_date))));
        setModelLastUpdate(latestModelDate.toLocaleDateString());
      }
    });
  }, []);

  const handleEntitySelect = (selectedOptions) => {
    setSelectedEntities(selectedOptions.map(option => option.value));
  };

  const getChartData = () => {
    return selectedEntities.reduce((acc, entityId) => {
      if (data[entityId]) {
        acc[entityId] = data[entityId];
      }
      return acc;
    }, {});
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
    <h1 className="app-title">Formula 1 Constructor & Driver Ratings</h1>
      <p className="subtitle">2014 to Present | Model Last Updated {modelLastUpdate}</p>
      <p className="attribution">by <a href="https://x.com/SaurabhOnTap" target="_blank" rel="noopener noreferrer">Saurabh Rane</a> | Methodology to Come Soon</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <SearchTool 
          options={Object.keys(data).map(entityId => ({ value: entityId, label: entityId }))} 
          onSelect={handleEntitySelect} 
        />
        <div style={{ width: '50%', minHeight: '50px' }}>
          {tooltipContent}
        </div>
      </div>
      <RatingChart 
        data={getChartData()} 
        setTooltipContent={setTooltipContent}
      />
    </div>
  );
}

export default App;