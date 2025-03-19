from flask import Flask, jsonify, request, send_file, url_for, Blueprint
import joblib
import pandas as pd
import matplotlib.pyplot as plt
import io
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from config import MODEL_DIR
import config
tourism_bp = Blueprint('tourism', __name__)
# Load the trained XGBoost model
xgb_model = joblib.load(os.path.join(config.MODEL_DIR, "final_xgboost_model.pkl"))

# Ensure static directory exists
os.makedirs(os.path.join(os.path.dirname(__file__), 'static'), exist_ok=True)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Create static directory if it doesn't exist
if not os.path.exists("static"):
    os.makedirs("static")


@app.route('/')
def home():
    return "Welcome to the Ayurveda Tourism Prediction API!"


def forecast_tourists(initial_data, forecast_horizon):
    """
    Generate tourism predictions for a given forecast horizon.
    """
    df = pd.DataFrame([initial_data])  # Convert input data into DataFrame

    # Expected features in the input data
    features = ['Lag1', 'Lag2', 'Rolling_Mean_12', 'Month', 'Year']

    predictions = []

    for month in range(1, forecast_horizon + 1):
        df['Month'] = month  # Set current month

        # Dynamically update Lag1 and Lag2
        if month > 1:
            df['Lag2'] = df['Lag1']
            df['Lag1'] = predictions[-1]  # Use the last prediction

        X_new = df[features]
        prediction = float(xgb_model.predict(X_new)[0])  # Convert float32 -> float
        predictions.append(prediction)

    # Calculate additional insights
    total_predicted = sum(predictions)
    percentage_change = [0] + [
        ((predictions[i] - predictions[i - 1]) / predictions[i - 1]) * 100 if predictions[i - 1] != 0 else 0 for i in
        range(1, forecast_horizon)]
    highest_month = predictions.index(max(predictions)) + 1
    lowest_month = predictions.index(min(predictions)) + 1
    confidence_intervals = [(p * 0.9, p * 1.1) for p in predictions]

    # Prepare response data
    response_data = {
        "forecast_horizon": forecast_horizon,
        "monthly_predictions": {i + 1: round(predictions[i], 2) for i in range(forecast_horizon)},
        "total_predicted_tourists": int(total_predicted),
        "monthly_growth_percentage": {i + 1: round(percentage_change[i], 2) for i in range(forecast_horizon)},
        "peak_month": int(highest_month),
        "low_month": int(lowest_month),
        "confidence_intervals": {i + 1: {"min": round(ci[0]), "max": round(ci[1])} for i, ci in
                                 enumerate(confidence_intervals)}
    }

    return response_data, predictions, confidence_intervals


@tourism_bp.route('/predict', methods=['POST'])
def tourism_predict():
    try:
        data = request.get_json()
        forecast_horizon = data.get('forecast_horizon', 12)
        years = data.get('years', [data.get('Year', 2025)])
        year_predictions = {}

        plt.figure(figsize=(12, 6))
        for year in years:
            data["Year"] = year
            response_data, predictions, confidence_intervals = forecast_tourists(data, forecast_horizon)

            months = [f"Month {i}" for i in range(1, forecast_horizon + 1)]
            plt.plot(months, predictions, marker='o', label=f"Year {year}")
            plt.fill_between(months, [ci[0] for ci in confidence_intervals], [ci[1] for ci in confidence_intervals],
                             alpha=0.2)
            year_predictions[year] = response_data

        plt.title(f'Predicted Tourists for {", ".join(map(str, years))}')
        plt.xlabel('Month'), plt.ylabel('Tourists'), plt.legend(), plt.grid(True)
        plt.xticks(rotation=45)

        # Save plot and generate URL
        static_dir = os.path.join(os.path.dirname(__file__), 'static')
        image_path = os.path.join(static_dir, "forecast.png")
        plt.savefig(image_path), plt.close()
        image_url = url_for('static', filename='forecast.png', _external=True)

        return jsonify({
            "forecast_horizon": forecast_horizon,
            "yearly_predictions": year_predictions,
            "graph_url": image_url
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
