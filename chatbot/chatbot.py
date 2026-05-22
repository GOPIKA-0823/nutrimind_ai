import pandas as pd
import sys
import os

# ===============================
# Load Datasets with Absolute Paths
# ===============================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def get_path(filename):
    return os.path.join(SCRIPT_DIR, filename)

try:
    symptom_disease_df_raw = pd.read_csv(get_path("Symptom2Disease.csv"))
    disease_desc_df_raw = pd.read_csv(get_path("Diseases_Symptoms.csv"))
    precaution_df_raw = pd.read_csv(get_path("Disease precaution.csv"))
except Exception as e:
    print(f"Error loading datasets: {e}")
    sys.exit(1)

# Rename and Prepare Dataframes
symptom_disease_df = symptom_disease_df_raw.rename(
    columns={'label': 'Disease', 'text': 'Symptoms'}
)
symptom_disease_df['Disease'] = symptom_disease_df['Disease'].astype(str).str.lower()
symptom_disease_df['Symptoms'] = symptom_disease_df['Symptoms'].astype(str).str.lower()

disease_desc_df = disease_desc_df_raw.rename(columns={'Name': 'Disease'})
disease_desc_df['Disease'] = disease_desc_df['Disease'].astype(str).str.lower().str.strip()

precaution_df = precaution_df_raw.copy()
precaution_df['Disease'] = precaution_df['Disease'].astype(str).str.lower().str.strip()

# ===============================
# Normalization Map for Inconsistent Data
# ===============================
DISEASE_NORMALIZATION = {
    "osteoarthristis": "osteoarthritis",
    "peptic ulcer diseae": "peptic ulcer disease",
    "hypertension ": "hypertension",
    "diabetes ": "diabetes",
    "dimorphic hemmorhoids(piles)": "dimorphic hemorrhoids(piles)",
    "bronchial asthma": "asthma",
    "fungal infection": "scabies"
}

def normalize_disease_name(name):
    name = name.lower().strip()
    return DISEASE_NORMALIZATION.get(name, name)

# Apply normalization
symptom_disease_df['Disease'] = symptom_disease_df['Disease'].apply(normalize_disease_name)
disease_desc_df['Disease'] = disease_desc_df['Disease'].apply(normalize_disease_name)
precaution_df['Disease'] = precaution_df['Disease'].apply(normalize_disease_name)

# ===============================
# Symptom Synonyms
# ===============================
SYMPTOM_SYNONYMS = {
    "dizzy": "dizziness",
    "lightheaded": "dizziness",
    "head spinning": "dizziness",
    "chest discomfort": "chest pain",
    "chest tightness": "chest pain",
    "heart pain": "chest pain",
    "high bp": "hypertension",
    "bp": "hypertension",
    "sugar": "diabetes",
    "stomach pain": "abdominal pain",
    "tummy ache": "abdominal pain"
}

# ===============================
# Helper Functions
# ===============================
def normalize_text(text):
    text = text.lower()
    for k, v in SYMPTOM_SYNONYMS.items():
        text = text.replace(k, v)
    return text

def get_words(text):
    import re
    # Extract only words longer than 2 characters
    words = re.findall(r'\b\w{3,}\b', text.lower())
    # Exclude common stop words
    stop_words = {'have', 'been', 'with', 'and', 'the', 'for', 'you', 'this', 'that', 'they', 'from', 'was'}
    return set(w for w in words if w not in stop_words)

def extract_symptoms(user_text):
    user_text = normalize_text(user_text)
    user_words = get_words(user_text)
    return user_words

def predict_disease(user_words):
    if not user_words:
        return "unknown"
        
    best_match = None
    max_score = 0

    # Score each disease based on word overlap in its sample symptoms
    # We aggregate scores by disease
    disease_scores = {}

    for _, row in symptom_disease_df.iterrows():
        disease = row['Disease']
        dataset_words = get_words(row['Symptoms'])
        
        # Calculate overlap
        common = user_words.intersection(dataset_words)
        score = len(common)
        
        if score > 0:
            disease_scores[disease] = disease_scores.get(disease, 0) + score

    if not disease_scores:
        return "unknown"

    # Get disease with highest cumulative score
    best_match = max(disease_scores, key=disease_scores.get)
    return best_match


