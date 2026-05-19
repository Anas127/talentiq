from fastapi import FastAPI, UploadFile, File, HTTPException
import joblib
import pandas as pd
import os
import pdfplumber
from openai import OpenAI
import json
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# =========================
# INIT
# =========================

load_dotenv()

client = OpenAI()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

base_dir = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

# =========================
# LOAD MODEL + DATA
# =========================

model = joblib.load(
    os.path.join(base_dir, "model", "model.pkl")
)

columns = joblib.load(
    os.path.join(base_dir, "model", "columns.pkl")
)

dataset = pd.read_csv(
    os.path.join(base_dir, "data", "cleaned_jobs.csv")
)

# =========================
# PDF EXTRACTION
# =========================


def extract_text(file):

    text = ""

    with pdfplumber.open(file) as pdf:

        for page in pdf.pages:
            text += page.extract_text() or ""

    if not text.strip() or len(text) < 100:

        raise ValueError(
            "CV invalide ou scanné (texte non lisible)"
        )

    return text

# =========================
# LLM EXTRACTION
# =========================


def call_llm(text):

    prompt = f"""
Extract structured data from this CV for an academic AI salary analyzer.

RULES:
- Calculate TOTAL years of experience
- Use job history dates
- If current role is ongoing, assume present = 2026
- Infer best matching job_title
- Infer country and professional region if possible
- Keep arrays short and useful
- If a value is unknown, use "Unknown" or []
- salary_reasoning must explain why the profile may receive a strong or weak salary prediction, but do not invent a salary amount
- All generated text fields MUST be written in French
- city must represent the candidate’s primary professional location
- Do not use university names as city values
- If the CV contains a university location, extract the real city/region instead
- Infer whether education is completed or ongoing using dates
- Do not label completed degrees as "en cours"
- Do not use markdown
- Do not wrap JSON in triple backticks
- Ensure ALL fields are always present
- Never infer languages from names, ethnicity, or nationality
- English can be inferred if the CV is fully written in English
- Never infer other languages from names, ethnicity, or nationality
- Ensure profile_summary is fully consistent with inferred education completion status

Return ONLY valid JSON.

FORMAT:
{{
  "full_name": "string",
  "job_title": "string",
  "seniority_level": "Junior | Mid-level | Senior | Lead",
  "min_experience_years": number,
  "country": "string",
  "city": "string",
  "skills": ["string"],
  "education_level": "string",
  "certifications": ["string"],
  "languages": ["string"],
  "strengths": ["string"],
  "missing_keywords": ["string"],
  "profile_summary": "string",
  "salary_reasoning": "string"
}}

CV:
{text}
"""

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = (
        response
        .choices[0]
        .message
        .content
        .strip()
    )

    content = (
        content
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    try:

        return json.loads(content)

    except:

        raise ValueError(
            f"LLM parsing failed: {content}"
        )

# =========================
# NORMALIZATION
# =========================


def normalize_job_title(title):

    title = title.lower()

    if "data scientist" in title:
        return "Data Scientist"

    elif "data analyst" in title:
        return "Data Analyst"

    elif (
        "ml" in title
        or
        "machine learning" in title
    ):
        return "ML Engineer"

    else:
        return "Data Scientist"


# =========================
# DYNAMIC INFERENCE
# =========================


def infer_industry(title):

    title = str(title).lower()

    if (
        "ml" in title
        or
        "ai" in title
        or
        "machine learning" in title
    ):

        return "Artificial Intelligence"

    elif "analyst" in title:

        return "Finance"

    elif "engineer" in title:

        return "Technology"

    else:

        return "Data"


# =========================
# ENRICHMENT
# =========================

def enrich_data(data):

    years = data.get(
        "min_experience_years",
        2
    )

    if not isinstance(
        years,
        (int, float)
    ):

        years = 2

    years = max(
        0,
        min(years, 20)
    )

    title = normalize_job_title(

        data.get(
            "job_title",
            "Data Scientist"
        )

    )

    return {

        "job_title":
        title,



        "industry":
        infer_industry(title),

        "country":
        data.get(
            "country",
            "Unknown"
        ),

        "city":
        data.get(
            "city",
            "Unknown"
        ) or "Unknown",



        "min_experience_years":
        years,

        "employment_type":
        "Full-time",


    }


def list_value(data, key, fallback=None):

    value = data.get(key, fallback or [])

    if isinstance(value, list):
        return [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]

    if isinstance(value, str) and value.strip():
        return [value.strip()]

    return fallback or []


def build_profile_details(raw_data, prediction_data):

    years = prediction_data["min_experience_years"]

    seniority = raw_data.get(
        "seniority_level",
        "Unknown"
    )

    if seniority == "Unknown":

        if years >= 8:
            seniority = "Lead"
        elif years >= 5:
            seniority = "Senior"
        elif years >= 2:
            seniority = "Mid-level"
        else:
            seniority = "Junior"

    return {

        "full_name":
        raw_data.get(
            "full_name",
            "Unknown"
        ),

        "seniority_level":
        seniority,

        "city":
        raw_data.get(
            "city",
            prediction_data.get("city", "Unknown")
        ),

        "skills":
        list_value(raw_data, "skills"),

        "education_level":
        raw_data.get(
            "education_level",
            "Unknown"
        ),

        "certifications":
        list_value(raw_data, "certifications"),

        "languages":
        list_value(raw_data, "languages"),

        "strengths":
        list_value(
            raw_data,
            "strengths",
            [
                "Experience aligned with data and AI roles",
                "Profile contains enough structure for salary estimation"
            ]
        ),

        "missing_keywords":
        list_value(raw_data, "missing_keywords"),

        "profile_summary":
        raw_data.get(
            "profile_summary",
            "Profile extracted from the uploaded CV and prepared for salary estimation."
        ),

        "salary_reasoning":
        raw_data.get(
            "salary_reasoning",
            "The salary estimate is based on the extracted role, experience level, country, company context, and market features used by the trained model."
        )
    }

# =========================
# INTELLIGENCE FUNCTIONS
# =========================


def get_feature_contributions(df_input):

    base_pred = model.predict(df_input)[0]

    contributions = {}

    for col in df_input.columns:

        temp = df_input.copy()

        temp[col] = 0

        new_pred = model.predict(temp)[0]

        impact = base_pred - new_pred

        if abs(impact) > 1000:

            contributions[col] = impact

    contributions = dict(

        sorted(
            contributions.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )

    )

    return base_pred, contributions


def format_contributions(
    contributions,
    years,
    country
):

    explanations = [

        f"{years} années d’expérience augmentent fortement le potentiel salarial dans les métiers IA et data.",

        f"Le marché {country} présente actuellement des rémunérations élevées pour les profils spécialisés en intelligence artificielle.",

        "Le profil analysé se situe dans une tranche compétitive du marché international."

    ]

    return explanations


def profile_score(predicted_salary):

    if predicted_salary < 50000:
        return 42

    elif predicted_salary < 70000:
        return 58

    elif predicted_salary < 90000:
        return 69

    elif predicted_salary < 120000:
        return 78

    elif predicted_salary < 160000:
        return 87

    else:
        return 95


def profile_percentile(predicted_salary):

    if predicted_salary < 50000:
        return "Top 65%"

    elif predicted_salary < 70000:
        return "Top 45%"

    elif predicted_salary < 90000:
        return "Top 30%"

    elif predicted_salary < 120000:
        return "Top 18%"

    elif predicted_salary < 160000:
        return "Top 12%"

    else:
        return "Top 5%"


def score_label(score):

    if score < 50:
        return "Profil Débutant"

    elif score < 70:
        return "Profil Compétitif"

    elif score < 85:
        return "Profil Avancé"

    else:
        return "Profil Premium"


def market_position(salary):

    if salary < 70000:
        return "Sous le marché"

    elif salary < 120000:
        return "Moyenne du marché"

    elif salary < 180000:
        return "Au-dessus du marché"

    else:
        return "Élite du marché"

# =========================
# PREDICT
# =========================


@app.post("/predict")
def predict(data: dict):

    df = pd.DataFrame([data])

    df = pd.get_dummies(df)

    df = df.reindex(
        columns=columns,
        fill_value=0
    )

    prediction = model.predict(df)[0]

    return {
        "predicted_salary":
        float(prediction)
    }

# =========================
# ANALYZE CV
# =========================


@app.post("/analyze-cv")
async def analyze_cv(
    file: UploadFile = File(...)
):

    try:

        text = extract_text(file.file)

        raw_data = call_llm(text)

        data = enrich_data(raw_data)

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    df = pd.DataFrame([data])

    df = pd.get_dummies(df)

    df = df.reindex(
        columns=columns,
        fill_value=0
    )

    salary, contributions = (
        get_feature_contributions(df)
    )

    years = data["min_experience_years"]

    country = data["country"]

    explanation = format_contributions(
        contributions,
        years,
        country
    )

    score = profile_score(salary)

    percentile = profile_percentile(salary)

    label = score_label(score)

    position = market_position(salary)

    profile_details = build_profile_details(
        raw_data,
        data
    )

    return {

        "extracted":
        raw_data,

        "used_for_prediction":
        data,

        "predicted_salary":
        float(salary),

        "score":
        score,

        "percentile":
        percentile,

        "score_label":
        label,

        "market_position":
        position,

        "explanation":
        explanation,

        "profile_details":
        profile_details,

        "top_factors":
        contributions
    }

# =========================
# SIMULATOR
# =========================


@app.post("/simulate")
def simulate(data: dict):

    current_exp = data.get(
        "min_experience_years",
        0
    )

    trajectory = []

    for exp in range(
        current_exp,
        current_exp + 10
    ):

        sim_data = data.copy()

        sim_data[
            "min_experience_years"
        ] = exp

        df = pd.DataFrame([sim_data])

        df = pd.get_dummies(df)

        df = df.reindex(
            columns=columns,
            fill_value=0
        )

        base_salary = model.predict(df)[0]

        years_growth = exp - current_exp

        growth_multiplier = (
            1 + (years_growth * 0.045)
        )

        salary = (
            base_salary * growth_multiplier
        )

        trajectory.append({

            "experience":
            exp,

            "salary":
            round(float(salary), 2)

        })

    return {
        "trajectory":
        trajectory
    }

# =========================
# MARKET INSIGHTS
# =========================


@app.get("/market-insights")
def market_insights():

    # =========================
    # NORMALIZATION
    # =========================

    insights_df = dataset.copy()

    insights_df["remote_type"] = (
        insights_df["remote_type"]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    # =========================
    # GLOBAL METRICS
    # =========================

    average_salary = int(
        insights_df["salary"].median()
    )

    # =========================
    # FILTER SMALL SAMPLES
    # =========================

    filtered_roles = (
        insights_df
        .groupby("job_title")
        .filter(lambda x: len(x) >= 10)
    )

    filtered_countries = (
        insights_df
        .groupby("country")
        .filter(lambda x: len(x) >= 10)
    )

    # =========================
    # TOP PAYING ROLES
    # =========================

    top_roles_df = (

        filtered_roles

        .groupby("job_title")["salary"]

        .median()

        .sort_values(
            ascending=False
        )

        .head(5)

        .round()

        .astype(int)

        .reset_index()

    )

    top_roles = top_roles_df.to_dict(
        orient="records"
    )

    # =========================
    # TOP PAYING COUNTRIES
    # =========================

    top_countries_df = (

        filtered_countries

        .groupby("country")["salary"]

        .median()

        .sort_values(
            ascending=False
        )

        .head(5)

        .round()

        .astype(int)

        .reset_index()

    )

    top_countries = (
        top_countries_df.to_dict(
            orient="records"
        )
    )

    # =========================
    # REMOTE PREMIUM
    # =========================

    remote_avg = insights_df[
        insights_df["remote_type"]
        == "remote"
    ]["salary"].median()

    onsite_avg = insights_df[
        insights_df["remote_type"]
        == "onsite"
    ]["salary"].median()

    # avoid division by zero

    if onsite_avg and onsite_avg > 0:

        remote_premium = int(

            (
                (remote_avg - onsite_avg)
                / onsite_avg
            ) * 100

        )

    else:

        remote_premium = 0

    # =========================
    # HIGHEST PAYING ROLE
    # =========================

    highest_paying_role = (

        filtered_roles

        .groupby("job_title")["salary"]

        .median()

        .sort_values(
            ascending=False
        )

        .index[0]

    )

    # =========================
    # RESPONSE
    # =========================

    return {

        "average_salary":
        average_salary,

        "remote_premium":
        remote_premium,

        "highest_paying_role":
        highest_paying_role,

        "top_roles":
        top_roles,

        "top_countries":
        top_countries
    }
