import pandas as pd
import os
import joblib

# =========================
# LOAD DATA
# =========================

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_path = os.path.join(base_dir, "data", "jobs.csv")

df = pd.read_csv(data_path)
print("Original shape:", df.shape)

# =========================
# SELECT USEFUL COLUMNS
# =========================

df = df[[
    "job_title",
    "company_type",
    "industry",
    "country",
    "city",
    "remote_type",
    "experience_level",
    "min_experience_years",
    "salary_min_usd",
    "salary_max_usd",
    "employment_type",
    "company_size"
]]

print("After selecting columns:", df.shape)

# =========================
# REMOVE MISSING CRITICAL VALUES
# =========================

df = df.dropna(subset=[
    "job_title",
    "industry",
    "remote_type",
    "min_experience_years",
    "salary_min_usd",
    "salary_max_usd"
])

# keep country but allow fallback
df["country"] = df["country"].fillna("Unknown")

print("After dropna:", df.shape)

# =========================
# CREATE TARGET (SALARY)
# =========================

df["salary"] = (df["salary_min_usd"] + df["salary_max_usd"]) / 2

# =========================
# REMOVE OUTLIERS
# =========================

df = df[(df["salary"] > 20000) & (df["salary"] < 400000)]
print("After removing outliers:", df.shape)

# =========================
# CLEAN TEXT
# =========================

text_cols = [
    "job_title",
    "company_type",
    "industry",
    "country",
    "city",
    "remote_type",
    "experience_level",
    "employment_type",
    "company_size"
]

for col in text_cols:
    df[col] = df[col].astype(str).str.strip()

# =========================
# NORMALIZE COUNTRY
# =========================

def normalize_country(c):
    c = str(c).lower()

    if "united states" in c or c in ["us", "usa"]:
        return "USA"
    elif "united kingdom" in c or c == "uk":
        return "UK"
    elif "canada" in c:
        return "Canada"
    elif "germany" in c:
        return "Germany"
    elif "france" in c:
        return "France"
    else:
        return c.title()

df["country"] = df["country"].apply(normalize_country)

# =========================
# HANDLE CITY
# =========================

df["city"] = df["city"].fillna("Unknown")

# =========================
# CLEAN EXPERIENCE
# =========================

df["min_experience_years"] = pd.to_numeric(
    df["min_experience_years"], errors="coerce"
)

df["min_experience_years"] = df["min_experience_years"].fillna(0)
df["min_experience_years"] = df["min_experience_years"].clip(0, 20)

# =========================
# DROP UNUSED COLUMNS
# =========================

df = df.drop(columns=[
    "salary_min_usd",
    "salary_max_usd",
    "experience_level"  # redundant
])

# =========================
# SAVE CLEAN DATA
# =========================

output_path = os.path.join(base_dir, "data", "cleaned_jobs.csv")
df.to_csv(output_path, index=False)

print("Saved cleaned dataset:", output_path)

# =========================
# SAVE COUNTRIES FOR API
# =========================

model_dir = os.path.join(base_dir, "model")
os.makedirs(model_dir, exist_ok=True)

joblib.dump(
    df["country"].unique().tolist(),
    os.path.join(model_dir, "countries.pkl")
)

print("Saved countries list for API.")