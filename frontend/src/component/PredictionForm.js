import React from 'react';

import { useState } from "react";

const PredictionForm = ({ onPredict }) => {
  const [formData, setFormData] = useState({
    forecast_horizon: 12,
    Year: 2026,
    Lag1: 1000,
    Lag2: 900,
    Rolling_Mean_12: 950,
    Month: 1
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow-md">
      <label>Forecast Horizon (Months):</label>
      <input type="number" name="forecast_horizon" value={formData.forecast_horizon} onChange={handleChange} />

      <label>Year:</label>
      <input type="number" name="Year" value={formData.Year} onChange={handleChange} />

      <label>Lag 1:</label>
      <input type="number" name="Lag1" value={formData.Lag1} onChange={handleChange} />

      <button type="submit">Predict</button>
    </form>
  );
};

export default PredictionForm;
