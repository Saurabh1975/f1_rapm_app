import React, { useState, useEffect } from 'react';

function DateFilter({ onDateChange, dates }) {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (dates.length > 0) {
      const latestDate = new Date(Math.max(...dates));
      setSelectedYear(latestDate.getFullYear());
      setSelectedDate(latestDate);
      onDateChange(latestDate);
    }
  }, [dates, onDateChange]);

  const years = [...new Set(dates.map(date => date.getFullYear()))].sort((a, b) => b - a);

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
    setSelectedDate(null);
  };

  const handleDateChange = (event) => {
    const newDate = new Date(event.target.value);
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const datesForYear = dates.filter(date => date.getFullYear() === selectedYear)
    .sort((a, b) => b - a);

  return (
    <div>
      <select value={selectedYear} onChange={handleYearChange}>
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      <select value={selectedDate?.toISOString().split('T')[0]} onChange={handleDateChange}>
        {datesForYear.map(date => (
          <option key={date.toISOString()} value={date.toISOString().split('T')[0]}>
            {date.toLocaleDateString()}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DateFilter;