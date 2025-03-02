import React, { useState, useEffect } from 'react';
import { FaUserMd, FaHeartbeat, FaClock, FaListAlt } from 'react-icons/fa';

const TreatmentOutcome = ({ predictedDisease }) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(predictedDisease || '');
  const [results, setResults] = useState(null);

  // Mock data
  const symptomsList = [
    'Fatigue', 'Digestive Issues', 'Skin Problems',
    'Insomnia', 'Joint Pain', 'Anxiety', 'Headaches',
    'Low Immunity', 'Weight Fluctuations', 'Hormonal Imbalance'
  ];

  const diseasesList = [
    'Arthritis', 'Diabetes', 'Hypertension',
    'Respiratory Disorders', 'Skin Diseases', 'Digestive Disorders'
  ];

  const mockPrediction = {
    successProbability: 35,
    alternativeTreatments: ['Panchakarma', 'Herbal Steam Therapy', 'Medicated Oil Massage'],
    recoveryTime: '6-8 weeks',
    recommendedDiet: 'Warm cooked foods, Ginger tea, Avoid raw vegetables'
  };

  useEffect(() => {
    if (predictedDisease) {
      setSelectedDisease(predictedDisease);
    }
  }, [predictedDisease]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock API call to backend ML model
    setResults(mockPrediction);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <FaUserMd size={32} color="#115e59" />
        <h2 style={styles.heading}>Ayurvedic Treatment Outcome Predictor</h2>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            <FaHeartbeat style={styles.icon} /> Select Symptoms
          </label>
          <select
            multiple
            style={styles.multiSelect}
            value={selectedSymptoms}
            onChange={(e) => setSelectedSymptoms([...e.target.selectedOptions].map(o => o.value))}
            required
          >
            {symptomsList.map((symptom, index) => (
              <option key={index} value={symptom}>{symptom}</option>
            ))}
          </select>
          <small style={styles.hint}>(Hold Ctrl/Cmd to select multiple)</small>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            <FaListAlt style={styles.icon} /> Select Disease
          </label>
          <select
            style={styles.select}
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            required
            disabled={!!predictedDisease} // Disable if disease is predicted
          >
            <option value="">Select a disease</option>
            {diseasesList.map((disease, index) => (
              <option key={index} value={disease}>{disease}</option>
            ))}
          </select>
        </div>

        <button type="submit" style={styles.button}>Predict Treatment Outcome</button>
      </form>

      {results && (
        <div style={styles.resultsContainer}>
          <h3 style={styles.subHeading}><FaClock style={styles.icon} /> Prediction Results</h3>
          <div style={styles.resultGrid}>
            <div style={styles.resultCard}>
              <div style={styles.cardHeader}>Success Probability</div>
              <div style={styles.probabilityBox}>{results.successProbability}%</div>
            </div>
            <div style={styles.resultCard}>
              <div style={styles.cardHeader}>Estimated Recovery</div>
              <div style={styles.timeBox}>{results.recoveryTime}</div>
            </div>
          </div>

          {results.successProbability < 50 && (
            <div style={styles.resultSection}>
              <p style={{ color: '#e63946', fontWeight: 'bold' }}>
                Probability is low. Try another treatment option or click below to predict better treatments.
              </p>
              <button
                style={styles.button}
                onClick={() => window.location.href = '/treatment-prediction'}
              >
                Find Better Treatment
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = { /* Styles remain unchanged */ };

export default TreatmentOutcome;
