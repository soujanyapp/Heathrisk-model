import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib
from sklearn.metrics import roc_auc_score, roc_curve
from sklearn.model_selection import train_test_split

# Load metrics
with open("reports/metrics_day9.json", "r") as f:
    metrics = json.load(f)

raw_auc = metrics["raw_auc"]
cal_auc = metrics["calibrated_auc"]

raw_brier = metrics["raw_brier"]
cal_brier = metrics["calibrated_brier"]

best_threshold = metrics["cost_analysis"]["best_threshold"]["threshold"]
theoretical_threshold = metrics["cost_analysis"]["theoretical_threshold"]

# Load data + model once, reuse everywhere
df = pd.read_csv("data/processed/features_v1.csv")
y = df["label_risk"].astype(int)

drop_cols = ["label_risk"]
if "patient_id" in df.columns:
    drop_cols.append("patient_id")
X = df.drop(columns=drop_cols)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

model = joblib.load("models/baseline_calibrated.pkl")
cal_prob = model.predict_proba(X_test)[:, 1]

# --- 1. AUC Comparison ---
plt.figure()
plt.bar(["Raw AUC", "Calibrated AUC"], [raw_auc, cal_auc], color=["#94a3b8", "#2563eb"])
plt.title("ROC-AUC Comparison")
plt.ylim(0.9, 1.0)
plt.ylabel("AUC")
plt.tight_layout()
plt.savefig("reports/auc_comparison.png", dpi=150)
plt.close()

# --- 2. Brier Score Comparison ---
plt.figure()
plt.bar(["Raw Brier", "Calibrated Brier"], [raw_brier, cal_brier], color=["#94a3b8", "#16a34a"])
plt.title("Brier Score Improvement After Calibration")
plt.ylabel("Brier Score (Lower is Better)")
plt.tight_layout()
plt.savefig("reports/brier_comparison.png", dpi=150)
plt.close()

# --- 3. ROC Curve ---
fpr, tpr, _ = roc_curve(y_test, cal_prob)
auc_score = roc_auc_score(y_test, cal_prob)

plt.figure(figsize=(6, 6))
plt.plot(fpr, tpr, color="#2563eb", linewidth=2, label=f"Calibrated Model (AUC = {auc_score:.2f})")
plt.plot([0, 1], [0, 1], color="#cbd5e1", linestyle="--", label="Random Classifier")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve — Healthcare Risk Prediction")
plt.legend(loc="lower right")
plt.tight_layout()
plt.savefig("reports/roc_curve.png", dpi=150)
plt.close()
print("Saved: reports/roc_curve.png")

# --- 4. Cost Curve ---
thresholds = np.linspace(0.01, 0.99, 99)
costs = []

for t in thresholds:
    y_pred = (cal_prob >= t).astype(int)
    fn = ((y_test == 1) & (y_pred == 0)).sum()
    fp = ((y_test == 0) & (y_pred == 1)).sum()
    total_cost = 10 * fn + 1 * fp
    costs.append(total_cost)

plt.figure(figsize=(7, 5))
plt.plot(thresholds, costs, color="#1e293b", linewidth=2)
plt.axvline(best_threshold, color="#16a34a", linestyle="--", label=f"Empirical Best ({best_threshold:.2f})")
plt.axvline(theoretical_threshold, color="#dc2626", linestyle="--", label=f"Theoretical ({theoretical_threshold:.2f})")
plt.title("Expected Cost vs. Decision Threshold")
plt.xlabel("Threshold")
plt.ylabel("Total Cost (FN weighted 10x)")
plt.legend()
plt.tight_layout()
plt.savefig("reports/cost_curve.png", dpi=150)
plt.close()
print("Saved: reports/cost_curve.png")

# --- 5. SHAP Summary Plot (optional, skipped if not installed) ---
try:
    import shap

    explainer = shap.Explainer(model.predict_proba, X_train, max_evals=2 * X_train.shape[1] + 1)
    shap_values = explainer(X_test.iloc[:100])

    plt.figure()
    shap.summary_plot(shap_values[:, :, 1], X_test.iloc[:100], show=False)
    plt.tight_layout()
    plt.savefig("reports/shap_summary.png", dpi=150, bbox_inches="tight")
    plt.close()
    print("Saved: reports/shap_summary.png")
except ImportError:
    print("SHAP not installed — skipping SHAP plot.")
except Exception as e:
    print(f"SHAP plot failed: {e}")

print("\nAll charts saved in reports/ folder.")

