import os
from flask import Blueprint, jsonify, request
import joblib
import pandas as pd
from config import MODEL_DIR # Absolute import (if run from project root)
from db_utils import get_treatments, get_diets, get_lifestyles

disease_bp = Blueprint('disease', __name__)

# Load models using centralized paths
model = joblib.load(os.path.join(MODEL_DIR, "tuned_random_forest_model (1).pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "scaler (1).pkl"))
label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder (1).pkl"))
pca_optimal = joblib.load(os.path.join(MODEL_DIR, "pca_model (1).pkl"))

# Define feature names (ensure they match the dataset columns)
feature_names = [
    'shivers', 'acidity', 'tiredness', 'weight_loss', 'lethargy', 'cough',
    'high_fever', 'digestive_issues', 'headache', 'stomach_ache', 'vomiting',
    'loss_of_appetite', 'gnawing', 'upper_stomach_pain', 'burning_ache',
    'swelled_lymph_nodes', 'blurry_eyesight', 'phlegm',
    'sinus_pressure', 'chest_pain', 'dizziness', 'overweight',
    'weak_muscles', 'irritability', 'frequent_urination', 'vision_changes'
]

@disease_bp.route('/predict', methods=['POST'])
def predict():
    try:
        input_data = request.json
        print("Received user input:", input_data)  # Debugging line

        # Validate input data
        if not all(feature in input_data for feature in feature_names):
            return jsonify({"error": "Input data is missing one or more required features."}), 400

            # Extract symptom values
        symptom_values = [input_data[feature] for feature in feature_names]

        # Check if all symptoms are zero (no symptoms selected)
        if all(value == 0 for value in symptom_values):
            return jsonify({
                "error": "Please select at least one symptom to proceed."
            }), 400

        input_df = pd.DataFrame([input_data], columns=feature_names)


        input_scaled = scaler.transform(input_df)
        input_pca = pca_optimal.transform(input_scaled)

        prediction = model.predict(input_pca)
        probability = model.predict_proba(input_pca).max()
        predicted_disease = label_encoder.inverse_transform(prediction)[0]

        # Prepare the response
        response = {
            "prediction": predicted_disease,
            "probability": float(probability)
        }
        print(f"Backend Response: {response}")
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@disease_bp.route('/get_treatments', methods=['POST'])
def get_treatments_route():
    try:
        input_data = request.json
        print("Received user input for treatments:", input_data)  # Debugging line

        # Extract required fields
        predicted_disease = input_data.get('predicted_disease')
        age_range = input_data.get('age_group')
        dosha_type = input_data.get('dosha_type', "Generic")  # Default to "Generic" if not provided

        # Validate input data
        if not predicted_disease or not age_range:
            return jsonify({"error": "predicted_disease and age_group are required fields."}), 400

        # Fetch treatments, diets, and lifestyles from the database
        treatments = get_treatments(predicted_disease, age_range, dosha_type)
        diets = get_diets(predicted_disease, age_range, dosha_type)
        lifestyles = get_lifestyles(predicted_disease, age_range, dosha_type)

        # Prepare the response
        response = {
            "treatments": treatments,
            "diets": diets,
            "lifestyles": lifestyles
        }
        print(f"Backend Response for treatments: {response}")
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400
