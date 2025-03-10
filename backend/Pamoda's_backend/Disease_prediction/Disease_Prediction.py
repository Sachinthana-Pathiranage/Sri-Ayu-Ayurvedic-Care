import os

from flask import Flask, request, jsonify
import joblib
import pandas as pd

# Initialize Flask
from flask_cors import CORS
from db_utils import get_treatments, get_diets, get_lifestyles
app = Flask(__name__)
CORS(app)

# Get the directory where the script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the model, scaler, label encoder, and PCA using absolute paths
model_path = os.path.join(BASE_DIR, 'tuned_random_forest_model (1).pkl')
scaler_path = os.path.join(BASE_DIR, 'scaler (1).pkl')
label_encoder_path = os.path.join(BASE_DIR, 'label_encoder (1).pkl')
pca_optimal_path = os.path.join(BASE_DIR, 'pca_model (1).pkl')

# Load the models
model = joblib.load(model_path)
scaler = joblib.load(scaler_path)
label_encoder = joblib.load(label_encoder_path)
pca_optimal = joblib.load(pca_optimal_path)

# Define feature names (ensure they match the dataset columns)
feature_names = [
    'shivers', 'acidity', 'tiredness', 'weight_loss', 'lethargy', 'cough',
    'high_fever', 'digestive_issues', 'headache', 'stomach_ache', 'vomiting',
    'loss_of_appetite', 'gnawing', 'upper_stomach_pain', 'burning_ache',
    'swelled_lymph_nodes', 'blurry_eyesight', 'phlegm',
    'sinus_pressure', 'chest_pain', 'dizziness', 'overweight',
    'weak_muscles', 'irritability', 'frequent_urination', 'vision_changes'
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get JSON data from the request
        input_data = request.json
        print("Received user input:", input_data)  # Debugging line

        # Fill missing symptom fields with default value 0
        for feature in feature_names:
            if feature not in input_data:
                input_data[feature] = 0

        # Validate input data
        if not all(feature in input_data for feature in feature_names):
            return jsonify({"error": "Input data is missing one or more required features."}), 400

        # Extract age_group and dosha_type
        age_range = input_data.get('age_group')
        dosha_type = input_data.get('dosha_type')

        # Debugging: Print the extracted values
        print(f"Received age_group: {age_range}")
        print(f"Received dosha_type: {dosha_type}")

        if not age_range or not dosha_type:
            return jsonify({"error": "age_group is a required fields."}), 400

        # Default to "Generic" if dosha_type is not provided
        if not dosha_type:
            dosha_type = "Generic"

        # Convert input data into a DataFrame
        input_df = pd.DataFrame([input_data], columns=feature_names)

        # Extract only symptom-related fields for the check
        symptom_values = [input_data[feature] for feature in feature_names]

        # When all symptoms are zero
        if all(value == 0 for value in symptom_values):
            return jsonify({
                "prediction": "No Disease",
                "probability": 1.0,
                "treatments": [],
                "diets": [],
                "lifestyles": []
            }), 200  

        # Scale the input features
        input_scaled = scaler.transform(input_df)

        # Apply PCA transformation
        input_pca = pca_optimal.transform(input_scaled)

        # Make predictions
        prediction = model.predict(input_pca)
        probability = model.predict_proba(input_pca).max()

        # Decode the prediction
        predicted_disease = label_encoder.inverse_transform(prediction)[0]

        # Fetch treatments from the database
        treatments = get_treatments(predicted_disease, age_range, dosha_type)
        diets = get_diets(predicted_disease, age_range, dosha_type)
        lifestyles = get_lifestyles(predicted_disease, age_range, dosha_type)

        # Prepare the response
        response = {
            "prediction": predicted_disease,
            "probability": float(probability),
            "treatments": treatments,
            "diets": diets,
            "lifestyles": lifestyles
        }
        print(f"Backend Response: {response}")
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Run the app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)