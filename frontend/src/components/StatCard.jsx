export default function StatCard({ label, value, icon }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ 
          flexShrink: 0, 
          width: 44, 
          height: 44, 
          borderRadius: '10px', 
          background: 'var(--color-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)'
        }}>
          {icon && <icon size={22} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: 'var(--color-muted-fg)', fontWeight: 500 }}>
            {label}
          </p>
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-foreground)', lineHeight: 1.2 }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}