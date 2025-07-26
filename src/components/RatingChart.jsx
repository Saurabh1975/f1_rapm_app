  import React, { useMemo } from 'react';
  import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Area, CartesianGrid, Customized } from 'recharts';

  function getConstructorStints(driverData) {
    if (!driverData || driverData.length === 0) return [];
  
    const stints = [];
    let currentStint = [];
    for (let i = 0; i < driverData.length; i++) {
      const curr = driverData[i];
      const prev = driverData[i - 1];
  
      const sameConstructor = prev && curr.parent_constructor_id === prev.parent_constructor_id;
      const consecutiveRound = prev && curr.overall_round === prev.overall_round + 1;
  
      if (!prev || (!sameConstructor || !consecutiveRound)) {
        if (currentStint.length > 0) {
          stints.push(currentStint);
        }
        currentStint = [curr];
      } else {
        currentStint.push(curr);
      }
    }
    if (currentStint.length > 0) stints.push(currentStint);
  
    return stints.map((stint, index) => ({
      id: index,
      startRound: stint[0].overall_round,
      endRound: stint[stint.length - 1].overall_round,
      constructorId: stint[0].parent_constructor_id,
      constructorName: stint[0].parent_constructor_name,
      color: stint[0].primary_color || '#ccc'
    }));
  }
  

  const LineEndImages = ({ points, selectedEntities, data, chartWidth, chartHeight, xScale, yScale }) => {
    return (
      <>
        {selectedEntities.map((entityId, index) => {
          const entityPoints = data[entityId];
          if (!entityPoints || entityPoints.length === 0) return null;
  
          const lastPoint = [...entityPoints].reverse().find(p => p.rapm_blended !== null && !isNaN(p.rapm_blended));
          if (!lastPoint) return null;
  
          const x = xScale(lastPoint.overall_round);
          const y = yScale(lastPoint.rapm_blended);
  
          const isDriver = entityId.endsWith('-d');
          const imagePath = isDriver
            ? `/Images/Drivers/png/${entityId.replace('-d', '')}.png`
            : `/Images/Constructor/png/${entityId.replace('-c', '')}.png`;
  
          return (
            <image
              key={entityId}
              href={imagePath}
              x={x - 15}
              y={y - 15}
              width={30}
              height={30}
              style={{ pointerEvents: 'none' }}
            />
          );
        })}
      </>
    );
  };
  


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;



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
  key={entityId}
  type="monotone"
  dataKey={entityId}
  stroke={latestColor}
  strokeWidth={2.5} // <— Control thickness here
  name={entityId}
  dot={(props) => {
    // Only show image if constructor is selected
    if (!entityId.endsWith('-c')) return null;
  
    const { cx, cy, index } = props;
  
    const isLastPoint =
      index === chartData.dataPoints.length - 1 ||
      chartData.dataPoints.slice(index + 1).every(p => p[entityId] === undefined || p[entityId] === null);
  
    if (!isLastPoint) return null;
  
    const imagePath = `/Images/Constructor/png/${entityId.replace('-c', '')}.png`;
  
    return (
      <image
        href={imagePath}
        x={cx - 30}
        y={cy - 15}
        width={60}
        height={30}
        style={{ pointerEvents: 'none' }}
      />
    );
  }}
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
{selectedEntities.length === 1 && selectedEntities[0].endsWith('-d') && (
  <Customized
    component={({ xAxisMap, yAxisMap, width, height }) => {
      const driverId = selectedEntities[0];
      const driverData = data[driverId]?.filter(d => d.overall_round != null) || [];
      const stints = getConstructorStints(driverData);
      const xScale = xAxisMap[Object.keys(xAxisMap)[0]].scale;

      const roundExtent = xScale.domain(); // [minRound, maxRound]
      const roundRange = roundExtent[1] - roundExtent[0];

      return (
        <g>
          {stints.map((stint) => {
            const xStart = xScale(stint.startRound);
            const xEnd = xScale(stint.endRound + 1);
            const width = xEnd - xStart;
            const barHeight = 15;
            const yOffset = 0;

            return (
              <g key={stint.id}>
                <rect
                  x={xStart}
                  y={yOffset}
                  width={width}
                  height={barHeight}
                  fill={stint.color}
                  stroke="#000"
                  strokeWidth="0.25"
                  opacity={0.9}
                />
                {width / (xScale(roundExtent[1]) - xScale(roundExtent[0])) >= 0.15 && (
                  <text
                    x={xStart + width / 2}
                    y={yOffset + barHeight / 2 + 3}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="10"
                    fontFamily="'Roboto Mono', monospace"
                    fontWeight="700"
                                      >
                    {stint.constructorName}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      );
    }}
  />
)}

        </LineChart>
      </ResponsiveContainer>
    );
  }

  export default RatingChart;