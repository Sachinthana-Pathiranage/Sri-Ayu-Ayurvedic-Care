import React from 'react';

import { useState } from "react";
import PredictionForm from "./component/PredictionForm";
import PredictionChart from "./component/PredictionChart";
import { fetchPredictions } from "./component/api";



function App() {
  const [predictionData, setPredictionData] = useState(null);

  const handlePrediction = async (formData) => {
    const result = await fetchPredictions(formData);
    console.log("Fetched prediction data:", result);
    setPredictionData(result);
  };



  // ✅ Ensure predictionData is an array before calling reduce
  const totalTourists = Array.isArray(predictionData)
    ? predictionData.map(month => month.value).reduce((sum, val) => sum + val,0)
    : 0;
    console.log("Prediction Data in Calculation:", predictionData);


  const avgMonthlyTourists = Array.isArray(predictionData) && predictionData.length > 0
    ? (totalTourists / predictionData.length).toFixed(2)
    : 0;
  console.log(typeof predictionData, predictionData);

  return (
      <div className="bg-green-50 min-h-screen">
       {/* Navbar */}
      <nav className="bg-green-600 p-4 text-white shadow-lg">
        <div className="container mx-auto flex justify-between">
          <h1 className="text-lg font-bold">Sri Ayu Forecasting</h1>
          <div className="space-x-4">
            <a href="#" className="hover:underline">Home</a>
            <a href="#" className="hover:underline">Forecast</a>
            <a href="#" className="hover:underline">About</a>
          </div>
        </div>
      </nav>


    {/* Main Content */}
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-green-700 mb-4">
          Ayurveda Tourism Forecasting
        </h1>

        <PredictionForm onPredict={handlePrediction} />

        {predictionData && (
          <>
            <PredictionChart data={predictionData} />

            {/* Summary Box */}
            <div className="mt-6 p-4 bg-white shadow-md rounded-lg text-green-800">
              <h2 className="text-lg font-semibold">Summary</h2>
              <p><strong>Total Predicted Tourists:</strong> {totalTourists}</p>
              <p><strong>Average Monthly Tourists:</strong> {avgMonthlyTourists}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
