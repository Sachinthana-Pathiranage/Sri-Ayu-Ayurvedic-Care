from flask import Flask, jsonify, request, send_file
import joblib
import pandas as pd
import matplotlib.pyplot as plt
import io

# Load the trained XGBoost model
xgb_model = joblib.load(r'model/final_xgboost_model.pkl')

# Initialize Flask appacwai
app = Flask(__name__)


@app.route('/')
def home():
    return "Welcome to the Ayurveda Tourism Prediction API!"


@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from POST request
        data = request.get_json()

        # Ensure data is in list form
        if isinstance(data, dict):
            data = [data]  # If a single dictionary is passed, convert it to a list

        # Convert the data into a DataFrame
        df = pd.DataFrame(data)

        # Ensure that the data has the expected columns
        features = ['Lag1', 'Lag2', 'Rolling_Mean_12', 'Month', 'Year']
        X_new = df[features]

        # Generate predictions for 12 months (simulate monthly data, adjust as necessary)
        # This assumes the input data contains one month (adjust this part as needed)
        predictions = []
        for month in range(1, 13):  # Simulating for 12 months
            df['Month'] = month  # Set the current month for prediction
            X_new = df[features]
            predictions.append(xgb_model.predict(X_new)[0])  # Append the prediction for each month

        # Plot the predictions (e.g., over a 12-month period)
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        plt.figure(figsize=(10, 6))
        plt.plot(months, predictions, marker='o', linestyle='-', color='b')
        plt.title('Predicted Ayurveda Tourists for 2025')
        plt.xlabel('Month')
        plt.ylabel('Predicted Ayurveda Tourists')
        plt.grid(True)

        # Save the plot to a BytesIO object (in-memory)
        img = io.BytesIO()
        plt.savefig(img, format='png')
        img.seek(0)

        # Return the image as response
        return send_file(img, mimetype='image/png')

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)
