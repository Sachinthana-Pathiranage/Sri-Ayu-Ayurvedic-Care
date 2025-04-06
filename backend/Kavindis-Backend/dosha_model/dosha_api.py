from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd

# Load model, scaler, and label encoder
print("Loading model, scaler, and encoders...")
model = joblib.load("dosha_model.pkl")
scaler = joblib.load("scaler.pkl")
target_encoder = joblib.load("label_encoder.pkl")  # used to decode prediction to original label

# Define the expected features
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

# Feature mappings
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

# Dosha decoding map
dosha_label_map = {
    "0": "Kapha",
    "1": "Pitta",
    "2": "Vata"
}

# FastAPI app
app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/ping")
def ping():
    return {"message": "Server running"}

# Prediction route
@app.post("/predict")
async def predict_dosha(features: dict):
    print("\n Received Request!")
    print("Raw input:", features)

    try:
        # Step 1: Convert to DataFrame
        df = pd.DataFrame([features])
        print("Step 1: Converting to DataFrame")

        # Step 2: Apply feature mappings
        for feature in expected_features:
            if feature not in df.columns:
                return {"error": f"Missing feature: {feature}"}
            mapping = feature_mappings[feature]
            df[feature] = df[feature].map(mapping)

        # Step 3: Check for NaN due to invalid input
        if df.isnull().any().any():
            return {
                "error": "Some values could not be mapped. Check for typos or invalid values.",
                "mapped_data": df.to_dict()
            }

        print("Mapped Features:\n", df)

        # Step 4: Scale
        scaled_input = scaler.transform(df[expected_features])
        print("Scaled Input:", scaled_input)

        # Step 5: Predict
        prediction_numeric = model.predict(scaled_input)[0]
        prediction_str = str(prediction_numeric)
        prediction_label = dosha_label_map.get(prediction_str, "Unknown")

        print("Prediction:", prediction_numeric, "->", prediction_label)

        return {
            "dosha_name": prediction_label
        }

    except Exception as e:
        print("ERROR during prediction:", str(e))
        return {"error": f"Internal server error: {str(e)}"}
