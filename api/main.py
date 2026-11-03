import json
from pathlib import Path
from typing import List

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="HealthRisk API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path(__file__).parent.parent / "models" / "model.pkl"
METRICS_PATH = Path(__file__).parent.parent / "reports" / "metrics.json"
THRESHOLD = 0.05

model = joblib.load(MODEL_PATH)

FEATURE_COLUMNS = [
    "age",
    "prior_visits",
    "has_diabetes",
    "sex_F",
    "sex_M",
    "admit_type_Clinic",
    "admit_type_ED",
]

SEX_MAP = {"F": {"sex_F": 1, "sex_M": 0}, "M": {"sex_F": 0, "sex_M": 1}}
ADMIT_MAP = {
    "Clinic": {"admit_type_Clinic": 1, "admit_type_ED": 0},
    "ED": {"admit_type_Clinic": 0, "admit_type_ED": 1},
}


class PatientInput(BaseModel):
    age: int = Field(..., ge=18, le=90)
    sex: str = Field(..., pattern="^(F|M)$")
    admit_type: str = Field(..., pattern="^(Clinic|ED)$")
    prior_visits: int = Field(..., ge=0)
    has_diabetes: int = Field(..., ge=0, le=1)


class PredictionResponse(BaseModel):
    risk_score: float
    risk_label: str
    flagged: bool
    threshold_used: float


class BatchResponse(BaseModel):
    predictions: List[PredictionResponse]


def encode_patient(patient: PatientInput) -> np.ndarray:
    features = {
        "age": patient.age,
        "prior_visits": patient.prior_visits,
        "has_diabetes": patient.has_diabetes,
        **SEX_MAP[patient.sex],
        **ADMIT_MAP[patient.admit_type],
    }
    return np.array([[features[col] for col in FEATURE_COLUMNS]])


def predict_single(features: np.ndarray) -> PredictionResponse:
    prob = float(model.predict_proba(features)[0, 1])
    flagged = prob > THRESHOLD
    return PredictionResponse(
        risk_score=round(prob, 4),
        risk_label="HIGH" if flagged else "LOW",
        flagged=flagged,
        threshold_used=THRESHOLD,
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/metrics")
async def metrics():
    if not METRICS_PATH.exists():
        raise HTTPException(status_code=404, detail="Metrics file not found")
    return json.loads(METRICS_PATH.read_text())


@app.post("/predict", response_model=PredictionResponse)
async def predict(patient: PatientInput):
    features = encode_patient(patient)
    return predict_single(features)


@app.post("/predict/batch", response_model=BatchResponse)
async def predict_batch(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    try:
        df = pd.read_csv(file.file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {e}")

    required_cols = {"age", "sex", "admit_type", "prior_visits", "has_diabetes"}
    if not required_cols.issubset(df.columns):
        missing = required_cols - set(df.columns)
        raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")

    predictions = []
    for _, row in df.iterrows():
        patient = PatientInput(
            age=int(row["age"]),
            sex=str(row["sex"]),
            admit_type=str(row["admit_type"]),
            prior_visits=int(row["prior_visits"]),
            has_diabetes=int(row["has_diabetes"]),
        )
        features = encode_patient(patient)
        predictions.append(predict_single(features))

    return BatchResponse(predictions=predictions)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)