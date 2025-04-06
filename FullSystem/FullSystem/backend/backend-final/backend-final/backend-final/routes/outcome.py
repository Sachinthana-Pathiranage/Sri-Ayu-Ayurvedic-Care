import random
import os
import traceback
from pathlib import Path
import re
import math
# Change paths to point to models and dataset folders inside routes directory
MODEL_DIR = Path(__file__).resolve().parent / "models"
dataset_dir = Path(__file__).resolve().parent / "dataset"
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from flask_cors import cross_origin
import joblib
import pandas as pd
import numpy as np

outcome_bp = Blueprint('outcome', __name__)

app = Flask(__name__)
CORS(app)

# Get the directory of the current script (app.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load trained models using relative paths
try:
    # Load necessary mappings saved during training
    severity_map = joblib.load(os.path.join(MODEL_DIR, 'severity_map.pkl')) # Optional, only if needed directly
    success_map = joblib.load(os.path.join(MODEL_DIR, 'success_map.pkl'))   # Optional
    REVERSE_SUCCESS_MAPPING = joblib.load(os.path.join(MODEL_DIR, 'reverse_success_map.pkl'))
    print("Mappings loaded successfully.")
except Exception as e:
    print(f"WARNING: Could not load mappings from {MODEL_DIR}. Using hardcoded fallbacks. Error: {e}")
    # Hardcoded fallbacks if loading fails
    SEVERITY_MAPPING = {"Mild": 0, "Moderate": 1, "Severe": 2} # Fallback
    SUCCESS_MAPPING = {"Low": 0, "Medium": 1, "High": 2}       # Fallback
    REVERSE_SUCCESS_MAPPING = {v: k for k, v in SUCCESS_MAPPING.items()} # Fallback

# --- Flask App Setup ---
CORS(outcome_bp)  # Apply CORS to the blueprint instead


# --- Load Final Pipelines & Dropdown Data ---
try:
    # Load the COMPLETE fitted pipelines
    clf_pipeline_path = os.path.join(MODEL_DIR, 'final_classification_pipeline.pkl')
    reg_pipeline_path = os.path.join(MODEL_DIR, 'final_regression_pipeline.pkl')
    loaded_clf_pipeline = joblib.load(clf_pipeline_path)
    loaded_reg_pipeline = joblib.load(reg_pipeline_path)
    print(f"Loaded Classification Pipeline from: {clf_pipeline_path}")
    print(f"Loaded Regression Pipeline from: {reg_pipeline_path}")

    # Load dataset for dropdowns
    dataset_dir = os.path.join(BASE_DIR, 'dataset') 
    df_dropdown = pd.read_excel(os.path.join(dataset_dir, "dropdown_dataset.xlsx"))
    # Normalize dropdown dataset columns immediately
    df_dropdown.columns = df_dropdown.columns.str.strip().str.replace(r'[()]+', '', regex=True) # Use same cleaning as training
    if 'Treatment English Name' not in df_dropdown.columns:
         print(f"Warning: 'Treatment English Name' column potentially missing in dropdown dataset. Found: {df_dropdown.columns.tolist()}")
    if "Disease" in df_dropdown.columns:
         df_dropdown["Disease"] = df_dropdown["Disease"].astype(str).str.strip().str.lower()
    else:
        print("Warning: 'Disease' column not found in dropdown dataset.")
    print("Dropdown dataset loaded and processed.")

except FileNotFoundError as e:
    print(f"FATAL ERROR: Could not load model pipeline or dataset: {e}")
    print(f"Ensure 'final_classification_pipeline.pkl', 'final_regression_pipeline.pkl' are in '{model_dir}'")
    print(f"Ensure 'dropdown_dataset.xlsx' is in '{dataset_dir}'")
    exit()
except Exception as e:
    print(f"FATAL ERROR during model/dataset loading: {e}")
    print(traceback.format_exc())
    exit()


# --- Helper Functions ---

# Text Cleaning Function (Mirror Training Script)
def clean_text(text):
    if pd.isna(text) or not isinstance(text, str): return ""
    text = str(text).lower()
    text = re.sub(r'[^\w\s-]', '', text) # Keep hyphens
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Format Recovery Time Function (Keep as before)
def format_recovery_range(predicted_days_float):
    """Converts a float prediction of days into a user-friendly string range."""
    if predicted_days_float <= 0: return "Immediate / < 1 day"
    elif predicted_days_float <= 1.0: return "About 1 day"
    else:
        lower_bound = math.floor(predicted_days_float); upper_bound = math.ceil(predicted_days_float)
        lower_bound = max(1, lower_bound); upper_bound = max(lower_bound, upper_bound)
        return f"{lower_bound} days" if lower_bound == upper_bound else f"{lower_bound}-{upper_bound} days"

