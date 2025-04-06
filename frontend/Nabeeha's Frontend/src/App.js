import React, { useState, useRef } from 'react';
import PredictionForm from './components/PredictionForm';
import PredictionChart from './components/PredictionChart';
import { fetchPredictions } from './components/api';
import GrowthTable from './components/GrowthTable';
import Navbar from './navbar/NavBar.js'; // Adjust the path based on your folder structure
import Footer from './footer/Footer.js';
import loadingImage from "./assets/bggg.png";
import search from './assets/search.png';
import bg_one from './assets/img_one.png';
import bg_two from './assets/img_two.png';
import bg_three from './assets/img_three.png';
import bg_four from './assets/img_four.png';
import tree_big from './assets/tree_big.png';
import tree_small from './assets/tree_small.png';
import arrow_right from './assets/arrow_right.png';


function App() {
    const [formData, setFormData] = useState({ year: "", horizon: "" });
  const [predictionData, setPredictionData] = useState(null);
  const predictionSectionRef = useRef(null);

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
          peak_month: yearlyData.peak_month,
          low_month: yearlyData.low_month,
          monthly_growth_percentage: yearlyData.monthly_growth_percentage,
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

  const handleScrollToPrediction = () => {
    if (predictionSectionRef.current) {
      predictionSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (<>
          <div className="navbar"><Navbar/></div>

          <div className="entire-content">


              <div className="bg_top">
                  <img
                      src={bg_one}
                      alt="bg_one_img"
                      className="bg_one"
                  />
                  <img
                      src={bg_two}
                      alt="bg_two_img"
                      className="bg_two"
                  />
              </div>

              <div className="description-container">
                  <h2>Ayurvedic Tourism Forecasting</h2>
                  <form>
                      <div className="form-group">
                          <label htmlFor="description"></label>
                          <p>Predict the Future of Ayurvedic Tourism – Start Your Journey Today!</p>
                          <img
                              src={search}
                              alt="Illustrasion of woman"
                              className="search"
                          />
                      </div>
                      <div className="button-and-icon">
                          <button className="desc-btn" onClick={handleScrollToPrediction}>Get Started</button>
                          <div className="arrow_btn">
                              <img
                                  src={arrow_right}
                                  alt="Arrow"
                                  className="arrow_right"
                                  onClick={handleScrollToPrediction}
                              />
                          </div>
                      </div>
                  </form>
              </div>
              <div className="bg_bottom">
                  <img
                      src={bg_three}
                      alt="bg_three_img"
                      className="bg_three"
                  />

                  <img
                      src={bg_four}
                      alt="bg_four_img"
                      className="bg_four"
                  />
              </div>
              <div className="tree_container">
                  <img src={tree_big} alt="img_tree" className="tree_big"/>
                  <img src={tree_small} alt="img_tree_2" className="tree_small"/>

              </div>


              <div ref={predictionSectionRef} className="float-container">
                  <h1>Let's Forecast Ayurvedic Tourists !</h1>
                  <div className="float-child">
                      <PredictionForm onPredict={handlePrediction}/>

                      <div className="summary-container">
                          <div className="summary-content fade-in">
                              <h2>Summary</h2>
                              {predictionData ? (
                                  <>
                                      <p><strong>Total Predicted Tourists:</strong> {predictionData.total_tourists || 0}
                                      </p>
                                      <p><strong>Average Monthly
                                          Tourists:</strong> {predictionData.avg_tourists ? predictionData.avg_tourists.toFixed(2) : '0.00'}
                                          <p><strong>Peak Month:</strong> {predictionData.peak_month}</p>
                                          <p><strong>Lowest Month:</strong> {predictionData.low_month}</p>
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

              <div className={`chart-container ${predictionData ? "no-bg" : ""}`}>
                  {predictionData ? (
                      <PredictionChart data={predictionData}/>
                  ) : (
                      <div className="loading-image">
                          <img src={loadingImage} alt="Loading..."/>
                      </div>
                  )}
              </div>

              <div className="growth-table-container">
                  {/* Growth Table */}
                  {predictionData && predictionData.monthly_growth_percentage && (
                      <GrowthTable data={predictionData.monthly_growth_percentage}/>
                  )}
              </div>

              <Footer/>
          </div>
      </>


  )
      ;
}

export default App;
