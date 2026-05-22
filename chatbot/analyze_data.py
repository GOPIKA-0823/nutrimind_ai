import pandas as pd
import os

files = ["Symptom2Disease.csv", "Diseases_Symptoms.csv", "Disease precaution.csv"]
for f in files:
    try:
        df = pd.read_csv(f)
        print(f"File: {f}")
        print(f"Columns: {list(df.columns)}")
        if 'label' in df.columns:
            print(f"First 5 labels: {list(df['label'].unique()[:5])}")
        elif 'Name' in df.columns:
            print(f"First 5 names: {list(df['Name'].unique()[:5])}")
        elif 'Disease' in df.columns:
            print(f"First 5 diseases: {list(df['Disease'].unique()[:5])}")
        print("-" * 20)
    except Exception as e:
        print(f"Error {f}: {e}")