# --- API Endpoints ---

@outcome_bp.route("/get_options", methods=["POST", "OPTIONS"])
def get_options():
    # (This endpoint remains largely the same as your last version, using df_dropdown)
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        return response, 200

    if request.method == "POST":
        try:
            if not request.is_json: return jsonify({"error": "Request must be JSON"}), 400
            data = request.get_json(); disease = data.get("disease")
            if not disease: return jsonify({"error": "Missing 'disease' parameter"}), 400

            disease = disease.strip().lower()
            print(f"Received disease for get_options: '{disease}'")

            if df_dropdown is None or "Disease" not in df_dropdown.columns:
                 return jsonify({"error": "Server configuration error loading dropdown data."}), 500

            filtered_df = df_dropdown[df_dropdown["Disease"] == disease]
            if filtered_df.empty: return jsonify({"treatments": [], "symptoms": []})

            treatment_col = "Treatment English Name" # Check if this name is correct in your excel file
            symptoms_col = "Symptoms"
            if treatment_col not in filtered_df.columns or symptoms_col not in filtered_df.columns:
                 return jsonify({"error": f"Server configuration error: Missing '{treatment_col}' or '{symptoms_col}'."}), 500

            treatments = filtered_df[treatment_col].dropna().unique().tolist()
            symptoms = filtered_df[symptoms_col].dropna().unique().tolist()
            print(f"Found {len(treatments)} treatments and {len(symptoms)} symptoms for '{disease}'")
            return jsonify({"treatments": treatments, "symptoms": symptoms})

        except Exception as e:
            print(f"Error in get_options: {str(e)}\n{traceback.format_exc()}")
            return jsonify({"error": "An internal server error occurred."}), 500
    else:
        return jsonify({"error": "Method Not Allowed"}), 405


