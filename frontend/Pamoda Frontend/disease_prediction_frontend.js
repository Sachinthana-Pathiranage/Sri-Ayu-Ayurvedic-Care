import React, { useState, useRef } from 'react';
import axios from 'axios';

function App() {
  // State to manage selected symptoms
  const [selectedSymptoms, setSelectedSymptoms] = useState({});
  // State to store prediction result
  const [prediction, setPrediction] = useState(null);
  // State to handle errors
  const [error, setError] = useState('');
  // State for age range and dosha type
  const [ageRange, setAgeRange] = useState(''); // Default empty
  const [doshaType, setDoshaType] = useState(''); // Default empty

  // Ref to reference the result box
  const resultBoxRef = useRef(null);

  // List of all possible symptoms
  const symptomsList = [
    'acidity', 'weight_loss', 'cough',
    'high_fever', 'digestive_issues', 'headache', 'stomach_ache', 'vomiting',
    'upper_stomach_pain', 'burning_ache',
    'blurry_eyesight', 'phlegm',
    'sinus_pressure',
    'irritability', 'frequent_urination', 'vision_changes'
  ];

  // Options for age range dropdown
  const ageRangeOptions = ['0 - 16', '17 - 50', '50+'];

  // Options for dosha type dropdown
  const doshaTypeOptions = ['Vata', 'Pitta', 'Kapha'];

  // Function to handle symptom selection
  const handleSymptomClick = (symptom) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptom]: prev[symptom] ? 0 : 1 // Toggle between 0 and 1
    }));
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // Validate age range
    if (!ageRange) {
      setError('Please select an age range.');
      return;
    }

    try {
      // Create an object with all symptoms initialized to 0
      const fullSymptoms = symptomsList.reduce((acc, symptom) => {
        acc[symptom] = 0; // Initialize all symptoms to 0
        return acc;
      }, {});

      // Update the selected symptoms to 1
      for (const [symptom, value] of Object.entries(selectedSymptoms)) {
        if (value === 1) {
          fullSymptoms[symptom] = 1; // Set selected symptoms to 1
        }
      }

      // Add age_range and dosha_type to the payload
      const payload = {
        ...fullSymptoms,
        age_group: ageRange,
        dosha_type: doshaType || "Generic"
      };

      // Send POST request to Flask backend with all symptoms, age range, and dosha type
      const response = await axios.post('http://localhost:5000/predict', payload);
      console.log('Backend Response:', response.data); // Debugging line

      // Update state with prediction
      setPrediction(response.data);

      // Scroll to the result box after prediction
      setTimeout(() => {
        if (resultBoxRef.current) {
          console.log('Scrolling to result box:', resultBoxRef.current); // Debugging line
          resultBoxRef.current.scrollIntoView({ behavior: 'smooth' });
        } else {
          console.error('Result box ref is null or undefined.'); // Debugging line
        }
      }, 0); // Use setTimeout to ensure DOM updates after state change

    } catch (err) {
      console.error('Error predicting disease:', err);
      setError('An error occurred while predicting the disease.');
    }
  };

  return (
    <div style={{
      backgroundColor: '#B8E0DA', // Set the background color of the entire page
      minHeight: '100vh', // Ensure the background covers the full height of the viewport
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Header Section */}
      <header style={{
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Let’s Discover Your Disease and Wellness Plan!</h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>Unlock personalized Ayurvedic insights!</p>
      </header>

      {/* Form Section */}
      <div style={{
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
            gridTemplateColumns: 'repeat(2, 1fr)', // Two equal-width columns
            gap: '10px', // Consistent spacing between buttons
            alignItems: 'start' // Align items at the top of each row
          }}>
            {symptomsList.map((symptom, index) => (
              <button
                key={symptom}
                onClick={() => handleSymptomClick(symptom)}
                style={{
                  padding: '10px 15px', // Consistent padding
                  backgroundColor: selectedSymptoms[symptom] ? '#82C6C5' : '#f0f0f0',
                  color: selectedSymptoms[symptom] ? 'white' : 'black',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.9rem', // Consistent font size
                  transition: 'background-color 0.3s ease',
                  whiteSpace: 'normal', // Allow text to wrap if necessary
                  wordBreak: 'break-word', // Break long words to prevent overflow
                  textAlign: 'center', // Center-align text
                  height: 'auto', // Ensure buttons adjust height dynamically
                }}
              >
                {symptom.replace(/_/g, ' ')} {/* Replace underscores with spaces */}
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

      {/* Prediction Result Section */}
      {prediction && (
        <div 
          ref={resultBoxRef} // Attach the ref here
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
        </div>
      )}
    </div>
  );
}

export default App;