import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Dashboard', path: '/surveyee/dashboard' },
  { icon: '📋', label: 'Surveys',   path: '/surveyee/surveys'   },
  { icon: '💰', label: 'Wallet',    path: '/surveyee/wallet'    },
  { icon: '👤', label: 'Profile',   path: '/surveyee/dashboard' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid #e5e7eb',
      display: 'flex', justifyContent: 'space-around',
      padding: '10px 0 14px', zIndex: 100,
    }}>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.path;
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              padding: '0 16px',
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: active ? '#2d7a4f' : '#9ca3af' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
