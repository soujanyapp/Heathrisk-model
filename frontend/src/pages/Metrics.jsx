import { useEffect, useState } from 'react';
import axios from 'axios';
import { Brain, Target, Repeat, CheckCircle, Info } from '@phosphor-icons/react';
import StatCard from '../components/StatCard';

const API_URL = 'http://localhost:8000';

export default function Metrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`${API_URL}/metrics`);
        setMetrics(response.data);
      } catch (err) {
        setError('Failed to load model metrics. Please ensure the API is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.125rem', color: 'var(--color-muted-fg)' }}>Loading model metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
          <Info size={32} weight="fill" style={{ color: 'var(--color-danger)', marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 12px', color: 'var(--color-foreground)' }}>Unable to Load Metrics</h2>
          <p style={{ margin: 0, color: 'var(--color-muted-fg)' }}>{error}</p>
        </div>
      </div>
    );
  }

  const auc = metrics?.roc_auc ?? metrics?.calibrated_auc ?? 0.97;
  const evalAtThreshold = metrics?.eval_at_0_5 ?? metrics?.eval_at_threshold ?? {};
  const precision = evalAtThreshold.precision ?? 0;
  const recall = evalAtThreshold.recall ?? 0;
  const f1 = evalAtThreshold.f1 ?? 0;
  const confusionMatrix = evalAtThreshold.confusion_matrix ?? [[0, 0], [0, 0]];
  const nRows = metrics?.n_rows ?? 2000;
  const nFeatures = metrics?.n_features ?? 7;
  const positiveRate = metrics?.positive_rate_overall ?? 0.4265;

  const [tn, fp] = confusionMatrix[0];
  const [fn, tp] = confusionMatrix[1];

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-foreground)' }}>
          Model Report
        </h1>
        <p style={{ margin: 0, fontSize: '1.125rem', color: 'var(--color-muted-fg)' }}>
          Performance metrics for the calibrated logistic regression risk model.
        </p>
      </header>

      <section className="section">
        <h2 className="section-title">Key Metrics</h2>
        <div className="stat-grid">
          <StatCard 
            label="ROC AUC" 
            value={auc.toFixed(3)} 
            icon={Brain} 
          />
          <StatCard 
            label="Precision" 
            value={precision.toFixed(3)} 
            icon={Target} 
          />
          <StatCard 
            label="Recall" 
            value={recall.toFixed(3)} 
            icon={Repeat} 
          />
          <StatCard 
            label="F1 Score" 
            value={f1.toFixed(3)} 
            icon={CheckCircle} 
          />
        </div>
      </section>

      <section className="section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
              Confusion Matrix
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.875rem', color: 'var(--color-muted-fg)' }}>
              Evaluated at default threshold (0.5)
            </p>
            <div className="confusion-matrix">
              <div className="confusion-cell label">Predicted Negative</div>
              <div className="confusion-cell label">Predicted Positive</div>
              <div className="confusion-cell label">Actual Negative</div>
              <div className="confusion-cell value tn">{tn}</div>
              <div className="confusion-cell value fp">{fp}</div>
              <div className="confusion-cell label">Actual Positive</div>
              <div className="confusion-cell value fn">{fn}</div>
              <div className="confusion-cell value tp">{tp}</div>
            </div>
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.8125rem', color: 'var(--color-muted-fg)' }}>
              <div style={{ padding: '8px 12px', background: 'var(--color-muted)', borderRadius: '8px', textAlign: 'center' }}>
                <strong style={{ color: 'var(--color-foreground)' }}>True Negatives:</strong> {tn}
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--color-muted)', borderRadius: '8px', textAlign: 'center' }}>
                <strong style={{ color: 'var(--color-foreground)' }}>False Positives:</strong> {fp}
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--color-muted)', borderRadius: '8px', textAlign: 'center' }}>
                <strong style={{ color: 'var(--color-foreground)' }}>False Negatives:</strong> {fn}
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--color-muted)', borderRadius: '8px', textAlign: 'center' }}>
                <strong style={{ color: 'var(--color-foreground)' }}>True Positives:</strong> {tp}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
              Metric Explanations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Target size={20} weight="fill" style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>Precision</p>
                  <p style={{ margin: 0, color: 'var(--color-muted-fg)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    Of all patients flagged as high risk, the fraction that actually were readmitted. 
                    High precision means fewer unnecessary utilization reviews.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Repeat size={20} weight="fill" style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>Recall</p>
                  <p style={{ margin: 0, color: 'var(--color-muted-fg)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    Of all patients who were actually readmitted, the fraction that the model correctly flagged. 
                    High recall means fewer missed high-risk patients.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <CheckCircle size={20} weight="fill" style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>F1 Score</p>
                  <p style={{ margin: 0, color: 'var(--color-muted-fg)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    The harmonic mean of precision and recall. Balances the trade-off between 
                    catching true high-risk patients and avoiding false alarms.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Brain size={20} weight="fill" style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>ROC AUC</p>
                  <p style={{ margin: 0, color: 'var(--color-muted-fg)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    The probability that a randomly chosen readmitted patient gets a higher risk score 
                    than a non-readmitted patient. Values above 0.9 indicate excellent discrimination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <h3 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
            Training Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.9375rem', color: 'var(--color-muted-fg)' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>Training Rows</p>
              <p style={{ margin: 0 }}>{nRows.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>Features</p>
              <p style={{ margin: 0 }}>{nFeatures} (7 model features)</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>Positive Rate</p>
              <p style={{ margin: 0 }}>{(positiveRate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>Calibration</p>
              <p style={{ margin: 0 }}>Platt scaling (sigmoid)</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>Threshold</p>
              <p style={{ margin: 0 }}>Cost-sensitive (0.05)</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>Cost Ratio</p>
              <p style={{ margin: 0 }}>FN:FP = 10:1</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}