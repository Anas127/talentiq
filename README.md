# TalentIQ

AI-powered salary intelligence platform. Upload your CV and get an estimated salary, market positioning, profile score, and missing keywords — powered by a custom ML model and GPT-4.

## How it works

1. Upload your CV (PDF)
2. GPT-4 extracts your structured profile
3. A HistGradientBoosting model predicts your market salary
4. Get insights on market positioning, profile score, and missing keywords

## Tech Stack

- **Frontend** — React + Vite
- **Backend** — FastAPI + Python
- **ML Model** — HistGradientBoosting (R² 0.987, RMSE ~$4k), trained on 50k salary records
- **CV Parsing** — GPT-4
- **Deployment** — Render (backend) + Vercel (frontend)

## Live Demo

https://talentiq-brown.vercel.app
