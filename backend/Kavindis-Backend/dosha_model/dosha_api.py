from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import numpy as np

# Load the trained KNN model
model = joblib.load("dosha_model.pkl")

# Define expected features
expected_features = [
    "bodyFrame_Breadth", "bodyBuild_Size", "shoulder_Breadth",
    "chest_Breadth", "walking_style", "skin_Type",
    "sleep_Quality", "working_Quality", "appetite_Frequency",
    "working_style"
]

# Feature-specific categorical mappings
feature_mappings = {

        "bodyFrame_Breadth": {
            "Broad": 0,
            "Medium": 1,
            "Thin/Narrow": 2
        },
        "bodyBuild_Size": {
            "Moderatelydeveloped": 0,
            "Weaklydeveloped": 1,
            "Welldeveloped": 2
        },
        "shoulder_Breadth": {
            "Broad": 0,
            "Medium": 1,
            "Thin/Narrow": 2
        },
        "chest_Breadth": {
            "Broad": 0,
            "Medium": 1,
            "Thin/Narrow": 2
        },
        "walking_style": {
            "Firm/Steady": 0,
            "Sharp/Accurate": 1,
            "Unsteady": 2
        },
        "skin_Type": {
            "Thick": 0,
            "Thin": 1
        },
        "sleep_Quality": {
            "Deep": 0,
            "Shallow": 1,
            "Sound": 2
        },
        "working_Quality": {
            "Sharp/Accurate/Spontaneous": 0,
            "Wavering/Easilydeviated": 1,
            "Wellthoughtof": 2
        },
        "appetite_Frequency": {
            "Irregular": 0,
            "Regular": 1
        },
        "working_style": {
            "Firm/Steady": 0,
            "Sharp/Accurate": 1,
            "Unsteady": 2
        }
    }


# Initialize FastAPI app
app = FastAPI()

# Allow all origins, methods, and headers for development:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict_dosha(features: dict):
    print("\n Incoming Request Data:", features)  # Debugging log

    # Convert input dictionary to DataFrame
    input_data = pd.DataFrame([features])

    # Convert categorical values to numeric using feature-wise mappings
    for feature in expected_features:
        if feature in input_data.columns:
            input_data[feature] = input_data[feature].map(feature_mappings[feature])

    # **Check for Missing Values (NaN)**
    missing_values = input_data.isnull().sum().to_dict()
    if any(missing_values.values()):
        print("\n Missing Values Detected:", missing_values)  # Debugging log
        return {
            "error": "Some input values could not be mapped. Check your input values.",
            "missing_values": missing_values
        }
    input_data = input_data[expected_features]
    print("\n Processed Data Before Prediction:\n", input_data)  # Debugging log

    # Convert DataFrame to NumPy array
    input_array = input_data.to_numpy().astype(float)

    # Make prediction
    try:
        prediction = model.predict(input_array)[0]
        print("\n Model Raw Prediction Output:", prediction)  # Debugging log

        # Convert prediction to the correct Dosha label
        dosha_labels = {0: "Kapha", 1: "Pitta", 2: "Vata"}
        prediction = dosha_labels.get(prediction, "Unknown")

        return {"dosha_prediction": str(prediction)}
    except Exception as e:
        return {"error": f"Prediction error: {str(e)}"}