@outcome_bp.route("/predict/success", methods=["POST", "OPTIONS"])
def predict_success():
    if request.method == "OPTIONS": # Handle CORS preflight
        response = jsonify({"message": "CORS preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        return response, 200

    if request.method == 'POST':
        try:
            if not request.is_json: return jsonify({"error": "Request must be JSON"}), 400
            data = request.get_json()
            print("Received data for success prediction:", data)

            # --- Input Validation ---
            required_fields = ["symptoms", "treatment", "severity", "disease"]
            if not all(field in data for field in required_fields):
                missing = [field for field in required_fields if field not in data]
                return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
            # Log raw symptoms input
            print(f"Raw symptoms input: {data['symptoms']} (type: {type(data['symptoms'])})")
            
            # Convert symptoms to list if needed
            if not isinstance(data["symptoms"], list):
                if isinstance(data["symptoms"], str):
                    data["symptoms"] = [s.strip() for s in data["symptoms"].split(",")]
                    print(f"Converted symptoms string to list: {data['symptoms']}")
                else:
                    return jsonify({
                        "error": "Symptoms must be a list or comma-separated string",
                        "example": ["fever", "headache"]
                    }), 400
            # Validate severity value
            if data["severity"] not in ['Mild', 'Moderate', 'Severe']: # Use keys from training
                 return jsonify({"error": f"Invalid severity value: {data['severity']}."}), 400
            # Basic type checks
            if not isinstance(data["treatment"], str) or not isinstance(data["disease"], str):
                 return jsonify({"error": "Treatment and disease must be strings."}), 400

            # --- Prepare Input DataFrame for the Pipeline ---
            # 1. Clean and Join Symptoms
            symptom_list = data["symptoms"]
            cleaned_symptom_list = [clean_text(s) for s in symptom_list if clean_text(s)] # Clean individually first
            symptoms_cleaned_joined = " ".join(cleaned_symptom_list) # Join with space
            print(f"Cleaned & Joined Symptoms for Pipeline: '{symptoms_cleaned_joined}'")

            # 2. Create DataFrame with columns expected by the pipeline's fit method
            #    Use ORIGINAL column names used when defining features for pipeline input
            input_data = {
                'Severity': data["severity"], # Use original name for OrdinalEncoder
                'Disease_Cleaned': data["disease"].strip().lower(), # Use cleaned name for OHE
                'Treatment_Cleaned': data["treatment"].strip(), # Use cleaned name for OHE
                'Symptoms_Cleaned': symptoms_cleaned_joined, # Use cleaned/joined string for TF-IDF
                'Recovery_Time_Feat': np.nan # Placeholder for this feature, imputer will handle
            }
            input_df = pd.DataFrame([input_data])
            print(f"Input DataFrame shape for prediction: {input_df.shape}")
            # print(f"Input DataFrame head:\n{input_df.head().to_string()}") # Optional: Debug input df

            # --- Prediction using loaded pipeline ---
            prediction_code = loaded_clf_pipeline.predict(input_df)[0]
            prediction_label = REVERSE_SUCCESS_MAPPING.get(prediction_code, "Unknown") # Map code to label

            print(f"Success Prediction Output Code: {prediction_code}, Label: {prediction_label}")
            return jsonify({"success_category": prediction_label})

        except ValueError as ve:
             print(f"Value Error during success prediction: {str(ve)}\n{traceback.format_exc()}")
             return jsonify({"error": f"Prediction input error: {str(ve)}"}), 400
        except Exception as e:
            print(f"Error in success prediction: {str(e)}\n{traceback.format_exc()}")
            return jsonify({"error": "An internal server error occurred during success prediction."}), 500
    else:
         return jsonify({"error": "Method Not Allowed"}), 405


@outcome_bp.route("/predict/recovery", methods=["POST", "OPTIONS"])
def predict_recovery():
    if request.method == "OPTIONS": # Handle CORS preflight
        response = jsonify({"message": "CORS preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        return response, 200

    if request.method == 'POST':
        try:
            if not request.is_json: return jsonify({"error": "Request must be JSON"}), 400
            data = request.get_json()
            print("Received data for recovery prediction:", data)

            # --- Input Validation ---
            required_fields = ["symptoms", "treatment", "severity", "disease"]
            if not all(field in data for field in required_fields):
                missing = [field for field in required_fields if field not in data]
                return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400
            # Log raw symptoms input
            print(f"Raw symptoms input: {data['symptoms']} (type: {type(data['symptoms'])})")
            
            # Convert symptoms to list if needed
            if not isinstance(data["symptoms"], list):
                if isinstance(data["symptoms"], str):
                    data["symptoms"] = [s.strip() for s in data["symptoms"].split(",")]
                    print(f"Converted symptoms string to list: {data['symptoms']}")
                else:
                    return jsonify({
                        "error": "Symptoms must be a list or comma-separated string",
                        "example": ["fever", "headache"]
                    }), 400
            if data["severity"] not in ['Mild', 'Moderate', 'Severe']:
                 return jsonify({"error": f"Invalid severity value: {data['severity']}."}), 400
            if not isinstance(data["treatment"], str) or not isinstance(data["disease"], str):
                 return jsonify({"error": "Treatment and disease must be strings."}), 400

            # --- Prepare Input DataFrame for the Pipeline ---
            # 1. Clean and Join Symptoms
            symptom_list = data["symptoms"]
            cleaned_symptom_list = [clean_text(s) for s in symptom_list if clean_text(s)]
            symptoms_cleaned_joined = " ".join(cleaned_symptom_list)
            print(f"Cleaned & Joined Symptoms for Pipeline: '{symptoms_cleaned_joined}'")

            # 2. Create DataFrame with columns expected by the pipeline's fit method
            #    Use ORIGINAL column names used when defining features for pipeline input
            input_data = {
                'Severity': data["severity"], # Original name for OrdinalEncoder
                'Disease_Cleaned': data["disease"].strip().lower(), # Cleaned name for OHE
                'Treatment_Cleaned': data["treatment"].strip(), # Cleaned name for OHE
                'Symptoms_Cleaned': symptoms_cleaned_joined # Cleaned/joined string for TF-IDF
            }
            input_df = pd.DataFrame([input_data])
            print(f"Input DataFrame shape for prediction: {input_df.shape}")

            # --- Prediction using loaded pipeline ---
            prediction_float = loaded_reg_pipeline.predict(input_df)[0]
            prediction_float = max(0.0, float(prediction_float)) # Ensure non-negative

            # --- Format Prediction into Range ---
            prediction_range_str = format_recovery_range(prediction_float)
            print(f"Recovery Prediction Float: {prediction_float:.2f}, Formatted Range: {prediction_range_str}")
            return jsonify({"recovery_time_range": prediction_range_str})

        except ValueError as ve:
             print(f"Value Error during recovery prediction: {str(ve)}\n{traceback.format_exc()}")
             return jsonify({"error": f"Prediction input error: {str(ve)}"}), 400
        except Exception as e:
            print(f"Error in recovery prediction: {str(e)}\n{traceback.format_exc()}")
            return jsonify({"error": "An internal server error occurred during recovery prediction."}), 500
    else:
         return jsonify({"error": "Method Not Allowed"}), 405


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
