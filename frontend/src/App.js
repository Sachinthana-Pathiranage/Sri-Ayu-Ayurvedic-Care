import React, { useState } from 'react';
import PredictionForm from './components/PredictionForm';
import PredictionChart from './components/PredictionChart';
import { fetchPredictions } from './components/api';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardHeader } from 'mdb-react-ui-kit';


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

  return (
      <div className="bg-green-50 min-h-screen">

        <MDBContainer className="p-5">
          <h1 className="text-2xl font-bold text-green-700 mb-4 text-center">
            Ayurveda Tourism Forecasting
          </h1>
          <br/>

          <MDBRow className="justify-content-center align-items-start">
            {/* Left Side - Prediction Form */}
            <MDBCol md="4">
              <MDBCard className="shadow-lg">
                <MDBCardBody>
                  <div style={{width: '35%'}}>
                    <PredictionForm onPredict={handlePrediction}/>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            {/* Right Side - Prediction Chart (Adjusted Width) */}
            <MDBCol md="6" className="d-flex justify-content-center">
              <MDBCard className="shadow-lg w-100">
                <MDBCardHeader className="bg-dark text-white text-center"></MDBCardHeader>
                <MDBCardBody className="d-flex justify-content-center">
                  {predictionData ? (
                      <div style={{width: '95%'}}> {/* ✅ Reduce Chart Width */}
                        <PredictionChart data={predictionData}/>
                      </div>
                  ) : (
                      <p className="text-muted text-center">No forecast data available.</p>
                  )}
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>

        <div className="summary-container">
          <div className="summary">
            <MDBCol md="4">
              <MDBCard className="fixed-summary">
                <MDBCardBody>
                  <h2 className="text-lg font-semibold text-white">Summary</h2>
                  <div className="summary-content">
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
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </div>
        </div>
      </div>
  );
}

export default App;
