import React, { useEffect } from 'react';

function DateFilter({ raceGroups, selectedRace, setSelectedRace }) {

  console.log("Race list:")
  console.log(raceGroups)
  
  useEffect(() => {
    if (raceGroups.length > 0 && !selectedRace) {
      setSelectedRace(raceGroups[0]?.options[0]?.value || null);
    }
  }, [raceGroups, selectedRace, setSelectedRace]);

  return (
    <div>
      <select
        value={selectedRace || ''}
        onChange={(e) => setSelectedRace(e.target.value)}
      >
        {raceGroups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((race) => (
              <option key={race.value} value={race.value}>
                {race.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

export default DateFilter;
