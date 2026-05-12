import pandas as pd
import os
import joblib
import numpy as np
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.linear_model import LinearRegression

# =========================
# INIT
# =========================

np.random.seed(42)

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data_path = os.path.join(base_dir, "data", "cleaned_jobs.csv")
model_dir = os.path.join(base_dir, "model")

os.makedirs(model_dir, exist_ok=True)

# =========================
# LOAD DATA
# =========================

df = pd.read_csv(data_path)
print("Data:", df.shape)

# =========================
# SELECT FEATURES
# =========================

df = df[[
    "job_title",
    "company_type",
    "industry",
    "country",
    "city",
    "remote_type",
    "min_experience_years",
    "employment_type",
    "company_size",
    "salary"
]]

# =========================
# SAFETY CLEAN (IMPORTANT)
# =========================

# Ensure consistency with cleaning pipeline
df["country"] = df["country"].fillna("Unknown")
df["city"] = df["city"].fillna("Unknown")

# Clamp experience again (safety)
df["min_experience_years"] = pd.to_numeric(
    df["min_experience_years"], errors="coerce"
)
df["min_experience_years"] = df["min_experience_years"].fillna(0)
df["min_experience_years"] = df["min_experience_years"].clip(0, 20)

# =========================
# ADD REALISM (CONTROLLED)
# =========================

df["salary"] = df["salary"] + np.random.normal(0, 8000, len(df))

# =========================
# ENCODING
# =========================

df_encoded = pd.get_dummies(df, columns=[
    "job_title",
    "company_type",
    "industry",
    "country",
    "city",
    "remote_type",
    "employment_type",
    "company_size"
])

# =========================
# DEFINE X / y
# =========================

X = df_encoded.drop(columns=["salary"])
y = df_encoded["salary"]

# =========================
# SPLIT
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# =========================
# LINEAR REGRESSION (FOR PROF)
# =========================

lin_model = LinearRegression()
lin_model.fit(X_train, y_train)

lin_preds = lin_model.predict(X_test)

plt.figure()
plt.scatter(y_test, lin_preds)
plt.xlabel("Real Salary")
plt.ylabel("Predicted Salary (Linear)")
plt.title("Linear Regression Fit")

plt.plot(
    [y_test.min(), y_test.max()],
    [y_test.min(), y_test.max()]
)

plt.show()

# =========================
# MAIN MODEL (REGULARIZED)
# =========================

model = HistGradientBoostingRegressor(
    max_iter=200,
    learning_rate=0.05,
    max_depth=5,
    min_samples_leaf=50
)

model.fit(X_train, y_train)

# =========================
# EVALUATION
# =========================

preds = model.predict(X_test)

rmse = np.sqrt(mean_squared_error(y_test, preds))
r2 = r2_score(y_test, preds)

print("RMSE:", rmse)
print("R2:", r2)

# =========================
# CROSS VALIDATION
# =========================

cv_scores = cross_val_score(model, X, y, cv=5, scoring="r2")
print("CV R2:", cv_scores.mean())

# =========================
# SAVE MODEL + COLUMNS + COUNTRIES
# =========================

joblib.dump(model, os.path.join(model_dir, "model.pkl"))
joblib.dump(X.columns.tolist(), os.path.join(model_dir, "columns.pkl"))

# VERY IMPORTANT FOR BACKEND NORMALIZATION
joblib.dump(
    df["country"].unique().tolist(),
    os.path.join(model_dir, "countries.pkl")
)

print("Model, columns, and countries saved.")
