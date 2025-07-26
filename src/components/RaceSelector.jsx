import React from 'react';
import Select from 'react-select';

const RaceSelector = ({ options, onSelect, value }) => {
  console.log("Race Options:");
  console.log(options);

  return (
    <Select
      isMulti={false} // Single-select for races
      options={options} // Grouped options by season
      onChange={onSelect}
      value={value}
      placeholder="Select a race..."
    />
  );
};

export default RaceSelector;
