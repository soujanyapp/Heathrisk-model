import { Warning, CheckCircle } from '@phosphor-icons/react';

export default function RiskBadge({ score }) {
  const isHigh = score > 0.05;
  return (
    <span className={`badge ${isHigh ? 'badge-high' : 'badge-low'}`}>
      {isHigh ? (
        <>
          <Warning size={14} weight="fill" style={{ marginRight: 6 }} />
          HIGH ({Math.round(score * 100)}%)
        </>
      ) : (
        <>
          <CheckCircle size={14} weight="fill" style={{ marginRight: 6 }} />
          LOW ({Math.round(score * 100)}%)
        </>
      )}
    </span>
  );
}