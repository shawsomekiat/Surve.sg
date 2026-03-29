import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type Mode = 'signin' | 'signup';
type ContactMethod = 'email' | 'phone';

export default function SurveyorLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    company: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const contactValue = contactMethod === 'email' ? form.email : form.phone;

  const validate = () => {
    if (!form.company.trim()) return 'Company name is required.';
    if (!contactValue.trim()) return `${contactMethod === 'email' ? 'Email address' : 'Phone number'} is required.`;
    if (contactMethod === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue))
      return 'Enter a valid email address.';
    if (contactMethod === 'phone' && !/^\+?[\d\s\-()]{8,15}$/.test(contactValue))
      return 'Enter a valid phone number.';
    if (!form.password) return 'Password is required.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (mode === 'signup' && form.password !== form.confirmPassword)
      return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }
    login('surveyor', form.company.trim(), contactValue.trim());
    navigate('/surveyor/dashboard');
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1.5px solid #e5e7eb',
    fontSize: '15px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0d1117',
    background: '#fff',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6f5',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', paddingTop: '48px', paddingBottom: '40px' }}>

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '22px', color: '#374151', padding: '0',
            marginBottom: '32px', display: 'block', lineHeight: 1,
          }}
        >
          ‹
        </button>

        {/* Heading */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#0d1117', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
            {mode === 'signin' ? 'Log in to your surveyor dashboard' : 'Start collecting survey insights'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Company Name */}
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
              Company Name
            </label>
            <input
              type="text"
              value={form.company}
              onChange={set('company')}
              placeholder="e.g. Acne Tech Pte Ltd"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#0d1117')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Contact toggle + input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {mode === 'signin' ? 'Sign in with' : 'Contact'}
              </label>
              {/* Email / Phone pill */}
              <div style={{
                display: 'inline-flex', background: '#f3f4f6',
                borderRadius: '8px', padding: '3px', gap: '2px',
              }}>
                {(['email', 'phone'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setContactMethod(m); setError(''); }}
                    style={{
                      padding: '4px 12px', border: 'none', borderRadius: '6px',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      background: contactMethod === m ? '#0d1117' : 'transparent',
                      color: contactMethod === m ? '#fff' : '#6b7280',
                      transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {m === 'email' ? 'Email' : 'Phone'}
                  </button>
                ))}
              </div>
            </div>

            {contactMethod === 'email' ? (
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@company.com"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#0d1117')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  padding: '14px 14px', borderRadius: '12px',
                  border: '1.5px solid #e5e7eb', fontSize: '15px',
                  color: '#374151', fontWeight: 600, background: '#f9fafb',
                  whiteSpace: 'nowrap', lineHeight: 1,
                }}>
                  +65
                </span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="9123 4567"
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={(e) => (e.target.style.borderColor = '#0d1117')}
                  onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Password</label>
              {mode === 'signin' && (
                <span style={{ fontSize: '13px', color: '#2d7a4f', fontWeight: 600, cursor: 'pointer' }}>
                  Forgot password?
                </span>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: '48px' }}
                onFocus={(e) => (e.target.style.borderColor = '#0d1117')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '15px', color: '#9ca3af', padding: '2px',
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#0d1117')}
                onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1.5px solid #fecaca',
              borderRadius: '10px', padding: '11px 14px',
              color: '#dc2626', fontSize: '13px', fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            style={{
              width: '100%', padding: '15px',
              background: '#0d1117', color: '#fff',
              border: 'none', borderRadius: '14px',
              fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              marginTop: '4px', letterSpacing: '0.1px',
            }}
          >
            {mode === 'signin' ? 'Login' : 'Create Account'}
          </button>
        </form>

        {/* Mode switch */}
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#9ca3af', marginTop: '24px' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <span
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            style={{ color: '#0d1117', fontWeight: 700, cursor: 'pointer' }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </span>
        </p>

        {/* Surveyee link */}
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
          Taking surveys?{' '}
          <span
            onClick={() => navigate('/surveyee/login')}
            style={{ color: '#2d7a4f', fontWeight: 600, cursor: 'pointer' }}
          >
            Surveyee login
          </span>
        </p>
      </div>
    </div>
  );
}