def get_description(disease):
    """Uses Symptoms and Treatments from Diseases_Symptoms.csv."""
    disease = normalize_disease_name(disease)
    row = disease_desc_df[disease_desc_df['Disease'] == disease]
    if not row.empty:
        r = row.iloc[0]
        symptoms = str(r.get('Symptoms', '')).strip() if pd.notna(r.get('Symptoms')) else ''
        treatments = str(r.get('Treatments', '')).strip() if pd.notna(r.get('Treatments')) else ''
        if symptoms and treatments:
            return f"{symptoms}. Treatment typically involves: {treatments}"
        return symptoms or treatments or "Description of the condition is not available."
    return "Description not available."


def get_precautions(disease):
    """Combines Precaution_1 through Precaution_4 from Disease precaution.csv."""
    disease = normalize_disease_name(disease)
    row = precaution_df[precaution_df['Disease'] == disease]
    if not row.empty:
        r = row.iloc[0]
        parts = []
        for col in ['Precaution_1', 'Precaution_2', 'Precaution_3', 'Precaution_4']:
            val = r.get(col)
            if pd.notna(val) and str(val).strip():
                parts.append(str(val).strip().capitalize())
        return ", ".join(parts) if parts else "Follow general health advice and rest."
    return "General care information not available for this condition."


def classify_query(text):
    text = text.lower().strip()
    words = set(text.split())

    if any(w in words for w in ["hi", "hello", "hey"]):
        return "greeting"

    if any(phrase in text for phrase in ["what is", "tell me about", "explain"]):
        return "disease_info"

    return "symptom_query"


# ===============================
# Main Chatbot Logic
# ===============================
def medical_chatbot(user_input):
    query_type = classify_query(user_input)

    if query_type == "greeting":
        return "Hello! I am your medical assistant. Please describe your symptoms (e.g., headache, dizziness, nausea) and I will try to help you identify possible causes."

    if query_type == "disease_info":
        found_disease = None
        for disease in disease_desc_df['Disease']:
            if disease in user_input.lower():
                found_disease = disease
                break
        
        if found_disease:
            return f"""
{found_disease.title()}

Description:
{get_description(found_disease)}

Note:
This information is for awareness only.
Please consult a qualified doctor.
"""
        return "Please mention a specific disease name (e.g., Malaria, Diabetes) to get more information."

    user_words = extract_symptoms(user_input)

    if not user_words:
        return """
I could not clearly identify specific symptoms from your message.
Please describe how you are feeling (e.g., "I have a sharp pain in my chest" or "I am feeling nauseous").
For medical emergencies, please contact emergency services immediately.
"""

    disease = predict_disease(user_words)

    if disease == "unknown":
        return """
Based on the symptoms described, I could not determine a specific possible condition.
Many conditions share similar symptoms. Please consult a qualified doctor for a proper diagnosis.
"""

    return f"""Possible Condition: {disease.title()}

Description:
{get_description(disease)}

General Care:
{get_precautions(disease)}

Medical Attention:
Immediate consultation is recommended if symptoms persist or worsen. Seek emergency care for severe chest pain, difficulty breathing, or sudden confusion.

Note:
This is not a medical diagnosis. Please consult a qualified doctor."""


# ===============================
# Execute Logic
# ===============================
if __name__ == "__main__":
    # Ensure stdout is utf-8
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

    # If argument provided, run once and exit
    if len(sys.argv) > 1:
        user_query = " ".join(sys.argv[1:])
        response = medical_chatbot(user_query)
        print(response)
    else:
        # Otherwise run interactive loop
        print("\nMedical Chatbot Ready. Type 'exit' to stop.\n")
        while True:
            try:
                user_input = input("You: ")
                if user_input.lower() == "exit":
                    print("Chatbot: Take care! Stay healthy.")
                    break
                if not user_input.strip():
                    continue
                response = medical_chatbot(user_input)
                print("\nChatbot:", response)
                print("-" * 50)
            except (EOFError, KeyboardInterrupt):
                break

