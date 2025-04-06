import React, { useState } from 'react';
import axios from 'axios';

const InputForm = ({ onPredict }) => {
  const [symptoms, setSymptoms] = useState('');
  const [demographics, setDemographics] = useState('');
  const [treatment, setTreatment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      symptoms,
      demographics,
      treatment
    };
    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', data);
      onPredict(response.data);
    } catch (error) {
      console.error('Error making prediction:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Symptoms:</label>
        <input type="text" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required />
      </div>
      <div>
        <label>Demographics:</label>
        <input type="text" value={demographics} onChange={(e) => setDemographics(e.target.value)} required />
      </div>
      <div>
        <label>Preferred Treatment:</label>
        <input type="text" value={treatment} onChange={(e) => setTreatment(e.target.value)} required />
      </div>
      <button type="submit">Predict</button>
    </form>
  );
};

export default InputForm;
