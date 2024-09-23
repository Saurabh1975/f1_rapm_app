import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, CartesianGrid  } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    console.log("Data & payload are: ");
    console.log(data);
    console.log(payload[0]);

    const season = data.season;
    const raceName = data[`${payload[0].dataKey}_race_name`];

    return (
      <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <p className="tooltip-title">{`${raceName} - ${season}`}</p>
        {payload.map((entry, index) => {
          const entityId = entry.dataKey;
          const rapm_blended = entry.value;
          const rapm_error = Math.abs(data[`${entityId}_upper`] - rapm_blended);
          const constructorName = data[`${entityId}_constructor_name`];
          const entityColor = entry.color; // This is the latest primary_color
          const constructorColor = data[`${entityId}_primary_color`]; // This is the data point's primary_color

          return (
            <p key={index} className="tooltip-content" style={{ marginBottom: '5px' }}>
              <span style={{ color: entityColor, fontWeight: 'bold' }}>{entityId} </span>
              <span style={{ color: 'black' }}>(</span>
              <span style={{ color: constructorColor }}>{constructorName}</span>
              <span style={{ color: 'black' }}>): </span>
              <span style={{ fontWeight: 'bold' }}>{`${rapm_blended.toFixed(1)} `}</span>
              <span>{`± ${rapm_error.toFixed(1)}`}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

function RatingChart({ data }) {
  const chartData = useMemo(() => {
    const allRounds = new Set();
    const entityData = {};
  
    Object.entries(data).forEach(([entityId, entityPoints]) => {
      entityData[entityId] = entityPoints
        .filter(point => point.season >= 2014)
        .reduce((acc, point) => {
          allRounds.add(point.overall_round);
          acc[point.overall_round] = {
            rapm_blended: point.rapm_blended,
            rapm_error: point.rapm_error,
            season: point.season,
            race_name: point.race_name,
            parent_constructor_name: point.parent_constructor_name,
            constructor_name: point.constructor_name,
            primary_color: point.primary_color,

          };
          return acc;
        }, {});
    });
  
    const sortedRounds = Array.from(allRounds).sort((a, b) => a - b);
    const minRound = sortedRounds[0];
    const maxRound = sortedRounds[sortedRounds.length - 1];
    
    const roundRange = maxRound - minRound;
    const newMinRound = Math.floor(minRound - (roundRange * 0.025));



  
    const dataPoints = sortedRounds.map(round => {
      const point = { overall_round: round };
      Object.entries(entityData).forEach(([entityId, points]) => {
        if (round in points) {
          point[entityId] = points[round].rapm_blended;
          point[`${entityId}_lower`] = points[round].rapm_blended - Math.abs(points[round].rapm_error);
          point[`${entityId}_upper`] = points[round].rapm_blended + Math.abs(points[round].rapm_error);
          point[`${entityId}_race_name`] = points[round].race_name;
          point[`${entityId}_constructor_name`] = points[round].constructor_name;
          point[`${entityId}_primary_color`] = points[round].primary_color;
          point.season = points[round].season;
        }
      });
      return point;
    });

    console.log("Data Points are:")
    console.log(dataPoints)
  
    return {
      dataPoints,
      xAxisDomain: [newMinRound, maxRound]
    };
  }, [data]);

  const generateColor = (index) => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    return colors[index % colors.length];
  };

  const seasonTicks = useMemo(() => {
    const ticks = {};
    chartData.dataPoints.forEach(point => {
      if (!ticks[point.season]) {
        ticks[point.season] = point.overall_round;
      }
    });
    return Object.values(ticks).sort((a, b) => a - b);
  }, [chartData.dataPoints]);

  const selectedEntities = Object.keys(data);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart 
        data={chartData.dataPoints} 
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
      <CartesianGrid 
        vertical={true} 
        horizontal={false}
        stroke="#e0e0e0"
        strokeDasharray="3 1"
      />
        <XAxis
          dataKey="overall_round"
          type="number"
          domain={chartData.xAxisDomain}
          ticks={seasonTicks}
          tickFormatter={(tick) => {
            const point = chartData.dataPoints.find(p => p.overall_round === tick);
            return point ? point.season : '';
          }}
        />
        <YAxis
          domain={['auto', 'auto']}
          label={{ value: 'RAPM Blended', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {Object.entries(data).map(([entityId, entityData], index) => {
          const latestColor = entityData[entityData.length - 1]?.primary_color || generateColor(index);
          return (
            <React.Fragment key={entityId}>
              <Line
                type="monotone"
                dataKey={entityId}
                stroke={latestColor}
                name={entityId}
                dot={{ r: 1, fill: 'white', strokeWidth: 1 }}
                activeDot={{ r: 7.5, fill: latestColor }}
                connectNulls
              />
              {selectedEntities.length === 1 && (
                <>
                  <Area
                    type="monotone"
                    dataKey={`${entityId}_lower`}
                    stroke="none"
                    fillOpacity={0.3}
                    fill={latestColor}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey={`${entityId}_upper`}
                    stroke="none"
                    fillOpacity={0.3}
                    fill={latestColor}
                    isAnimationActive={false}
                  />
                </>
              )}
            </React.Fragment>
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default RatingChart;