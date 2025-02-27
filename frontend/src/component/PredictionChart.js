import React from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const PredictionChart = ({ data }) => {
  if (!data || !data.yearly_predictions) return <p>No data available</p>;

  const chartData = Object.keys(data.yearly_predictions).map((year) => {
    return Object.entries(data.yearly_predictions[year].monthly_predictions).map(([month, value]) => ({
      name: `Month ${month}`,
      [`Year ${year}`]: value
    }));
  }).flat();

  return (
    <LineChart width={800} height={400} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      {Object.keys(data.yearly_predictions).map((year) => (
        <Line key={year} type="monotone" dataKey={`Year ${year}`} stroke="#8884d8" />
      ))}
    </LineChart>
  );
};

export default PredictionChart;
