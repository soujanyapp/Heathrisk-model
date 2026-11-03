import { NavLink } from 'react-router-dom';
import { Brain } from '@phosphor-icons/react';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/predict', label: 'Predict' },
  { path: '/batch', label: 'Batch' },
  { path: '/metrics', label: 'Metrics' },
];

export default function NavBar() {
  return (
    <nav className="card" style={{ 
      margin: '16px 24px', 
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <NavLink to="/" className="nav-link logo-link" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px',
        fontSize: '1.25rem',
        fontWeight: 700,
        color: 'var(--color-primary)',
        textDecoration: 'none',
        borderBottom: 'none',
        padding: '0'
      }}>
        <Brain weight="fill" size={28} style={{ color: 'var(--color-primary)' }} />
        <span>HealthRisk</span>
      </NavLink>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}