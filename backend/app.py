import os
import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback # For better error logging
import math # For floor and ceil

# --- Configuration ---
# Define mappings used during training
SEVERITY_MAPPING = {"Mild": 0, "Moderate": 1, "Severe": 2}
SUCCESS_MAPPING = {"Low": 0, "Medium": 1, "High": 2}
REVERSE_SUCCESS_MAPPING = {v: k for k, v in SUCCESS_MAPPING.items()}

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)

# --- Load Models and Preprocessing Objects ---
try:
    # Get the directory of the current script (app.py)
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    model_dir = os.path.join(BASE_DIR, 'models') # Assuming new objects are saved here
    dataset_dir = os.path.join(BASE_DIR, 'dataset')

    # --- Load Objects from NEW Pipeline ---
    # Encoders/Vectorizer
    treatment_encoder = joblib.load(os.path.join(model_dir, 'treatment_encoder.pkl'))
    disease_encoder = joblib.load(os.path.join(model_dir, 'disease_encoder.pkl'))
    tfidf_vectorizer = joblib.load(os.path.join(model_dir, 'tfidf_vectorizer.pkl'))

    # Classification Pipeline Components
    clf_imputer = joblib.load(os.path.join(model_dir, 'clf_numeric_imputer.pkl'))
    clf_scaler = joblib.load(os.path.join(model_dir, 'clf_scaler.pkl'))
    clf_selector = joblib.load(os.path.join(model_dir, 'clf_feature_selector.pkl'))
    clf_pca = joblib.load(os.path.join(model_dir, 'clf_pca.pkl'))

    # Regression Pipeline Components
    reg_imputer = joblib.load(os.path.join(model_dir, 'reg_numeric_imputer.pkl'))
    reg_scaler = joblib.load(os.path.join(model_dir, 'reg_scaler.pkl'))
    reg_selector = joblib.load(os.path.join(model_dir, 'reg_feature_selector.pkl'))
    reg_pca = joblib.load(os.path.join(model_dir, 'reg_pca.pkl'))

    # Best Models (Update filenames based on your actual best models)
    # Find the exact filenames saved previously
    best_clf_filename = "best_classifier_Gradient Boosting.pkl" # CHECK FILENAME
    best_reg_filename = "best_regressor_Gradient Boosting Regressor.pkl" # CHECK FILENAME
    loaded_clf_model = joblib.load(os.path.join(model_dir, best_clf_filename))
    loaded_reg_model = joblib.load(os.path.join(model_dir, best_reg_filename))

    print("Models and preprocessing objects loaded successfully.")

    # Load dataset for dropdowns
    df_dropdown = pd.read_excel(os.path.join(dataset_dir, "dropdown_dataset.xlsx")) # Or your original dataset if it's the same
    # Normalize dropdown dataset columns immediately
    df_dropdown.columns = df_dropdown.columns.str.strip()
    if "Disease" in df_dropdown.columns:
         df_dropdown["Disease"] = df_dropdown["Disease"].astype(str).str.strip().str.lower()
    else:
        print("Warning: 'Disease' column not found in dropdown dataset.")


except FileNotFoundError as e:
    print(f"FATAL ERROR: Could not load model or object: {e}")
    print("Ensure all .pkl files from the new pipeline training are in the 'models' directory.")
    print(f"Looking in: {model_dir}")
    # Optionally exit or raise a more specific error for deployment
    exit() # Stop the app if essential files are missing
except Exception as e:
    print(f"FATAL ERROR during model/object loading: {e}")
    print(traceback.format_exc())
    exit()

