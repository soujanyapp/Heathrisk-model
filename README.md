# Healthcare Risk Prediction System

> Production-style ML pipeline for cost-sensitive patient risk scoring using synthetic EHR data. Now with a React + FastAPI UI/API layer.

![Python](https://img.shields.io/badge/Python-3.10-blue) ![ROC-AUC](https://img.shields.io/badge/ROC--AUC-0.97-brightgreen) ![Cost-Sensitive](https://img.shields.io/badge/Cost--Sensitive-FN%2010x%20FP-orange) ![React](https://img.shields.io/badge/React-18-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)

---

## For Non-Technical Readers

This system predicts which patients are at highest risk of generating high healthcare costs — enabling proactive care management before expensive events occur.

Rather than treating all prediction errors equally, the model is intentionally tuned to flag more patients for clinical review rather than miss a high-risk individual. A missed high-risk patient (false negative) was weighted 10 times more costly than a false alarm (false positive) — directly reflecting how real utilization management decisions work in clinical and insurance settings.

---

## Key Results

| Metric | Value |
|---|---|
| ROC-AUC | **0.97** |
| Brier score improvement after calibration | Improved (Platt scaling) |
| Theoretical optimal threshold | 0.09 |
| Empirically deployed threshold | **0.05** |
| False negative cost weight | **10x false positive** |

### Key Insight: Theory vs. Empirical Threshold

> Although theoretical decision analysis suggested an optimal threshold of **0.09**, empirical cost minimization on the actual score distribution selected **0.05**.
>
> This divergence demonstrates how finite sample effects and probability distribution shape influence real deployment policy — and why threshold decisions in production systems require empirical validation, not just theoretical calculation. In a clinical context, this difference determines how many patients are flagged for utilization review.

---

## UI + API Layer

The project now includes a complete frontend and backend for serving predictions:

### FastAPI Backend (`api/`)

- `POST /predict` — Single patient risk scoring
- `POST /predict/batch` — CSV batch scoring
- `GET /metrics` — Model metadata and metrics
- `GET /health` — Health check endpoint

### React Frontend (`frontend/`)

- **Dashboard** — Model stats, quick actions
- **Predict** — Single patient form with instant risk result
- **Batch** — Drag-and-drop CSV upload, results table, CSV download
- **Metrics** — Model performance metrics with explanations

**Design System:** Neumorphic soft cards, cyan palette, Atkinson Hyperlegible font, WCAG AA accessible, `@phosphor-icons/react` icons.

---

## Project Structure

```
healthcare-ml-risk-system/
├── api/
│   ├── main.py          ← FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Predict.jsx
│   │   │   ├── Batch.jsx
│   │   │   └── Metrics.jsx
│   │   ├── components/
│   │   │   ├── NavBar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── RiskBadge.jsx
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── models/
│   ├── model.pkl        ← Calibrated logistic regression (renamed from baseline_calibrated.pkl)
│   └── model_raw.pkl    ← Raw logistic regression (renamed from baseline_logreg.pkl)
├── scripts/
│   ├── gen_data.py      ← Generate synthetic EHR data
│   ├── load.py          ← Load and clean data
│   ├── features.py      ← Feature engineering (one-hot encoding)
│   ├── train.py         ← Train + calibrate model
│   └── viz.py           ← Visualization scripts
├── reports/
│   └── metrics.json     ← Model metrics (renamed from metrics_baseline.json)
└── README.md
```

---

## How to Run

### Terminal 1 — Start the API

```bash
cd healthcare-ml-risk-system
uvicorn api.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`

### Terminal 2 — Start the UI

```bash
cd frontend
npm install
npm run dev
```

The UI will open at `http://localhost:5173`

---

## API Usage Examples

### Single Prediction

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 72,
    "sex": "M",
    "admit_type": "ED",
    "prior_visits": 3,
    "has_diabetes": 1
  }'
```

Response:
```json
{
  "risk_score": 0.91,
  "risk_label": "HIGH",
  "flagged": true,
  "threshold_used": 0.05
}
```

### Batch Prediction

```bash
curl -X POST http://localhost:8000/predict/batch \
  -F "file=@patients.csv"
```

CSV format:
```csv
age,sex,admit_type,prior_visits,has_diabetes
72,M,ED,3,1
45,F,Clinic,0,0
68,M,ED,5,1
```

### Get Metrics

```bash
curl http://localhost:8000/metrics
```

---

## Model Details

**Features (7 total):**
- `age` — integer (18–90)
- `prior_visits` — integer
- `has_diabetes` — 0 or 1
- `sex_F`, `sex_M` — one-hot encoded
- `admit_type_Clinic`, `admit_type_ED` — one-hot encoded

**Model:** Calibrated logistic regression (Platt scaling, sigmoid) trained on 2,000 synthetic EHR records with `class_weight="balanced"`.

**Threshold:** 0.05 (cost-sensitive, FN cost = 10× FP cost)

---

## Pipeline Architecture

This was built as a full end-to-end production pipeline — not just a model training notebook.

### Core Concepts Demonstrated

**Discrimination vs. Calibration** — A model can rank patients correctly (high AUC) but still produce poorly calibrated probabilities. This pipeline evaluates both — discrimination via ROC-AUC and calibration via Brier score — and applies Platt scaling to improve probability estimates before threshold decisions are made.

**Cost-Aware Decision Systems** — Standard ML evaluation metrics (accuracy, F1) treat all errors equally. In healthcare, a missed high-risk patient is far more costly than a false alarm. This pipeline builds cost asymmetry directly into threshold selection.

**Ranking vs. Probability Estimation** — The model serves two purposes: ranking patients by risk (discrimination) and estimating the actual probability of a high-cost event (calibration). These require different evaluation methods and optimization strategies.

---

## Connection to Medical Claims Data

This project uses synthetic EHR data. In a production healthcare setting (e.g., health insurance, utilization management), the same pipeline would operate on:

| Synthetic Feature | Real Claims Equivalent |
|---|---|
| Diagnosis codes | ICD-10-CM codes |
| Procedure history | CPT / HCPCS codes |
| Utilization frequency | Claims volume, admission counts |
| Cost history | Paid claims amounts, PMPM spend |
| Demographic features | Member enrollment data |

The cost-sensitive framework directly mirrors real utilization management workflows:
- **Prior authorization** — flag high-risk procedures before approval
- **Concurrent review** — monitor high-risk inpatient stays
- **Retrospective analysis** — identify patterns in historical spending

---

## Model Interpretability (SHAP)

Clinical and business stakeholders require explanations for model predictions. This pipeline includes SHAP (SHapley Additive exPlanations) analysis to identify which features drive individual risk scores — supporting the auditability requirements of healthcare AI systems.

---

## Cloud Deployment — Azure ML

The model is designed for transition to Azure ML Studio, including:
- Model registration via `azureml-sdk`
- Managed endpoint deployment
- Data drift monitoring for production retraining triggers

See `azure/deploy.py` for the deployment stub.

---

## About This Project

Built independently to demonstrate production ML thinking in the healthcare domain — including the real-world tradeoffs between discrimination, calibration, and cost-aware deployment that are often absent from academic ML projects.

**Topics:** `healthcare-ml` `risk-prediction` `cost-sensitive-learning` `scikit-learn` `python` `utilization-management` `azure-ml` `react` `fastapi`