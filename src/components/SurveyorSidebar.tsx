import { NavLink, useNavigate } from 'react-router-dom';

interface SurveyorSidebarProps {
  companyName?: string;
}

export default function SurveyorSidebar({ companyName = 'Acne Tech' }: SurveyorSidebarProps) {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Survey Management', path: '/surveyor/dashboard', icon: '📋' },
    { label: 'Quality Review', path: '/surveyor/quality-review', icon: '🛡' },
    { label: 'Analytics', path: '/surveyor/analytics', icon: '📊' },
    { label: 'Hub', path: '/surveyor/hub', icon: '🤝' },
    { label: 'Settings', path: '/surveyor/settings', icon: '⚙️' },
  ];

  return (
    <div style={{
      width: '220px', flexShrink: 0, background: '#fff',
      borderRight: '1px solid #e5e7eb', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', padding: '20px 0',
    }}>
      {/* Logo */}
      <div
        onClick={() => navigate('/surveyor/dashboard')}
        style={{
          margin: '0 16px 24px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}
      >
        <div style={{
          width: '36px', height: '36px', background: '#0d1117',
          borderRadius: '10px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '16px',
        }}>
          S<span style={{ color: '#ef4444' }}>.</span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#0d1117' }}>{companyName}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Surveyor</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', fontSize: '13px', fontWeight: 500,
              textDecoration: 'none', color: isActive ? '#2d7a4f' : '#6b7280',
              background: isActive ? '#f0fdf4' : 'transparent',
              borderRight: isActive ? '3px solid #2d7a4f' : '3px solid transparent',
              transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', padding: '9px', borderRadius: '8px',
            border: '1px solid #e5e7eb', background: '#fff',
            fontSize: '12px', fontWeight: 500, color: '#9ca3af',
            cursor: 'pointer', textAlign: 'center',
          }}
        >
          Switch Role
        </button>
      </div>
    </div>
  );
}