import random
from config import MODEL_DIR
from config import dataset_dir
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
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
model_dir = os.path.join(BASE_DIR, 'MODEL_DIR')
knn_model = joblib.load(os.path.join(MODEL_DIR, "KNN_best_model.pkl"))
xgb_model = joblib.load(os.path.join(MODEL_DIR, "XGBoost_best_model.pkl"))
# Load preprocessing objects
disease_encoder = joblib.load(os.path.join(MODEL_DIR, "disease_encoder.pkl"))
treatment_encoder = joblib.load(os.path.join(MODEL_DIR, "treatment_encoder.pkl"))
robust_scaler = joblib.load(os.path.join(MODEL_DIR, "robust_scaler.pkl"))
feature_selector = joblib.load(os.path.join(MODEL_DIR, "feature_selector.pkl"))
pca_transformer = joblib.load(os.path.join(MODEL_DIR, "pca_transformer.pkl"))
poly_features = joblib.load(os.path.join(MODEL_DIR, "poly_features.pkl"))
tfidf_vectorizer = joblib.load(os.path.join(MODEL_DIR, "tfidf_vectorizer.pkl"))

# Load dataset using relative path
df = pd.read_excel(os.path.join(dataset_dir, "dropdown_dataset.xlsx"))


@app.route("outcome/get_options", methods=["POST"])
def get_options():
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


@app.route("/predict/successs", methods=["POST"])
def predict_successs():
    try:
        data = request.json
        print("Received data for success prediction:", data)
        data = request.json
        print("Received data for success prediction:", data)
        input_symptoms = data["symptoms"]
        input_treatment = data["treatment"]
        input_severity = data["severity"]
        input_disease = data["disease"].strip().lower()  # Normalize disease input

        # TF-IDF symptoms
        symptoms_tfidf = tfidf_vectorizer.transform([input_symptoms]).toarray()
        symptoms_tfidf_df = pd.DataFrame(symptoms_tfidf, columns=tfidf_vectorizer.get_feature_names_out())

        # Encode disease
        disease_encoded = disease_encoder.transform([[input_disease]]).toarray()
        disease_encoded_df = pd.DataFrame(disease_encoded, columns=disease_encoder.get_feature_names_out(['Disease']))

        # Encode treatment
        treatment_encoded = treatment_encoder.transform([input_treatment])
        treatment_encoded_df = pd.DataFrame({'Treatment_Encoded': treatment_encoded})

        # Encode severity using mapping from training script
        severity_mapping = {"Mild": 0, "Moderate": 1, "Severe": 2}
        severity_encoded = severity_mapping.get(input_severity, 1)  # Default to Moderate if not found
        severity_scaled = robust_scaler.transform([[float(severity_encoded)]])
        severity_scaled_df = pd.DataFrame(severity_scaled, columns=['Severity'])

        # Combine processed features
        processed_features = pd.concat([
            symptoms_tfidf_df,
            disease_encoded_df,
            treatment_encoded_df,
            severity_scaled_df
        ], axis=1)
        print("Shape after combining features (before selection):", processed_features.shape)  # Debugging shape

        # Feature selection and PCA
        print("Shape before feature selection:", processed_features.shape)  # Debugging shape
        processed_features_selected = feature_selector.transform(processed_features)
        print("Shape after feature selection:", processed_features_selected.shape)  # Debugging shape
        processed_features_pca = pca_transformer.transform(processed_features_selected)
        print("Shape after PCA:", processed_features_pca.shape)  # Debugging shape

        prediction = knn_model.predict(processed_features_pca)
        print("Success Prediction Output:", prediction)  # Debug output

        return jsonify({"success_category": prediction[0]})
    except Exception as e:
        print("Error in success prediction:", str(e))  # Debug output
        return jsonify({"error": str(e)})


@app.route("/predict/success", methods=["POST"])
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


@app.route("/predict/recovery", methods=["POST"])
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


@app.route("/predict/recoveryy", methods=["POST"])
def predict_recoveryy():
    try:
        data = request.json
        print("Received data for recovery prediction:", data)
        input_symptoms = data["symptoms"]
        input_treatment = data["treatment"]
        input_severity = data["severity"]
        input_disease = data["disease"].strip().lower()  # Normalize disease input

        # TF-IDF symptoms
        symptoms_tfidf = tfidf_vectorizer.transform([input_symptoms]).toarray()
        symptoms_tfidf_df = pd.DataFrame(symptoms_tfidf, columns=tfidf_vectorizer.get_feature_names_out())

        # Encode disease
        disease_encoded = disease_encoder.transform([[input_disease]]).toarray()
        disease_encoded_df = pd.DataFrame(disease_encoded, columns=disease_encoder.get_feature_names_out(['Disease']))

        # Encode treatment
        treatment_encoded = treatment_encoder.transform([input_treatment])
        treatment_encoded_df = pd.DataFrame({'Treatment_Encoded': treatment_encoded})

        # Encode severity using mapping from training script
        severity_mapping = {"Mild": 0, "Moderate": 1, "Severe": 2}
        severity_encoded = severity_mapping.get(input_severity, 1)  # Default to Moderate if not found
        severity_scaled = robust_scaler.transform([[float(severity_encoded)]])
        severity_scaled_df = pd.DataFrame(severity_scaled, columns=['Severity'])

        # Combine processed features
        processed_features = pd.concat([
            symptoms_tfidf_df,
            disease_encoded_df,
            treatment_encoded_df,
            severity_scaled_df
        ], axis=1)
        print("Shape after combining features (before scaling):", processed_features.shape)  # Debugging shape
        print("Shape before scaling:", processed_features.shape)  # Debugging shape

        # Scale numerical features
        print("Shape before feature selection:", processed_features.shape)  # Debugging shape

        # Feature selection and PCA
        print("Shape after combining features (before pca):", processed_features.shape)  # Debugging shape
        processed_features_selected = feature_selector.transform(processed_features)
        print("Shape after feature selection:", processed_features_selected.shape)  # Debugging shape
        processed_features_pca = pca_transformer.transform(processed_features_selected)
        print("Shape after PCA:", processed_features_pca.shape)  # Debugging shape

        prediction = xgb_model.predict(processed_features_pca)
        print("Recovery Prediction Output:", prediction)  # Debug output

        return jsonify({"recovery_time": float(prediction[0])})
    except Exception as e:
        print("Error in recovery prediction:", str(e))  # Debug output
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
