import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import search from './assets/search.png';
import arrow_right from './assets/arrow_right.png';
import bg_one from './assets/img_one.png';
import bg_two from './assets/img_two.png';
import bg_three from './assets/img_three.png';
import bg_four from './assets/img_four.png';
import tree_big from './assets/tree_big.png';
import tree_small from './assets/tree_small.png';
import tree_bottom from './assets/tree_bottom.png';

function App() {
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [probability, setProbability] = useState(null);
  const [predictionMade, setPredictionMade] = useState(false);
  const [showWellnessForm, setShowWellnessForm] = useState(false);
  const [ageRange, setAgeRange] = useState('');
  const [doshaType, setDoshaType] = useState('');
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [showDoshaDropdown, setShowDoshaDropdown] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [wellnessData, setWellnessData] = useState(null); // State to store wellness plan data

  const classifierRef = useRef(null);
  const resultRef = useRef(null);
  const wellnessFormRef = useRef(null);

  const symptomsList = [
    'shivers', 'acidity', 'tiredness', 'weight_loss', 'lethargy', 'cough',
    'high_fever', 'digestive_issues', 'headache', 'stomach_ache', 'vomiting',
    'loss_of_appetite', 'gnawing', 'upper_stomach_pain', 'burning_ache',
    'swelled_lymph_nodes', 'blurry_eyesight', 'phlegm',
    'sinus_pressure', 'chest_pain', 'dizziness', 'overweight',
    'weak_muscles', 'irritability', 'frequent_urination', 'vision_changes'
  ];

  const handleSymptomClick = (symptom) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptom]: prev[symptom] ? 0 : 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = 'http://localhost:5000/predict';

    try {
      const fullSymptoms = symptomsList.reduce((acc, symptom) => {
        acc[symptom] = 0;
        return acc;
      }, {});

      for (const [symptom, value] of Object.entries(selectedSymptoms)) {
        if (value === 1) {
          fullSymptoms[symptom] = 1;
        }
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullSymptoms)
      });

      const result = await response.json();
      setDiseaseResult(result.prediction);
      setProbability(result.probability);
      setPredictionMade(true);
    } catch (error) {
      console.error('Error fetching disease', error);
    }
  };

  const handleWellnessSubmit = async (e) => {
    e.preventDefault();

    if (!ageRange) {
      alert("Please select an age range.");
      return;
    }

    setIsLoading(true); // Show loading state

    try {
      const response = await fetch('http://localhost:5000/get_treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          predicted_disease: diseaseResult,
          age_group: ageRange,
          dosha_type: doshaType || "Generic"
        })
      });

      const result = await response.json();
      console.log("Wellness Plan Response:", result);

      // Set the wellness plan data
      setWellnessData(result);
    } catch (error) {
      console.error('Error fetching wellness plan:', error);
      alert("An error occurred while fetching the wellness plan.");
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  // Use useEffect to scroll to the result box after predictionMade becomes true
  useEffect(() => {
    if (predictionMade && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [predictionMade]);

  const triggerAnimation = () => {
    setAnimationKey(prev => prev + 1);
  };

  const handleScroll = () => {
    triggerAnimation();
    if (classifierRef.current) {
      classifierRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const currentRef = classifierRef.current;
    if (!currentRef) return;

    const observerOptions = { root: null, threshold: 0.2 };
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerAnimation();
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div className="App">
      <div className="split-container">
        <div className="bg_top">
          <img src={bg_one} alt="bg_one_img" className="bg_one" />
          <img src={bg_two} alt="bg_two_img" className="bg_two" />
        </div>
        <div className="full-flex">
          <div className="description-container">
            <h2>Let's Discover Your Disease and Wellness Plan!</h2>
            <form>
              <div className="form-group">
                <label htmlFor="description"></label>
                <p> Unlock personalized Ayurvedic insights for your health journey<br /></p>
                <img src={search} alt="Illustrasion of woman" className="search" />
              </div>
              <div className="button-and-icon">
                <button type="button" className="desc-btn" onClick={handleScroll}>
                  Get Started
                </button>
                <div className="arrow_btn">
                  <img src={arrow_right} alt="Arrow" className="arrow_right" onClick={handleScroll} />
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="bg_bottom">
          <img src={bg_three} alt="bg_three_img" className="bg_three" />
          <img src={bg_four} alt="bg_four_img" className="bg_four" />
        </div>
        <div className="tree_container">
          <img src={tree_big} alt="img_tree" className="tree_big" />
          <img src={tree_small} alt="img_tree_2" className="tree_small" />
          <img src={tree_bottom} alt="img_tree_3" className="tree_bottom" />
        </div>
        <div id="classifier-container" className="classifier-container" ref={classifierRef}>
          <h1>Let's Discover Your Disease !</h1>
          <form onSubmit={handleSubmit} className="classifier-form">
            <div className="form-group-two">
              <div key={animationKey} className="form-part-one animate">
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Symptoms:</label>
                <div className="symptom-buttons-container">
                  {symptomsList.map((symptom, index) => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => handleSymptomClick(symptom)}
                      className={`symptom-btn ${selectedSymptoms[symptom] ? 'selected' : ''} ${
                        index >= symptomsList.length - 2 ? 'last-two-buttons' : ''
                      }`}
                    >
                      {symptom.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button type="submit" className="dosha-btn">Predict Disease</button>
          </form>
        </div>
      </div>
      {predictionMade && (
        <div className="result" ref={resultRef}>
          <h2>Predicted Disease:</h2>
          <p>{diseaseResult}</p>
          <h2>Probability:</h2>
          <p>{(probability * 100).toFixed(2)}%</p>

          {/* Wellness Plan Button */}
          <button
            type="button"
            className="wellness-btn"
            onClick={() => {
              setShowWellnessForm(true);
              if (wellnessFormRef.current) {
                wellnessFormRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Wellness Plan
          </button>
        </div>
      )}
      {showWellnessForm && (
        <div className="wellness-form" ref={wellnessFormRef}>
          <h2>Get Your Wellness Plan</h2>
          <form onSubmit={handleWellnessSubmit}>
            <div className="form-group-two">
              <div className="form-part-one animate">
                {/* Age Dropdown */}
                <div>
                  <label htmlFor="ageRange">Age:</label>
                  <select
                    id="ageRange"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    required
                  >
                    <option value="">-- Select --</option>
                    <option value="0 - 16">0 - 16</option>
                    <option value="17 - 50">17 - 50</option>
                    <option value="50+">50+</option>
                  </select>
                </div>

                {/* Dosha Type Dropdown */}
                <div>
                  <label htmlFor="doshaType">Dosha Type (Optional):</label>
                  <select
                    id="doshaType"
                    value={doshaType}
                    onChange={(e) => setDoshaType(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="Vata">Vata</option>
                    <option value="Pitta">Pitta</option>
                    <option value="Kapha">Kapha</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="wellness-submit-btn" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Get Wellness Plan'}
            </button>
          </form>

          {/* Wellness Plan Boxes */}
          {wellnessData && (
  <div className="wellness-plan-boxes">
    <div className="wellness-box">
      <h3>Treatments</h3>
      <ul>
        {wellnessData.treatments ? (
          wellnessData.treatments.split('\n').map((treatment, index) => (
            <li key={index}>{treatment.trim()}</li>
          ))
        ) : (
          <li>No treatments available.</li>
        )}
      </ul>
    </div>
    <div className="wellness-box">
      <h3>Diets</h3>
      <ul>
        {wellnessData.diets ? (
          wellnessData.diets.split('\n').map((diet, index) => (
            <li key={index}>{diet.trim()}</li>
          ))
        ) : (
          <li>No diets available.</li>
        )}
      </ul>
    </div>
    <div className="wellness-box">
      <h3>Lifestyles</h3>
      <ul>
        {wellnessData.lifestyles ? (
          wellnessData.lifestyles.split('\n').map((lifestyle, index) => (
            <li key={index}>{lifestyle.trim()}</li>
          ))
        ) : (
          <li>No lifestyles available.</li>
        )}
      </ul>
    </div>
  </div>
)}
        </div>
      )}
    </div>
  );
}

export default App;