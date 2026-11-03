import { useState } from 'react';
import axios from 'axios';
import { Warning, CheckCircle, User, Building, Calendar, Heart } from '@phosphor-icons/react';
import RiskBadge from '../components/RiskBadge';

const API_URL = 'http://localhost:8000';

export default function Predict() {
  const [formData, setFormData] = useState({
    age: '',
    sex: 'M',
    admit_type: 'ED',
    prior_visits: '',
    has_diabetes: false,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (result) setResult(null);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/predict`, {
        age: parseInt(formData.age, 10),
        sex: formData.sex,
        admit_type: formData.admit_type,
        prior_visits: parseInt(formData.prior_visits, 10),
        has_diabetes: formData.has_diabetes ? 1 : 0,
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      age: '',
      sex: 'M',
      admit_type: 'ED',
      prior_visits: '',
      has_diabetes: false,
    });
    setResult(null);
  };

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px', maxWidth: '720px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-foreground)' }}>
          Score a Patient
        </h1>
        <p style={{ margin: 0, fontSize: '1.125rem', color: 'var(--color-muted-fg)' }}>
          Enter patient details to calculate readmission risk probability.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div>
            <label htmlFor="age" className="label">
              Age <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              className="input"
              placeholder="e.g., 72"
              value={formData.age}
              onChange={handleChange}
              min="18"
              max="90"
              required
              disabled={loading}
              inputMode="numeric"
            />
          </div>

          <div>
            <label htmlFor="prior_visits" className="label">
              Prior Visits <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="number"
              id="prior_visits"
              name="prior_visits"
              className="input"
              placeholder="e.g., 3"
              value={formData.prior_visits}
              onChange={handleChange}
              min="0"
              required
              disabled={loading}
              inputMode="numeric"
            />
          </div>

          <div>
            <label className="label">
              Sex <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div className="radio-group" role="radiogroup" aria-label="Patient sex">
              <label className="radio-option">
                <input
                  type="radio"
                  name="sex"
                  value="F"
                  checked={formData.sex === 'F'}
                  onChange={handleChange}
                  disabled={loading}
                />
                <User size={18} weight="fill" />
                <span>Female</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="sex"
                  value="M"
                  checked={formData.sex === 'M'}
                  onChange={handleChange}
                  disabled={loading}
                />
                <User size={18} weight="fill" />
                <span>Male</span>
              </label>
            </div>
          </div>

          <div>
            <label className="label">
              Admit Type <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div className="radio-group" role="radiogroup" aria-label="Admission type">
              <label className="radio-option">
                <input
                  type="radio"
                  name="admit_type"
                  value="ED"
                  checked={formData.admit_type === 'ED'}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Heart size={18} weight="fill" />
                <span>Emergency</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="admit_type"
                  value="Clinic"
                  checked={formData.admit_type === 'Clinic'}
                  onChange={handleChange}
                  disabled={loading}
                />
                <Building size={18} weight="fill" />
                <span>Clinic</span>
              </label>
            </div>
          </div>

          <div>
            <label className="label">
              Has Diabetes
            </label>
            <div className="toggle">
              <input
                type="checkbox"
                id="has_diabetes"
                name="has_diabetes"
                checked={formData.has_diabetes}
                onChange={handleChange}
                disabled={loading}
              />
              <label htmlFor="has_diabetes" style={{ cursor: 'pointer', fontWeight: 500 }}>
                Yes, patient has diabetes
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ flex: 1, minWidth: '200px' }}
          >
            {loading ? 'Scoring...' : 'Calculate Risk'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={resetForm}
            disabled={loading}
          >
            Clear Form
          </button>
        </div>

        {error && (
          <div style={{ 
            marginTop: '16px', 
            padding: '16px', 
            borderRadius: '10px', 
            background: 'rgba(220, 38, 38, 0.05)', 
            border: '1px solid rgba(220, 38, 38, 0.2)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Warning size={20} weight="fill" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {result && (
        <div className={`result-card fade-in ${result.flagged ? 'high' : 'low'}`} role="alert">
          <div className={`result-icon ${result.flagged ? 'high' : 'low'}`}>
            {result.flagged ? <Warning size={24} weight="fill" /> : <CheckCircle size={24} weight="fill" />}
          </div>
          <div className="result-content">
            <div className={`result-score ${result.flagged ? 'high' : 'low'}`}>
              {Math.round(result.risk_score * 100)}%
            </div>
            <div className={`result-label ${result.flagged ? 'high' : 'low'}`}>
              {result.risk_label} Risk
            </div>
            <p className="result-message">
              {result.flagged 
                ? 'Flag for utilization review — risk score exceeds the 5% cost-sensitive threshold.' 
                : 'Standard monitoring recommended — risk score below the 5% threshold.'}
            </p>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <RiskBadge score={result.risk_score} />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-muted-fg)' }}>
                Threshold: {Math.round(result.threshold_used * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}