import React, { useState } from 'react';
import PredictionForm from './components/PredictionForm';
import PredictionChart from './components/PredictionChart';
import { fetchPredictions } from './components/api';


function App() {
  const [predictionData, setPredictionData] = useState(null);

  const handlePrediction = async (formData) => {
    const result = await fetchPredictions(formData);
    console.log('🔵 API Response:', result);

    if (result && result.yearly_predictions) {
      const yearlyData = Object.values(result.yearly_predictions)[0]; // Extract first year’s data

      if (yearlyData) {
        // ✅ Extract numeric values only
        const monthlyValues = Object.values(yearlyData).map((value) =>
          typeof value === 'number' ? value : 0
        );

        const totalTourists = monthlyValues.reduce((sum, val) => sum + val, 0);
        const avgTourists = monthlyValues.length > 0 ? totalTourists / monthlyValues.length : 0;

        setPredictionData({
          yearly_predictions: result.yearly_predictions,
          total_tourists: totalTourists,
          avg_tourists: avgTourists,
        });
      } else {
        setPredictionData(null);
      }
    } else {
      console.error('❌ API did not return expected structure:', result);
      setPredictionData(null);
    }
  };

  // ✅ Ensure predictionData is an array before calling reduce
  const totalTourists =
    Array.isArray(predictionData) ?
      predictionData.map((month) => month.value).reduce((sum, val) => sum + val, 0) :
      0;
  console.log('Prediction Data in Calculation:', predictionData);

  const avgMonthlyTourists =
    Array.isArray(predictionData) && predictionData.length > 0
      ? (totalTourists / predictionData.length).toFixed(2)
      : 0;
  console.log(typeof predictionData, predictionData);

  return (<div>
    <div className="float-container">

      <div className="float-child">
        <PredictionForm onPredict={handlePrediction}/>

        <div className="summary-container">
          <div className="summary-content">
            <h2>Summary</h2>
            {predictionData ? (
                <>
                  <p><strong>Total Predicted Tourists:</strong> {predictionData.total_tourists || 0}</p>
                  <p><strong>Average Monthly
                    Tourists:</strong> {predictionData.avg_tourists ? predictionData.avg_tourists.toFixed(2) : '0.00'}
                  </p>
                </>
            ) : (
                <p className="text-muted">To see the summary, choose a year and forecast horizon.</p>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Right Side - Forecast Chart */}

    <div className="chart-container">
      {predictionData ? (
          <PredictionChart data={predictionData}/>
      ) : (
          <div>
            <p className="chart-sentence">Forecast will be displayed here</p>
            <img src="/images/138249006_1031535333.png" alt="Loading animation" className="fore-image"/>
          </div>
      )}
    </div>
      </div>


  )
      ;
}

export default App;
