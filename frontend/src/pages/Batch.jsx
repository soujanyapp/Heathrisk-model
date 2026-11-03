import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Upload, Download, CheckCircle, WarningCircle, FileText, Trash } from '@phosphor-icons/react';
import RiskBadge from '../components/RiskBadge';

const API_URL = 'http://localhost:8000';

export default function Batch() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a CSV file.');
      }
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a CSV file.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API_URL}/predict/batch`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(response.data.predictions);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process batch. Please check your CSV format.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!results || results.length === 0) return;

    const headers = [
      'row_index',
      'age',
      'sex',
      'admit_type',
      'prior_visits',
      'has_diabetes',
      'risk_score',
      'risk_label',
      'flagged',
    ];

    const rows = results.map((r, i) => [
      i + 1,
      r.age || '',
      r.sex || '',
      r.admit_type || '',
      r.prior_visits || '',
      r.has_diabetes || '',
      r.risk_score,
      r.risk_label,
      r.flagged ? 'Yes' : 'No',
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `healthrisk_results_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const flaggedCount = results ? results.filter(r => r.flagged).length : 0;
  const totalCount = results ? results.length : 0;

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '48px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--color-foreground)' }}>
          Batch CSV Upload
        </h1>
        <p style={{ margin: 0, fontSize: '1.125rem', color: 'var(--color-muted-fg)' }}>
          Upload a CSV file with multiple patients to score them all at once.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '24px' }}>
        <div 
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); }}}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={loading}
            aria-label="Upload CSV file"
          />
          <Upload size={48} weight="fill" style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
          <p style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '8px', color: 'var(--color-foreground)' }}>
            {file ? `Selected: ${file.name}` : 'Drag & drop a CSV file here, or click to browse'}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted-fg)' }}>
            Required columns: age, sex, admit_type, prior_visits, has_diabetes
          </p>
        </div>

        {file && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ flex: 1, minWidth: '200px', fontSize: '0.875rem', color: 'var(--color-muted-fg)' }}>
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Scoring...' : 'Score All Patients'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={loading}
            >
              <Trash size={18} weight="fill" style={{ marginRight: 6 }} />
              Clear
            </button>
          </div>
        )}

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
            <WarningCircle size={20} weight="fill" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {results && results.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div className="summary-bar" style={{ marginBottom: 0 }}>
              <div className="summary-item">
                <div className="summary-value">{totalCount}</div>
                <div className="summary-label">Total Patients</div>
              </div>
              <div className="summary-item">
                <div className="summary-value" style={{ color: 'var(--color-danger)' }}>{flaggedCount}</div>
                <div className="summary-label">Flagged HIGH RISK</div>
              </div>
              <div className="summary-item">
                <div className="summary-value" style={{ color: 'var(--color-success)' }}>{totalCount - flaggedCount}</div>
                <div className="summary-label">Standard Monitoring</div>
              </div>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={handleDownload}
              disabled={loading}
            >
              <Download size={18} weight="fill" style={{ marginRight: 6 }} />
              Download Results CSV
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Age</th>
                  <th>Sex</th>
                  <th>Admit Type</th>
                  <th>Prior Visits</th>
                  <th>Diabetes</th>
                  <th>Risk Score</th>
                  <th>Risk Label</th>
                  <th>Flagged</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.age ?? ''}</td>
                    <td>{row.sex ?? ''}</td>
                    <td>{row.admit_type ?? ''}</td>
                    <td>{row.prior_visits ?? ''}</td>
                    <td>{row.has_diabetes === 1 || row.has_diabetes === true ? 'Yes' : 'No'}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {Math.round((row.risk_score ?? 0) * 100)}%
                    </td>
                    <td>
                      <span className={`badge ${row.flagged ? 'badge-high' : 'badge-low'}`}>
                        {row.risk_label ?? ''}
                      </span>
                    </td>
                    <td>
                      <RiskBadge score={row.risk_score ?? 0} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}