import React from 'react';

const PredictionResult = ({ prediction }) => {
  if (!prediction) {
    return <div>No prediction available.</div>;
  }

  const { successRate, alternativeOptions, recoveryTimeline } = prediction;

  return (
    <div>
      <h2>Prediction Result</h2>
      {successRate ? (
        <div>
          <p>Treatment Success Rate: {successRate}%</p>
          <p>Estimated Recovery Timeline: {recoveryTimeline} days</p>
        </div>
      ) : (
        <div>
          <p>The predicted success rate is low. Consider the following alternative options:</p>
          <ul>
            {alternativeOptions.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
          <p>Estimated Recovery Timeline: {recoveryTimeline} days</p>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;
