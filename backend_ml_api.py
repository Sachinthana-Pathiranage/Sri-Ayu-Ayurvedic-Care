from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import numpy as np
import pandas as pd
import joblib
import sqlite3
from typing import List, Dict

# Initialize FastAPI app
app = FastAPI()

# Load trained ML model (Assuming a .pkl file exists)
MODEL_PATH = "model.pkl"
ml_model = joblib.load(MODEL_PATH)

# Database connection setup
def get_db_connection():
    conn = sqlite3.connect("treatments.db")
    conn.row_factory = sqlite3.Row
    return conn

# Define input data schema
class UserInput(BaseModel):
    symptoms: List[str]
    demographics: Dict[str, str]
    preferred_treatment: str

# Preprocessing function
def preprocess_input(input_data: UserInput):
    symptoms_encoded = [hash(symptom) % 1000 for symptom in input_data.symptoms]
    demo_df = pd.DataFrame([input_data.demographics])
    demo_encoded = demo_df.select_dtypes(include=[np.number]).values.flatten()
    features = np.concatenate([symptoms_encoded, demo_encoded])
    return features.reshape(1, -1)

@app.post("/predict")
def predict_treatment(input_data: UserInput, db=Depends(get_db_connection)):
    try:
        processed_data = preprocess_input(input_data)
        prediction_prob = ml_model.predict_proba(processed_data)[0]
        success_rate = prediction_prob[1]
        response = {"success_rate": round(success_rate * 100, 2)}
        
        if success_rate > 0.7:
            response["status"] = "High Success Rate"
        else:
            response["status"] = "Low Success Rate, Consider Alternatives"
            cursor = db.cursor()
            cursor.execute("SELECT name FROM treatments WHERE category = ?", (input_data.preferred_treatment,))
            alternatives = [row["name"] for row in cursor.fetchall()]
            response["alternative_treatments"] = alternatives if alternatives else ["Option A", "Option B"]
        
        response["estimated_recovery_time"] = "2-4 weeks"
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def home():
    return {"message": "ML Prediction API is running"}
