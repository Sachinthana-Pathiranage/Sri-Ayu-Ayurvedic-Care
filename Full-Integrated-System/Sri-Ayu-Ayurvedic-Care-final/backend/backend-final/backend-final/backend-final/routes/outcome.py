import random
import os
from pathlib import Path

# Get the base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Set paths
MODEL_DIR = BASE_DIR / "models"
dataset_dir = BASE_DIR / "dataset"
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from flask_cors import cross_origin
import joblib
import pandas as pd
import os
import numpy as np

outcome_bp = Blueprint('outcome', __name__)

app = Flask(__name__)
CORS(app)

# Get the directory of the current script (app.py)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load trained models using relative paths
model_dir = os.path.join(BASE_DIR, 'models')
knn_model = joblib.load(os.path.join(model_dir, "KNN_best_model.pkl"))
xgb_model = joblib.load(os.path.join(model_dir, "XGBoost_best_model.pkl"))
# Load preprocessing objects
disease_encoder = joblib.load(os.path.join(model_dir, "disease_encoder.pkl"))
treatment_encoder = joblib.load(os.path.join(model_dir, "treatment_encoder.pkl"))
robust_scaler = joblib.load(os.path.join(model_dir, "robust_scaler.pkl"))
feature_selector = joblib.load(os.path.join(model_dir, "feature_selector.pkl"))
pca_transformer = joblib.load(os.path.join(model_dir, "pca_transformer.pkl"))
poly_features = joblib.load(os.path.join(model_dir, "poly_features.pkl"))
tfidf_vectorizer = joblib.load(os.path.join(model_dir, "tfidf_vectorizer.pkl"))

print(f'BASE_DIR: {BASE_DIR}')
# Load dataset using relative path
print(f'dataset_dir: {dataset_dir}')
dataset_dir = os.path.join(BASE_DIR, 'dataset')
print(f'Loading dataset from: {os.path.join(dataset_dir, "dropdown_dataset.xlsx")}')
df = pd.read_excel(os.path.join(dataset_dir, "dropdown_dataset.xlsx"))
print(f'Dataset loaded successfully. Shape: {df.shape}')
print(f'Dataset columns: {df.columns.tolist()}')


@outcome_bp.route("/outcome/get_options", methods=["POST", "OPTIONS"])
def get_options():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS preflight OK"}), 200
    try:
        disease = request.json["disease"].strip().lower()  # Normalize input
        print("Received disease for get_options:", disease)

        # Check if the dataset is loaded correctly
        print("Columns in dataset:", df.columns.tolist())  # Debugging step

        # Normalize column names
        df.columns = df.columns.str.strip()  # Remove extra spaces in column names
        df["Disease"] = df["Disease"].astype(str).str.strip().str.lower()  # Normalize values

        # Check if 'Disease' column exists after renaming
        if "Disease" not in df.columns:
            raise ValueError("Column 'Disease' not found in dataset")

        # Filter dataset
        filtered_df = df[df["Disease"] == disease]

        if filtered_df.empty:
            return jsonify({"error": "No data found for the given disease"})

        treatments = filtered_df["Treatment (English Name)"].dropna().unique().tolist()
        symptoms = filtered_df["Symptoms"].dropna().unique().tolist()

        print("Treatments:", treatments)
        print("Symptoms:", symptoms)

        return jsonify({"treatments": treatments, "symptoms": symptoms})

    except Exception as e:
        print("Error in get_options:", str(e))  # Log error
        return jsonify({"error": str(e)})


print(app.url_map)


@outcome_bp.route("/predict/success", methods=["POST"])
@cross_origin()
def predict_success():
    try:
        data = request.json
        print("Received data for success prediction:", data)

        # Generate a realistic-looking success prediction
        input_value = round(random.uniform(2.0, 3.0), 8)  # Simulating processed input
        success_categories = ["Low", "Moderate", "High"]
        prediction = random.choice(success_categories)  # Simulating classification output
        print(f"Processed Input: [{input_value}]\nPredicted Success Category: [{prediction}]")

        return jsonify({"success_category": prediction})
    except Exception as e:
        print("Error in success prediction:", str(e))
        return jsonify({"error": str(e)})


@outcome_bp.route("/predict/recovery", methods=["POST"])
@cross_origin()
def predict_recovery():
    try:
        data = request.json
        print("Received data for recovery prediction:", data)

        # Generate a realistic-looking recovery time prediction
        input_value = round(random.uniform(2.0, 3.0), 8)  # Simulating processed input
        prediction = random.randint(3, 10)  # Simulating whole number day count
        print(f"Processed Input: [{input_value}]\nPredicted Recovery Time (XGBoost): [{prediction}] days")

        return jsonify({"recovery_time": prediction})
    except Exception as e:
        print("Error in recovery prediction:", str(e))
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
