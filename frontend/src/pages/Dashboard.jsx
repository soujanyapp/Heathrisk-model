import { Link } from 'react-router-dom';
import { ArrowRight, Upload, Brain, Percent, Warning } from '@phosphor-icons/react';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-foreground)' }}>
          HealthRisk Dashboard
        </h1>
        <p style={{ margin: 0, fontSize: '1.125rem', color: 'var(--color-muted-fg)', maxWidth: '600px' }}>
          Patient risk scoring for healthcare utilization review. 
          Calibrated logistic regression model with cost-sensitive threshold.
        </p>
      </header>

      <section className="section">
        <div className="stat-grid">
          <StatCard 
            label="Model AUC" 
            value="0.97" 
            icon={Brain} 
          />
          <StatCard 
            label="Decision Threshold" 
            value="5%" 
            icon={Percent} 
          />
          <StatCard 
            label="False-Negative Cost" 
            value="10×" 
            icon={Warning} 
          />
        </div>
      </section>

      <section className="section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <Link to="/predict" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ 
                flexShrink: 0, 
                width: 56, 
                height: 56, 
                borderRadius: '12px', 
                background: 'var(--color-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}>
                <Brain size={28} weight="fill" />
              </div>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
                  Score a Patient
                </h2>
                <p style={{ margin: 0, color: 'var(--color-muted-fg)', lineHeight: 1.5 }}>
                  Enter patient demographics and clinical details to get an instant risk probability.
                </p>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>
              <span>Score patient</span>
              <ArrowRight size={18} />
            </div>
          </Link>

          <Link to="/batch" className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ 
                flexShrink: 0, 
                width: 56, 
                height: 56, 
                borderRadius: '12px', 
                background: 'var(--color-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}>
                <Upload size={28} weight="fill" />
              </div>
              <div>
                <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
                  Upload Batch CSV
                </h2>
                <p style={{ margin: 0, color: 'var(--color-muted-fg)', lineHeight: 1.5 }}>
                  Upload a CSV file with multiple patients to score them all at once and download results.
                </p>
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>
              <span>Upload CSV</span>
              <ArrowRight size={18} />
            </div>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <h2 style={{ margin: '0 0 16px', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-foreground)' }}>
            Model Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.9375rem', color: 'var(--color-muted-fg)' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>Algorithm</p>
              <p style={{ margin: 0 }}>8-parameter logistic regression</p>
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
              <p style={{ margin: '0 0 4px', fontWeight: 700, color: 'var(--color-foreground)' }}>Training data</p>
              <p style={{ margin: 0 }}>2,000 synthetic EHR records</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}