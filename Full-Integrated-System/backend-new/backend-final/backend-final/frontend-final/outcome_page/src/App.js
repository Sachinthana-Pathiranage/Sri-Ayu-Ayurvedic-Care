import React from 'react';
import PredictionForm from './components/PredictionForm';
import './App.css';
import logo from './components/ayurveda-logo.svg';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="Ayurveda Logo" />
        <h1 className="App-title">
          Sri Āyu - Ayurvedic Treatment Outcome Prediction
        </h1>
        <p className="App-subtitle">
          Harness the power of Ayurveda for personalized health predictions.
        </p>
      </header>
      <div className="form-container">
        <PredictionForm />
      </div>
    </div>
  );
}

export default App;