import os
import joblib
import pandas as pd
from flask import Blueprint, request, jsonify
from config import MODEL_DIR

# Initialize Blueprint
dosha_bp = Blueprint('dosha', __name__)

# Load model, scaler, and label encoder
model = joblib.load(os.path.join(MODEL_DIR, "dosha_model.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "dosha_scaler.pkl"))
target_encoder = joblib.load(os.path.join(MODEL_DIR, "dosha_label_encoder.pkl"))

# Expected features (must match top 10 used in training)
expected_features = [
    "bodyFrame_Breadth",
    "shoulder_Breadth",
    "chest_Breadth",
    "bodyBuild_Size",
    "weight_Changes",
    "walking_style",
    "working_Quality",
    "sleep_Quality",
    "retaining_quality",
    "working_style"
]

# Mapping dictionaries
feature_mappings = {
    "bodyFrame_Breadth": {"Broad": 0, "Medium": 1, "Thin/Narrow": 2},
    "shoulder_Breadth": {"Broad": 0, "Medium": 1, "Thin/Narrow": 2},
    "chest_Breadth": {"Broad": 0, "Medium": 1, "Thin/Narrow": 2},
    "bodyBuild_Size": {"Moderatelydeveloped": 0, "Weaklydeveloped": 1, "Welldeveloped": 2},
    "weight_Changes": {
        "Difficultyingaining": 0,
        "Gainandloseeasily": 1,
        "Gaineasilyandlosewithdifficulty": 2,
        "Stable": 3
    },
    "walking_style": {"Firm/Steady": 0, "Sharp/Accurate": 1, "Unsteady": 2},
    "working_Quality": {
        "Sharp/Accurate/Spontaneous": 0,
        "Wavering/Easilydeviated": 1,
        "Wellthoughtof": 2
    },
    "sleep_Quality": {"Deep": 0, "Shallow": 1, "Sound": 2},
    "retaining_quality": {"Good": 0, "Medium": 1, "Poor": 2},
    "working_style": {"Firm/Steady": 0, "Sharp/Accurate": 1, "Unsteady": 2}
}

# API route
@dosha_bp.route('/predict', methods=['POST'])
def predict_dosha():
    try:
        features = request.get_json()
        print("📥 Received:", features)

        # Convert to DataFrame
        df = pd.DataFrame([features])

        # Mapping
        for feature in expected_features:
            if feature not in df.columns:
                return jsonify({"error": f"Missing feature: {feature}"}), 400
            value = df[feature].iloc[0]
            if value not in feature_mappings[feature]:
                return jsonify({
                    "error": f"Invalid value for {feature}",
                    "valid_values": list(feature_mappings[feature].keys())
                }), 400
            df[feature] = df[feature].map(feature_mappings[feature])

        # Check for NaNs
        if df.isnull().any().any():
            return jsonify({
                "error": "Mapping error",
                "mapped_data": df.to_dict()
            }), 400

        # Scale and Predict
        scaled = scaler.transform(df[expected_features])
        prediction = model.predict(scaled)[0]
        dosha_map = {0: "Kapha", 1: "Pitta", 2: "Vata"}
        decoded_label = dosha_map[int(prediction)]

        return jsonify({ "dosha_name": decoded_label })


    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