# --- Helper Function: Preprocessing New Data ---
# (Adapted from the inference test script)
def preprocess_new_data_for_flask(new_data_df, recovery_time_for_clf=np.nan):
    """
    Applies the exact preprocessing steps used during training to new data.
    Expects a DataFrame with columns: 'Severity', 'Treatment (English Name)', 'Symptoms', 'Disease'
    """
    processed_df = pd.DataFrame(index=new_data_df.index)

    # 1. Clean/Extract basic features
    processed_df['Severity_Encoded'] = new_data_df['Severity'].map(SEVERITY_MAPPING)
    processed_df['Symptoms_Cleaned'] = new_data_df['Symptoms'].astype(str).str.strip()
    processed_df['Symptom_Length'] = processed_df['Symptoms_Cleaned'].apply(lambda x: len(x.split()) if pd.notna(x) else 0)
    processed_df['Treatment_English_Cleaned'] = new_data_df['Treatment (English Name)'].astype(str).str.strip()
    processed_df['Disease_Cleaned'] = new_data_df['Disease'].astype(str).str.strip().str.lower() # Ensure lowercase for disease

    # 2. Encoders
    processed_df["Treatment_Encoded"] = processed_df['Treatment_English_Cleaned'].apply(
        lambda x: treatment_encoder.transform([x])[0] if x in treatment_encoder.classes_ else -1 # Assign -1 for unknown
    )
    if (processed_df["Treatment_Encoded"] == -1).any():
        unknown_treatments = processed_df.loc[processed_df["Treatment_Encoded"] == -1, 'Treatment_English_Cleaned'].unique()
        print(f"Warning: Inference encountered new treatment label(s): {list(unknown_treatments)}. Handled as -1.")

    try:
        # Use the correct input feature name as used during fit ('Disease_Cleaned')
        disease_encoded_new = disease_encoder.transform(processed_df[["Disease_Cleaned"]])
        disease_encoded_new_df = pd.DataFrame(disease_encoded_new, columns=disease_encoder.get_feature_names_out(["Disease_Cleaned"]), index=processed_df.index)
    except Exception as e:
         print(f"Error during Disease OneHotEncoding transform: {e}. Check encoder settings/input.")
         # Fallback: create df with expected columns and zeros if transform fails
         expected_ohe_cols = disease_encoder.get_feature_names_out(["Disease_Cleaned"])
         disease_encoded_new_df = pd.DataFrame(0, index=processed_df.index, columns=expected_ohe_cols)


    # 3. TF-IDF
    symptom_tfidf_new = tfidf_vectorizer.transform(processed_df["Symptoms_Cleaned"])
    symptom_tfidf_new_df = pd.DataFrame(symptom_tfidf_new.toarray(), columns=tfidf_vectorizer.get_feature_names_out(), index=processed_df.index)

    # 4. Combine Base Features
    features_to_keep_new = ["Severity_Encoded", "Treatment_Encoded", "Symptom_Length"]
    final_features_new_base = processed_df[features_to_keep_new]
    final_features_new_combined = pd.concat([final_features_new_base, disease_encoded_new_df, symptom_tfidf_new_df], axis=1)

    # Add recovery time feature for classification pipeline
    final_features_new_combined['Recovery_Time_Processed_Feat'] = recovery_time_for_clf

    # 5. Align columns EXACTLY as expected by the *imputers* and apply full pipeline
    # --- Classification Pipeline ---
    try:
        clf_expected_features = clf_imputer.feature_names_in_
        final_features_new_class_aligned = final_features_new_combined.reindex(columns=clf_expected_features, fill_value=0)
        imputed_class = clf_imputer.transform(final_features_new_class_aligned)
        scaled_class = clf_scaler.transform(imputed_class)
        selected_class = clf_selector.transform(scaled_class)
        pca_class = clf_pca.transform(selected_class)
    except Exception as e:
        print("ERROR in Classification preprocessing pipeline:")
        print(f"Shape passed to imputer: {final_features_new_class_aligned.shape if 'final_features_new_class_aligned' in locals() else 'N/A'}")
        print(f"Expected features by imputer: {clf_expected_features if 'clf_expected_features' in locals() else 'N/A'}")
        print(traceback.format_exc())
        raise ValueError("Classification preprocessing failed") # Re-raise to signal error

    # --- Regression Pipeline ---
    try:
        reg_expected_features = reg_imputer.feature_names_in_
        # Drop recovery time feature *before* aligning for regression
        final_features_new_reg_temp = final_features_new_combined.drop(columns=['Recovery_Time_Processed_Feat'], errors='ignore')
        final_features_new_reg_aligned = final_features_new_reg_temp.reindex(columns=reg_expected_features, fill_value=0)
        imputed_reg = reg_imputer.transform(final_features_new_reg_aligned)
        scaled_reg = reg_scaler.transform(imputed_reg)
        selected_reg = reg_selector.transform(scaled_reg)
        pca_reg = reg_pca.transform(selected_reg)
    except Exception as e:
        print("ERROR in Regression preprocessing pipeline:")
        print(f"Shape passed to imputer: {final_features_new_reg_aligned.shape if 'final_features_new_reg_aligned' in locals() else 'N/A'}")
        print(f"Expected features by imputer: {reg_expected_features if 'reg_expected_features' in locals() else 'N/A'}")
        print(traceback.format_exc())
        raise ValueError("Regression preprocessing failed") # Re-raise to signal error


    return pca_class, pca_reg # Return processed features for both models

