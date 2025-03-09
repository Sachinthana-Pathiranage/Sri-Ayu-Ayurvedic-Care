import React, { useState, useRef } from 'react';
import axios from 'axios';

function App() {
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [doshaType, setDoshaType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const resultBoxRef = useRef(null);

  const symptomsList = [
    'shivers', 'acidity', 'tiredness', 'weight_loss', 'lethargy', 'cough',
    'high_fever', 'digestive_issues', 'headache', 'stomach_ache', 'vomiting',
    'loss_of_appetite', 'gnawing', 'upper_stomach_pain', 'burning_ache',
    'swelled_lymph_nodes', 'blurry_eyesight', 'phlegm',
    'sinus_pressure', 'chest_pain', 'dizziness', 'overweight',
    'weak_muscles', 'irritability', 'frequent_urination', 'vision_changes'
  ];

  const handleGetStarted = () => {
    setShowForm(true);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const ageRangeOptions = ['0 - 16', '17 - 50', '50+'];
  const doshaTypeOptions = ['Vata', 'Pitta', 'Kapha'];

  const handleSymptomClick = (symptom) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptom]: prev[symptom] ? 0 : 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!ageRange) {
      setError('Please select an age range.');
      return;
    }

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

      const payload = {
        ...fullSymptoms,
        age_group: ageRange,
        dosha_type: doshaType || "Generic"
      };

      const response = await axios.post('http://localhost:5000/predict', payload);
      setPrediction(response.data);

      setTimeout(() => {
        if (resultBoxRef.current) {
          resultBoxRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);

    } catch (err) {
      console.error('Error predicting disease:', err);
      setError('An error occurred while predicting the disease.');
    }
  };

  return (
    <div style={{
      backgroundColor: '#B8E0DA',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Welcome box */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          backgroundColor: "#58C0B6",
          padding: '40px',
          borderRadius: '15px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px',
          width: '100%',
          margin: '0 auto'
        }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
            Let's Discover Your Disease and Wellness Plan!
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'white', marginBottom: '20px'}}>
            Unlock personalized Ayurvedic insights for your health journey. 
          </p>
          <button
            onClick={handleGetStarted}
            style={{
              padding: '15px 30px',
              backgroundColor: '#246B6A',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease'
            }}       
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div 
          ref={formRef}
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            backgroundColor: '#58C0B6',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #ddd'
        }}>
          {/* Age Range Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="ageRange" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Age:</label>
            <select
              id="ageRange"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                fontSize: '1rem'
              }}
            >
              <option value="">-- Select --</option>
              {ageRangeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Dosha Type Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="doshaType" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Dosha Type (Optional):</label>
            <select
              id="doshaType"
              value={doshaType}
              onChange={(e) => setDoshaType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                fontSize: '1rem'
              }}
            >
              <option value="">-- Select --</option>
              {doshaTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Symptom Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Symptoms:</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              alignItems: 'start'
            }}>
              {symptomsList.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => handleSymptomClick(symptom)}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: selectedSymptoms[symptom] ? '#82C6C5' : '#f0f0f0',
                    color: selectedSymptoms[symptom] ? 'white' : 'black',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.3s ease',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    textAlign: 'center',
                    height: 'auto',
                  }}
                >
                  {symptom.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#246B6A',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease'
            }}
          >
            Predict Disease And Recommend Wellness Plan
          </button>

          {/* Display Error */}
          {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}
        </div>
      )}

      {/* Prediction Result Section */}
      {prediction && (
        <div 
          ref={resultBoxRef}
          style={{
            maxWidth: '800px',
            margin: '30px auto',
            backgroundColor: '#58C0B6',
            padding: '30px',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid #ddd'
          }}
        >
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>Your Results</h2>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>Disease: {prediction.prediction}</p>
          <p style={{ fontSize: '1rem', marginBottom: '20px' }}>Probability: {(prediction.probability * 100).toFixed(2)}%</p>

          {/* Treatments Section */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>Treatments:</h3>
          {prediction.treatments && prediction.treatments.length > 0 ? (
            <ul style={{ paddingLeft: '20px' }}>
              {prediction.treatments.map((treatment, index) => (
                <li key={index} style={{ fontSize: '1rem', marginBottom: '5px' }}>{treatment}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '1rem', color: '#666' }}>No treatments available for the predicted disease.</p>
          )}

          {/* Diet Recommendations Section */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', marginTop: '20px' }}>Diet Recommendations:</h3>
          {prediction.diets && prediction.diets.length > 0 ? (
            <ul style={{ paddingLeft: '20px' }}>
              {prediction.diets.map((diet, index) => (
                <li key={index} style={{ fontSize: '1rem', marginBottom: '5px' }}>{diet}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '1rem', color: '#666' }}>No diet recommendations available.</p>
          )}

          {/* Lifestyle Recommendations Section */}
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', marginTop: '20px' }}>Lifestyle Recommendations:</h3>
          {prediction.lifestyles && prediction.lifestyles.length > 0 ? (
            <ul style={{ paddingLeft: '20px' }}>
              {prediction.lifestyles.map((lifestyle, index) => (
                <li key={index} style={{ fontSize: '1rem', marginBottom: '5px' }}>{lifestyle}</li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '1rem', color: '#666' }}>No lifestyle recommendations available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;