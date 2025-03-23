import React, { useState } from "react";

const PredictionForm = ({ onPredict }) => {
  const [formData, setFormData] = useState({
    forecast_horizon: 5,
    Year: 2025,
    Lag2: 900,
    Rolling_Mean_12: 1000,
    Month: 1
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    value = Number(value);

    // Prevent negative forecast horizon values
    if (name === "forecast_horizon" && value < 1) return;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedFormData = { ...formData, Lag1: 1000 }; // Set Lag1 automatically
    onPredict(updatedFormData);
    console.log("Submitting Data:", updatedFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
    <div className="form-content">
      {/* Year Dropdown */}
      <div className="input-group">
        <div className="label-year"><b><label className="text-sm font-medium text-gray-700 mb-1">Year</label></b></div>
        <select name="Year" value={formData.Year} onChange={handleChange} className="custom-dropdown">
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
      </div>
      {/* Forecast Horizon Input */}
      <div className="input-group" style={{height: "100px"}}>
        <div className="label-forecast">
          <label><b>Forecast Horizon</b></label></div>
        <input
            type="number"
            name="forecast_horizon"
            value={formData.forecast_horizon}
            onChange={handleChange}
            min="1"
            max="12"
            className="months"
        />
      </div>

      {/* Predict Button */}
      <button type="submit" className="custom-button" onClick={handleSubmit}>
        Predict
      </button>
    </div>
  </form>



  );
};

export default PredictionForm;
