  import React from 'react';
  import Select from 'react-select';

  const SearchTool = ({ options, onSelect, value }) => {

    console.log("Driver/Constructor Options:")
    console.log(options)

    return (
      <Select
        isMulti
        options={options} // Pass grouped options
        onChange={onSelect}
        value={value}
        placeholder="Select entities..."
      />
    );
  };

  export default SearchTool;