# --- Helper Function: Format Recovery Time to Range ---
def format_recovery_range(predicted_days_float):
    """Converts a float prediction of days into a user-friendly string range."""
    if predicted_days_float <= 0:
        return "Immediate / < 1 day" # Handle non-positive predictions
    elif predicted_days_float <= 1.0:
         # For predictions <= 1, make it simpler
         return "About 1 day"
    else:
        # Use floor and ceil for predictions > 1
        lower_bound = math.floor(predicted_days_float)
        upper_bound = math.ceil(predicted_days_float)

        # Ensure lower bound is at least 1
        lower_bound = max(1, lower_bound)
        # Ensure upper bound is at least the lower bound
        upper_bound = max(lower_bound, upper_bound)

        if lower_bound == upper_bound:
            return f"{lower_bound} days"
        else:
            # Prevent ranges like "6-6" if floor/ceil are the same after checks
            if lower_bound == upper_bound:
                 return f"{lower_bound} days"
            else:
                 return f"{lower_bound}-{upper_bound} days"

# --- API Endpoints ---

@app.route("/outcome/get_options", methods=["POST", "OPTIONS"])
def get_options():
    if request.method == "OPTIONS":
        # Handle CORS preflight request
        response = jsonify({"message": "CORS preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

    if request.method == "POST":
        try:
            if not request.is_json:
                return jsonify({"error": "Request must be JSON"}), 400

            data = request.get_json()
            disease = data.get("disease")

            if not disease:
                return jsonify({"error": "Missing 'disease' parameter"}), 400

            disease = disease.strip().lower()  # Normalize input
            print(f"Received disease for get_options: '{disease}'")

            # Check if dropdown dataframe is loaded and has 'Disease' column
            if df_dropdown is None or "Disease" not in df_dropdown.columns:
                 print("Error: Dropdown dataset not loaded correctly or 'Disease' column missing.")
                 return jsonify({"error": "Server configuration error loading dropdown data."}), 500

            # Filter dataset (already normalized)
            filtered_df = df_dropdown[df_dropdown["Disease"] == disease]

            if filtered_df.empty:
                print(f"No data found for disease: '{disease}'")
                # Return empty lists instead of error maybe?
                return jsonify({"treatments": [], "symptoms": []}) # More user-friendly

            # Ensure correct column names are used
            treatment_col = "Treatment (English Name)"
            symptoms_col = "Symptoms"

            if treatment_col not in filtered_df.columns or symptoms_col not in filtered_df.columns:
                print("Error: Expected columns not found in filtered dropdown data.")
                return jsonify({"error": "Server configuration error: Column names mismatch."}), 500

            treatments = filtered_df[treatment_col].dropna().unique().tolist()
            symptoms = filtered_df[symptoms_col].dropna().unique().tolist()

            print(f"Found {len(treatments)} treatments and {len(symptoms)} symptoms for '{disease}'")

            return jsonify({"treatments": treatments, "symptoms": symptoms})

        except Exception as e:
            print(f"Error in get_options: {str(e)}")
            print(traceback.format_exc()) # Log full traceback
            return jsonify({"error": "An internal server error occurred."}), 500
    else:
        return jsonify({"error": "Method Not Allowed"}), 405


@app.route("/outcome/predict/success", methods=["POST", "OPTIONS"])
def predict_success():
    if request.method == "OPTIONS": # Handle CORS preflight
        response = jsonify({"message": "CORS preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

    if request.method == 'POST':
        try:
            if not request.is_json:
                return jsonify({"error": "Request must be JSON"}), 400

            data = request.get_json()
            print("Received data for success prediction:", data)

            # --- Input Validation ---
            required_fields = ["symptoms", "treatment", "severity", "disease"]
            if not all(field in data for field in required_fields):
                missing = [field for field in required_fields if field not in data]
                return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

            # Basic type/value checks (can be expanded)
            if data["severity"] not in SEVERITY_MAPPING:
                 return jsonify({"error": f"Invalid severity value: {data['severity']}. Expected one of {list(SEVERITY_MAPPING.keys())}"}), 400
            if not isinstance(data["symptoms"], str) or not isinstance(data["treatment"], str) or not isinstance(data["disease"], str):
                 return jsonify({"error": "Symptoms, treatment, and disease must be strings."}), 400


            # --- Prepare Input DataFrame ---
            input_df = pd.DataFrame([{
                'Severity': data["severity"],
                'Treatment (English Name)': data["treatment"],
                'Symptoms': data["symptoms"],
                'Disease': data["disease"] # Preprocessing function handles normalization
            }])

            # --- Preprocess Data using the Central Function ---
            # Pass np.nan for recovery_time_for_clf, let imputer handle it
            processed_features_clf, _ = preprocess_new_data_for_flask(input_df, recovery_time_for_clf=np.nan)
            print(f"Shape after CLF preprocessing: {processed_features_clf.shape}") # Debug shape

            # --- Prediction ---
            prediction_code = loaded_clf_model.predict(processed_features_clf)[0]
            prediction_label = REVERSE_SUCCESS_MAPPING.get(prediction_code, "Unknown") # Map code to label

            print(f"Success Prediction Output Code: {prediction_code}, Label: {prediction_label}")

            return jsonify({"success_category": prediction_label}) # Return the readable label

        except ValueError as ve: # Catch specific preprocessing errors
             print(f"Value Error during success prediction: {str(ve)}")
             print(traceback.format_exc())
             return jsonify({"error": f"Prediction error: {str(ve)}"}), 400 # Return specific error if safe
        except Exception as e:
            print(f"Error in success prediction: {str(e)}")
            print(traceback.format_exc()) # Log full traceback
            return jsonify({"error": "An internal server error occurred during success prediction."}), 500
    else:
         return jsonify({"error": "Method Not Allowed"}), 405


@app.route("/outcome/predict/recovery", methods=["POST", "OPTIONS"])
def predict_recovery():
    if request.method == "OPTIONS": # Handle CORS preflight
        response = jsonify({"message": "CORS preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        return response, 200

    if request.method == 'POST':
        try:
            if not request.is_json:
                return jsonify({"error": "Request must be JSON"}), 400

            data = request.get_json()
            print("Received data for recovery prediction:", data)

             # --- Input Validation ---
            required_fields = ["symptoms", "treatment", "severity", "disease"]
            if not all(field in data for field in required_fields):
                missing = [field for field in required_fields if field not in data]
                return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

            if data["severity"] not in SEVERITY_MAPPING:
                 return jsonify({"error": f"Invalid severity value: {data['severity']}. Expected one of {list(SEVERITY_MAPPING.keys())}"}), 400
            if not isinstance(data["symptoms"], str) or not isinstance(data["treatment"], str) or not isinstance(data["disease"], str):
                 return jsonify({"error": "Symptoms, treatment, and disease must be strings."}), 400

            # --- Prepare Input DataFrame ---
            input_df = pd.DataFrame([{
                'Severity': data["severity"],
                'Treatment (English Name)': data["treatment"],
                'Symptoms': data["symptoms"],
                'Disease': data["disease"] # Preprocessing function handles normalization
            }])

            # --- Preprocess Data using the Central Function ---
            # We only need the regression features output here
            _, processed_features_reg = preprocess_new_data_for_flask(input_df)
            print(f"Shape after REG preprocessing: {processed_features_reg.shape}") # Debug shape

            # --- Prediction ---
            prediction_float = loaded_reg_model.predict(processed_features_reg)[0]
            # Ensure prediction is non-negative float before formatting
            prediction_float = max(0.0, float(prediction_float))

            # --- Format Prediction into Range --- ### MODIFICATION HERE ###
            prediction_range_str = format_recovery_range(prediction_float)
            print(f"Recovery Prediction Float: {prediction_float:.2f}, Formatted Range: {prediction_range_str}")

            # Return the formatted string range ### MODIFICATION HERE ###
            return jsonify({"recovery_time_range": prediction_range_str})

        except ValueError as ve: # Catch specific preprocessing errors
             print(f"Value Error during recovery prediction: {str(ve)}")
             print(traceback.format_exc())
             return jsonify({"error": f"Prediction error: {str(ve)}"}), 400 # Return specific error if safe
        except Exception as e:
            print(f"Error in recovery prediction: {str(e)}")
            print(traceback.format_exc()) # Log full traceback
            return jsonify({"error": "An internal server error occurred during recovery prediction."}), 500
    else:
         return jsonify({"error": "Method Not Allowed"}), 405

# --- Run App ---
if __name__ == "__main__":
    # Set host='0.0.0.0' to make it accessible on your network
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)