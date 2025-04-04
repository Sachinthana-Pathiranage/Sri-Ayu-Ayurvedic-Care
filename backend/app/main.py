from flask import Flask, jsonify, request, send_file, url_for
import joblib
import pandas as pd
import matplotlib.pyplot as plt
import io
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load the trained XGBoost model
xgb_model = joblib.load(r'C:\Users\nabee\PycharmProjects\backend-sri-ayu\backend\app\model\final_xgboost_model.pkl')

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

@app.route('/latest-data', methods=['GET'])
def get_latest_data():
    # Fetch the latest data from your source (e.g., database or static data)
    latest_data = {
        'Lag1': 850,  # Example value, replace with actual data fetching logic
        'Lag2': 900,  # Example value, replace with actual data fetching logic
        'Rolling_Mean_12': 1000  # Example value, replace with actual data fetching logic
    }
    return jsonify(latest_data)


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Check if 'forecast_horizon' is provided, otherwise default to 12 months
        forecast_horizon = data.get('forecast_horizon', 12)  # Default to 12 months

        # Allow comparison across multiple years
        years = sorted(data.get('years', [data.get('Year', 2025)]))  # Default to single-year prediction
        year_predictions = {}

         # Create a figure for all years

        rolling_values = []
        lag1 = data.get('Lag1', None)  # Initialize lag1 from input or set to None
        lag2 = data.get('Lag2', None)  # Initialize lag2 from input or set to None

        for year in years:
            data["Year"] = year  # Update input data with selected year
            # Set Lag1 and Lag2 if they exist from the previous year
            if lag1 is not None:
                data["Lag1"] = lag1
            if lag2 is not None:
                data["Lag2"] = lag2

                # Update Rolling_Mean_12 if we have enough previous data
            if len(rolling_values) >= 12:
                data["Rolling_Mean_12"] = sum(rolling_values[-12:]) / 12
            response_data, predictions, confidence_intervals = forecast_tourists(data, forecast_horizon)

            lag1 = predictions[-1]  # Last month's prediction becomes Lag1 for the next year
            lag2 = predictions[-2] if len(predictions) > 1 else lag1  # Second last month as Lag2

            rolling_values.extend(predictions)

            months = [f"Month {i}" for i in range(1, forecast_horizon + 1)]
            plt.plot(months, predictions, marker='o', linestyle='-', label=f"Year {year}")
            plt.fill_between(months, [ci[0] for ci in confidence_intervals], [ci[1] for ci in confidence_intervals],
                             alpha=0.2)

            year_predictions[year] = response_data  # Store data for each year

        # Graph customization
        plt.title('Predicted Ayurveda Tourists for {", ".join(map(str, years))}')
        plt.xlabel('Month')
        plt.ylabel('Predicted Ayurveda Tourists')
        plt.legend()
        plt.xticks(rotation=45)
        plt.grid(True)
        plt.figure(figsize=(12, 6))

        # Save the plot as a static file
        image_path = "static/forecast.png"
        plt.savefig(image_path, format='png')
        plt.close()  # Close figure to free memory

        # Get the file URL
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
