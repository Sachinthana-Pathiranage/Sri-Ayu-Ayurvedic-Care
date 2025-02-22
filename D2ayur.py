import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# ======================
# AYURVEDIC CONFIGURATION
# ======================
ayurvedic_conditions = {
    "Amavata": {  # Rheumatoid Arthritis
        "dosha": ["Vata", "Vata-Kapha"],
        "symptoms": ["Joint_Pain", "Swelling", "Agnimandya"],
        "treatments": ["Abhyanga (oil massage)", "Dashamoola Decoction", "Yoga"],
        "recovery_weeks": (12, 16)
    },
    "Pandu": {  # Anemia
        "dosha": ["Pitta"],
        "symptoms": ["Ama", "Nausea", "Dhatu_Imbalance"],
        "treatments": ["Triphala Churna", "Iron-rich Diet", "Punarnavadi Mandoor"],
        "recovery_weeks": (8, 12)
    },
    "Atisara": {  # Diarrhea
        "dosha": ["Vata", "Pitta"],
        "symptoms": ["Stomach_Pain", "Nausea", "Agnimandya"],
        "treatments": ["Kutaja Ghan Vati", "Ginger Decoction", "Light Diet"],
        "recovery_weeks": (4, 6)
    },
    "Kasa": {  # Cough
        "dosha": ["Kapha"],
        "symptoms": ["Coughing", "Wheezing", "Shortness_of_Breath"],
        "treatments": ["Sitopaladi Churna", "Tulsi Syrup", "Steam Therapy"],
        "recovery_weeks": (4, 8)
    }
}

doshas = ["Vata", "Pitta", "Kapha", "Vata-Pitta", "Vata-Kapha", "Pitta-Kapha"]

# ======================
# CORE FUNCTIONS
# ======================
def assign_condition_and_dosha():
    condition = random.choice(list(ayurvedic_conditions.keys()))
    allowed_doshas = ayurvedic_conditions[condition]["dosha"]
    return condition, random.choice(allowed_doshas)

def generate_symptoms(condition, dosha):
    mandatory_symptoms = ayurvedic_conditions[condition]["symptoms"]
    symptoms = {s: 0 for s in [
        "Joint_Pain", "Swelling", "Headache", "Nausea", "Stomach_Pain",
        "Acid_Reflux", "Shortness_of_Breath", "Wheezing", "Coughing",
        "Agnimandya", "Ama", "Dhatu_Imbalance", "Nidra_Dosha"
    ]}
    
    # Mandatory symptoms
    for s in mandatory_symptoms:
        symptoms[s] = 1
    
    # Dosha-specific probabilities
    if "Vata" in dosha:
        symptoms["Nidra_Dosha"] = random.choices([0, 1], weights=[4, 6])[0]
        symptoms["Headache"] = random.choices([0, 1], weights=[3, 7])[0]
    if "Pitta" in dosha:
        symptoms["Acid_Reflux"] = random.choices([0, 1], weights=[2, 8])[0]
    if "Kapha" in dosha:
        symptoms["Wheezing"] = random.choices([0, 1], weights=[1, 9])[0]
    
    return symptoms

def generate_diagnosis_date():
    start_date = datetime.now() - timedelta(days=730)  # 2 years back
    random_days = random.randint(0, 730)
    return (start_date + timedelta(days=random_days)).strftime("%Y-%m-%d")

def calculate_outcome(age, severity, adherence):
    base_score = 3 - (severity // 2)
    if adherence == "High": return min(3, base_score + 1)
    if adherence == "Medium": return base_score
    return max(0, base_score - 1)

    # Outcome calculations
    outcome = calculate_outcome(age, symptom_severity, adherence)
    avg_recovery = treatment_duration + random.randint(-2, 2)
    predicted_recovery = avg_recovery + random.randint(-1, 1)
    
    # Additional fields
    prakriti = dosha.split("-")[0]
    diet_advice = {
        "Vata": "Warm, oily foods",
        "Pitta": "Cooling, bitter foods",
        "Kapha": "Light, spicy foods"
    }[prakriti]
    
    data.append([
        pid, age, gender, generate_diagnosis_date(), dosha, condition,
        symptom_severity, adherence,
        symptoms["Joint_Pain"], symptoms["Swelling"], symptoms["Headache"],
        symptoms["Nausea"], symptoms["Stomach_Pain"], symptoms["Acid_Reflux"],
        symptoms["Shortness_of_Breath"], symptoms["Wheezing"], symptoms["Coughing"],
        symptoms["Agnimandya"], symptoms["Ama"], symptoms["Dhatu_Imbalance"],
        symptoms["Nidra_Dosha"], treatment, treatment_duration, outcome,
        avg_recovery, predicted_recovery, prakriti, diet_advice
    ])

# ======================
# DATAFRAME & EXPORT
# ======================
columns = [
    "Patient_ID", "Age", "Gender", "Diagnosis_Date", "Dosha_Imbalance",
    "Ayurvedic_Condition", "Symptom_Severity", "Adherence", "Joint_Pain",
    "Swelling", "Headache", "Nausea", "Stomach_Pain", "Acid_Reflux",
    "Shortness_of_Breath", "Wheezing", "Coughing", "Agnimandya", "Ama",
    "Dhatu_Imbalance", "Nidra_Dosha", "Selected_Treatment", "Treatment_Duration",
    "Outcome_Score", "Avg_Recovery_Time", "Predicted_Recovery_Time",
    "Prakriti", "Diet_Advice"
]

df = pd.DataFrame(data, columns=columns)
df.to_excel("Sri_Lankan_Ayurvedic_Dataset_200.xlsx", index=False)
print("Dataset generated successfully with 200 entries!")