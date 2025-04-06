import React from 'react';

const GrowthTable = ({ data }) => {
  if (!data) return <p>No growth data available.</p>;

  return (
    <div className="growth-table fade-in">
      <h2>Monthly Growth Percentage</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Growth (%)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([month, growth]) => (
            <tr key={month}>
              <td>{month}</td>
              <td style={{ color: growth >= 0 ? 'green' : 'red' }}>{growth}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GrowthTable;
