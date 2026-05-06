import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getScopedStorageKey } from '../../utils/userStorage';

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: '12px',
  border: '1.5px solid #e5e7eb',
  fontSize: '15px',
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#374151',
  background: '#fff',
  appearance: 'none',
  cursor: 'pointer',
};

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

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#374151',
  display: 'block',
  marginBottom: '8px',
};

interface ProfileForm {
  fullName: string;
  age: string;
  gender: string;
  education: string;
  employment: string;
  interests: string;
}

const EMPTY_FORM: ProfileForm = {
  fullName: '',
  age: '',
  gender: '',
  education: '',
  employment: '',
  interests: '',
};

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profileKey = getScopedStorageKey('survesg_profile', user);
  const [form, setForm] = useState<ProfileForm>(() => {
    try {
      const stored = localStorage.getItem(profileKey);
      if (!stored) return EMPTY_FORM;
      return {
        ...EMPTY_FORM,
        ...JSON.parse(stored),
      };
    } catch {
      return EMPTY_FORM;
    }
  });
  const [error, setError] = useState('');

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    if (!form.fullName.trim()) { setError('Full name is required.'); return; }
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 13 || Number(form.age) > 100) {
      setError('Enter a valid age between 13 and 100.'); return;
    }
    if (!form.gender) { setError('Please select your gender.'); return; }
    if (!form.education) { setError('Please select your education level.'); return; }
    if (!form.employment) { setError('Please select your employment status.'); return; }

    localStorage.setItem(profileKey, JSON.stringify(form));
    navigate('/surveyee/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6f5',
      display: 'flex',
      flexDirection: 'column',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto', paddingTop: '48px', paddingBottom: '60px' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/surveyee/login')}
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
            Profile Setup
          </h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
            Help us match you with the right surveys.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Full Name */}
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={set('fullName')}
              placeholder="John Doe"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#2d7a4f')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Age */}
          <div>
            <label style={labelStyle}>Age</label>
            <input
              type="number"
              value={form.age}
              onChange={set('age')}
              placeholder="25"
              min="13"
              max="100"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#2d7a4f')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Gender */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Gender</label>
            <select value={form.gender} onChange={set('gender')} style={selectStyle}
              onFocus={(e) => (e.target.style.borderColor = '#2d7a4f')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
            <span style={{
              position: 'absolute', right: '16px', bottom: '15px',
              fontSize: '12px', color: '#9ca3af', pointerEvents: 'none',
            }}>∨</span>
          </div>

          {/* Education */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Education Level</label>
            <select value={form.education} onChange={set('education')} style={selectStyle}
              onFocus={(e) => (e.target.style.borderColor = '#2d7a4f')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            >
              <option value="">Select education</option>
              <option value="primary">Primary School</option>
              <option value="secondary">Secondary School / O-Levels</option>
              <option value="ite">ITE</option>
              <option value="diploma">Polytechnic / Diploma</option>
              <option value="alevels">Junior College / A-Levels</option>
              <option value="degree">University Degree</option>
              <option value="postgrad">Postgraduate</option>
            </select>
            <span style={{
              position: 'absolute', right: '16px', bottom: '15px',
              fontSize: '12px', color: '#9ca3af', pointerEvents: 'none',
            }}>∨</span>
          </div>

          {/* Employment */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>Employment Status</label>
            <select value={form.employment} onChange={set('employment')} style={selectStyle}
              onFocus={(e) => (e.target.style.borderColor = '#2d7a4f')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            >
              <option value="">Select status</option>
              <option value="student">Student</option>
              <option value="full-time">Full-time Employed</option>
              <option value="part-time">Part-time Employed</option>
              <option value="self-employed">Self-employed / Freelance</option>
              <option value="unemployed">Unemployed / Job Seeking</option>
              <option value="retired">Retired</option>
              <option value="homemaker">Homemaker</option>
            </select>
            <span style={{
              position: 'absolute', right: '16px', bottom: '15px',
              fontSize: '12px', color: '#9ca3af', pointerEvents: 'none',
            }}>∨</span>
          </div>

          {/* Interests */}
          <div>
            <label style={labelStyle}>Interests <span style={{ color: '#9ca3af', fontWeight: 400 }}>(comma separated)</span></label>
            <textarea
              value={form.interests}
              onChange={set('interests')}
              placeholder="Tech, Sports, Music, Food..."
              rows={3}
              style={{
                ...inputStyle,
                resize: 'none',
                lineHeight: '1.5',
              } as React.CSSProperties}
              onFocus={(e) => (e.target.style.borderColor = '#2d7a4f')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>
              This helps us show you the most relevant surveys.
            </p>
          </div>

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
              width: '100%', padding: '16px',
              background: '#2d7a4f', color: '#fff',
              border: 'none', borderRadius: '14px',
              fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              marginTop: '4px',
            }}
          >
            Start Earning →
          </button>

          <button
            type="button"
            onClick={() => navigate('/surveyee/dashboard')}
            style={{
              width: '100%', padding: '13px',
              background: 'transparent', color: '#9ca3af',
              border: 'none', borderRadius: '14px',
              fontSize: '14px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
