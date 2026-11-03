# HealthRisk — ML Risk Prediction System

[![Python](https://img.shields.io/badge/python-3.10-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.109-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-18-61DAFB)](https://react.dev/)
[![GitHub](https://img.shields.io/badge/github-%23181717.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/soujanyapp/Heathrisk-model.git)

A full-stack healthcare application for patient readmission risk scoring with a calibrated logistic regression model.

## Quick Start

```bash
# Terminal 1 — API
cd healthcare-ml-risk-system
uvicorn api.main:app --reload --port 8000

# Terminal 2 — UI
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `POST /predict` | Single patient risk score |
| `POST /predict/batch` | CSV batch upload |
| `GET /metrics` | Model metadata (AUC, Precision, Recall, F1) |
| `GET /health` | Health check |

## Model

- **7 features**: age, prior_visits, has_diabetes, sex_F/M, admit_type_Clinic/ED
- **Calibrated logistic regression** (Platt scaling, sigmoid)
- **Threshold**: 0.05 (cost-sensitive, FN:FP = 10:1)
- **ROC AUC**: 0.97

## Frontend

- **Dashboard**: Model stats, quick action CTA
- **Predict**: Single patient form with instant result
- **Batch**: Drag-and-drop CSV upload, results table, CSV download
- **Metrics**: Performance metrics with plain-English explanations

**Design**: Neumorphic soft cards, cyan palette, Atkinson Hyperlegible font, WCAG AA accessible, `@phosphor-icons/react`.

## Project Structure

```
healthcare-ml-risk-system/
├── api/           ← FastAPI app + requirements.txt
├── frontend/      ← React + Vite + 4 pages + 3 components
├── models/        ← model.pkl (calibrated), model_raw.pkl (raw)
├── scripts/       ← gen_data.py, load.py, features.py, train.py, viz.py
└── reports/       ← metrics.json
```

Built to demonstrate production ML thinking: discrimination vs. calibration, cost-aware deployment, and full-stack delivery.