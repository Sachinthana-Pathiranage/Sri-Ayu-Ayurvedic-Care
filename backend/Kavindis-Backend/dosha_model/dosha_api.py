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
    "bodyFrame_Breadth": {"Thin/Narrow": 0, "Medium": 1, "Broad": 2},
    "bodyBuild_Size": {"Weaklydeveloped": 0, "Moderatelydeveloped": 1, "Welldeveloped": 2},
    "shoulder_Breadth": {"Thin/Narrow": 0, "Medium": 1, "Broad": 2},
    "chest_Breadth": {"Thin/Narrow": 0, "Medium": 1, "Broad": 2},
    "walking_style": {"Unsteady": 0, "Firm/Steady": 1, "Sharp/Accurate": 2},
    "skin_Type": {"Thin": 0, "Thick": 1},
    "sleep_Quality": {"Shallow": 0, "Sound": 1, "Deep": 2},
    "working_Quality": {"Wavering/Easilydeviated": 0, "Wellthoughtof": 1, "Sharp/Accurate/Spontaneous": 2},
    "appetite_Frequency": {"Regular": 0, "Irregular": 1},
    "working_style": {"Unsteady": 0, "Firm/Steady": 1, "Sharp/Accurate": 2}
}

# Initialize FastAPI app
app = FastAPI()

# Allow all origins, methods, and headers for development:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # or specify ["http://localhost:3000"] for your React dev server
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

    print("\n Processed Data Before Prediction:\n", input_data)  # Debugging log

    # Convert DataFrame to NumPy array
    input_array = input_data.to_numpy().astype(float)

    # Make prediction
    try:
        prediction = model.predict(input_array)[0]
        print("\n Model Raw Prediction Output:", prediction)  # Debugging log

        #  **Fix: Convert Boolean Predictions to Class Labels**
        if isinstance(prediction, bool):
            dosha_labels = {True: "Pitta", False: "Vata"}  # Adjust based on training labels
            prediction = dosha_labels.get(prediction, "Unknown")

        #  **Fix: If prediction is a number (0,1,2), map to correct Dosha**
        dosha_labels = {0: "Pitta", 1: "Vata", 2: "Kapha"}
        prediction = dosha_labels.get(prediction, "Unknown")

        return {"dosha_prediction": str(prediction)}
    except Exception as e:
        return {"error": f"Prediction error: {str(e)}"}
