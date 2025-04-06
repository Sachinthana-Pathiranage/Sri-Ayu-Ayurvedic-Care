import os

from flask import Blueprint, jsonify, request
import joblib
import pandas as pd
import numpy as np
from config import MODEL_DIR

# Initialize Blueprint
dosha_bp = Blueprint('dosha', __name__)

# Load model using centralized path
model = joblib.load(os.path.join(MODEL_DIR, "dosha_model.pkl"))

# Define expected features and mappings
expected_features = [
    "bodyFrame_Breadth", "bodyBuild_Size", "shoulder_Breadth",
    "chest_Breadth", "walking_style", "skin_Type",
    "sleep_Quality", "working_Quality", "appetite_Frequency",
    "working_style"
]

feature_mappings = {
    "bodyFrame_Breadth": {"Broad": 0, "Medium": 1, "Thin/Narrow": 2},
    "bodyBuild_Size": {"Moderatelydeveloped": 0, "Weaklydeveloped": 1, "Welldeveloped": 2},
    "shoulder_Breadth": {"Broad": 0, "Medium": 1, "Thin/Narrow": 2},
    "chest_Breadth": {"Broad": 0, "Medium": 1, "Thin/Narrow": 2},
    "walking_style": {"Firm/Steady": 0, "Sharp/Accurate": 1, "Unsteady": 2},
    "skin_Type": {"Thick": 0, "Thin": 1},
    "sleep_Quality": {"Deep": 0, "Shallow": 1, "Sound": 2},
    "working_Quality": {"Sharp/Accurate/Spontaneous": 0, "Wavering/Easilydeviated": 1, "Wellthoughtof": 2},
    "appetite_Frequency": {"Irregular": 0, "Regular": 1},
    "working_style": {"Firm/Steady": 0, "Sharp/Accurate": 1, "Unsteady": 2}
}

@dosha_bp.route('/predict', methods=['POST'])
def predict_dosha():
    try:
        features = request.get_json()
        print("\nIncoming Request Data:", features)  # Debugging log

        # Convert input to DataFrame
        input_data = pd.DataFrame([features])

        # Map categorical values to numeric
        for feature in expected_features:
            if feature in input_data.columns:
                input_data[feature] = input_data[feature].map(feature_mappings[feature])

        # Check for missing values
        missing = input_data.isnull().sum().to_dict()
        if any(missing.values()):
            return jsonify({
                "error": "Missing/invalid input values",
                "missing_values": missing
            }), 400

        # Prepare input array
        input_array = input_data[expected_features].to_numpy().astype(float)

        # Make prediction
        prediction = model.predict(input_array)[0]
        dosha_labels = {0: "Kapha", 1: "Pitta", 2: "Vata"}
        result = dosha_labels.get(prediction, "Unknown")

        return jsonify({"dosha_prediction": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 400