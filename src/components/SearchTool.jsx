import React from 'react';
import Select from 'react-select';

function SearchTool({ options, onSelect }) {
  return (
    <div style={{ width: '100%' }}>
      <Select
        options={options}
        isMulti
        onChange={onSelect}
        placeholder="Search for drivers or constructors..."
      />
    </div>
  );
}

export default SearchTool;