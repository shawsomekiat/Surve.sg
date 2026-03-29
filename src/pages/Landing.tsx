import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#0d1117', letterSpacing: '-1px' }}>
          Surve<span style={{ color: '#ef4444' }}>.</span>
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px', marginTop: '6px' }}>
          let the world know you
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginTop: '40px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '760px',
      }}>
        {/* Surveyee Card */}
        <div style={{
          background: '#fff',
          border: '2px solid #2d7a4f',
          borderRadius: '16px',
          padding: '32px 28px',
          flex: '1 1 300px',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0d1117', marginBottom: '8px' }}>
              I want to take surveys
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Earn rewards by sharing your opinions</p>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Earn S$1–S$10 per survey',
              'Flexible timing, work from anywhere',
              'Fast withdrawals, min S$5',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#374151' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '11px', color: '#2d7a4f', fontWeight: 700,
                }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/surveyee/login')}
            style={{
              background: '#2d7a4f', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '14px 20px',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              marginTop: 'auto',
            }}
          >
            Continue as Surveyee →
          </button>
        </div>

        {/* Surveyor Card */}
        <div style={{
          background: '#fff',
          border: '2px solid #0d1117',
          borderRadius: '16px',
          padding: '32px 28px',
          flex: '1 1 300px',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0d1117', marginBottom: '8px' }}>
              I want to create surveys
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Collect quality data from real people</p>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Target specific demographics',
              'Real-time response analytics',
              'Pay only for completed surveys',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#374151' }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '11px', color: '#0d1117', fontWeight: 700,
                }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/surveyor/login')}
            style={{
              background: '#0d1117', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '14px 20px',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              marginTop: 'auto',
            }}
          >
            Continue as Surveyor →
          </button>
        </div>
      </div>

      <p style={{ marginTop: '28px', fontSize: '13px', color: '#9ca3af' }}>
        You can change your account type anytime in settings
      </p>
    </div>
  );
}