import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveys } from '../../data/surveys';
import type { Survey } from '../../data/surveys';
import { useWallet } from '../../context/WalletContext';
import BottomNav from '../../components/BottomNav';

function getDaysLeft(expiresAt?: string): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function urgencyBadge(daysLeft: number | null): { label: string; bg: string; color: string } | null {
  if (daysLeft === null) return null;
  if (daysLeft <= 0) return null;
  if (daysLeft === 1) return { label: '🔥 Ends today', bg: '#fef2f2', color: '#dc2626' };
  if (daysLeft === 2) return { label: '⚡ 1 day left', bg: '#fff7ed', color: '#ea580c' };
  if (daysLeft <= 4) return { label: `⏰ ${daysLeft - 1} days left`, bg: '#fefce8', color: '#ca8a04' };
  return null;
}

interface UserProfile { age?: string; gender?: string; employment?: string; }
type EligibilityResult = 'eligible' | 'locked_verification' | 'locked_demographic';

function checkEligibility(survey: Survey, profile: UserProfile, isVerified: boolean): EligibilityResult {
  const t = survey.targeting;
  if (!t) return 'eligible';
  if (t.requiresVerification && !isVerified) return 'locked_verification';
  const age = profile.age ? parseInt(profile.age) : null;
  if (age !== null) {
    if (t.ageMin && age < t.ageMin) return 'locked_demographic';
    if (t.ageMax && age > t.ageMax) return 'locked_demographic';
  }
  if (t.genders?.length && profile.gender && !t.genders.includes(profile.gender)) return 'locked_demographic';
  if (t.employment?.length && profile.employment && !t.employment.includes(profile.employment)) return 'locked_demographic';
  return 'eligible';
}

const MIN_REWARD_OPTIONS = [
  { label: 'Any amount', value: 0 },
  { label: 'S$1+', value: 1 },
  { label: 'S$2+', value: 2 },
  { label: 'S$3+', value: 3 },
  { label: 'S$5+', value: 5 },
];

const MAX_DURATION_OPTIONS = [
  { label: 'Any duration', value: Infinity },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
];

export default function SurveysPage() {
  const navigate = useNavigate();
  const { completedSurveyIds, completedAt } = useWallet();

  const profile: UserProfile = (() => {
    try { return JSON.parse(localStorage.getItem('survesg_profile') || '{}'); }
    catch { return {}; }
  })();
  const isVerified = localStorage.getItem('survesg_singpass_verified') === 'true';

  const [minReward, setMinReward] = useState(0);
  const [maxDuration, setMaxDuration] = useState(Infinity);
  const [singpassModal, setSingpassModal] = useState<'idle' | 'connecting' | 'verifying' | 'done'>('idle');

  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const hasFilters = minReward > 0 || maxDuration < Infinity;

  const visibleSurveys = surveys
    .filter((s) => {
      if (completedSurveyIds.includes(s.id)) return false;
      const daysLeft = getDaysLeft(s.expiresAt);
      if (daysLeft !== null && daysLeft <= 0) return false;
      if (s.rewardSGD < minReward) return false;
      if (s.durationMins > maxDuration) return false;
      return true;
    })
    .sort((a, b) => {
      const da = getDaysLeft(a.expiresAt) ?? 999;
      const db = getDaysLeft(b.expiresAt) ?? 999;
      return da - db;
    });

  const recentlyCompleted = surveys.filter((s) => {
    if (!completedSurveyIds.includes(s.id)) return false;
    const ts = completedAt[s.id];
    // No timestamp = completed before tracking was added; treat as recent
    if (ts === undefined) return true;
    return now - ts <= THIRTY_DAYS_MS;
  });

  return (
    <div style={{ background: '#f0f2f0', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Header */}
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0d1117', marginBottom: '20px' }}>
          📋 Surveys
        </h1>

        {/* Filters */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>⚡ Filters</span>
            {hasFilters && (
              <button
                onClick={() => { setMinReward(0); setMaxDuration(Infinity); }}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                × Clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={minReward} onChange={(e) => setMinReward(Number(e.target.value))}
              style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: '#fff', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer', outline: 'none' }}
            >
              {MIN_REWARD_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
            </select>
            <select value={maxDuration} onChange={(e) => setMaxDuration(Number(e.target.value))}
              style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', background: '#fff', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer', outline: 'none' }}
            >
              {MAX_DURATION_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Available survey count */}
        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, marginBottom: '12px' }}>
          {visibleSurveys.length} survey{visibleSurveys.length !== 1 ? 's' : ''} available
        </div>

        {/* Survey Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {visibleSurveys.map((survey) => {
            const eligibility = checkEligibility(survey, profile, isVerified);
            const locked = eligibility !== 'eligible';
            const daysLeft = getDaysLeft(survey.expiresAt);
            const badge = urgencyBadge(daysLeft);

            return (
              <div key={survey.id} style={{
                background: '#fff', borderRadius: '14px', padding: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                display: 'flex', flexDirection: 'column', gap: '7px',
                opacity: locked ? 0.75 : 1,
              }}>
                {badge && !locked && (
                  <div style={{ background: badge.bg, color: badge.color, fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', alignSelf: 'flex-start' }}>
                    {badge.label}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: '#0d1117', lineHeight: '1.3' }}>{survey.title}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, flexShrink: 0, color: locked ? '#9ca3af' : '#22c55e' }}>
                    {locked ? '🔒' : `S$${survey.rewardSGD.toFixed(2)}`}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.4', margin: 0 }}>{survey.description}</p>
                <span style={{
                  display: 'inline-block', borderRadius: '6px', padding: '2px 8px',
                  fontSize: '10px', fontWeight: 500, alignSelf: 'flex-start',
                  background: survey.targeting?.requiresVerification ? '#eef2ff' : '#f3f4f6',
                  color: survey.targeting?.requiresVerification ? '#4f46e5' : '#6b7280',
                }}>
                  {survey.targeting?.requiresVerification ? '🪪 Verified only' : survey.audienceTag}
                </span>
                <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                  <span>⏰ {survey.durationMins}min</span>
                  <span>👥 {survey.targetResponses - survey.currentResponses} spots</span>
                </div>
                {locked && (
                  <div style={{ fontSize: '11px', color: '#6b7280', background: '#f9fafb', borderRadius: '6px', padding: '6px 8px', lineHeight: '1.4' }}>
                    {eligibility === 'locked_verification'
                      ? <span>Verify with <span style={{ color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }} onClick={() => setSingpassModal('connecting')}>SingPass</span> to unlock</span>
                      : 'Not eligible — age or profile mismatch'}
                  </div>
                )}
                <button
                  onClick={() => !locked && navigate(`/surveyee/survey/${survey.id}`)}
                  disabled={locked}
                  style={{
                    background: locked ? '#f3f4f6' : '#0d1117',
                    color: locked ? '#9ca3af' : '#fff',
                    border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px',
                    fontWeight: 600, cursor: locked ? 'default' : 'pointer',
                    width: '100%', marginTop: '2px',
                  }}
                >
                  {locked ? 'Locked' : 'Start Survey ›'}
                </button>
              </div>
            );
          })}
        </div>

        {visibleSurveys.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>No surveys match your filters</div>
            <div style={{ fontSize: '13px' }}>Try adjusting your filter settings</div>
          </div>
        )}

        {/* Completed section */}
        {recentlyCompleted.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#0d1117' }}>✓ Completed</span>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>Visible for 30 days</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentlyCompleted.map((survey) => {
                const ts = completedAt[survey.id];
                const daysAgo = ts !== undefined ? Math.floor((now - ts) / (1000 * 60 * 60 * 24)) : 0;
                return (
                  <div key={survey.id} style={{
                    background: '#fff', borderRadius: '14px', padding: '14px 16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'center', gap: '14px',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: '#f0fdf4', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                    }}>✓</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0d1117', marginBottom: '2px' }}>{survey.title}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {daysAgo === 0 ? 'Completed today' : `Completed ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`}
                        {' · '}S${survey.rewardSGD.toFixed(2)} earned
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>Done</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SingPass Modal */}
      {singpassModal !== 'idle' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '36px 28px', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
            <div style={{ background: '#e63946', borderRadius: '14px', padding: '14px 20px', display: 'inline-block', marginBottom: '20px' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '20px' }}>Sing<span style={{ color: '#ffd166' }}>Pass</span></span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0d1117', marginBottom: '8px' }}>
              {singpassModal === 'connecting' ? 'Connecting to SingPass...' : 'Verifying your identity...'}
            </h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '28px' }}>
              {singpassModal === 'connecting' ? 'Securely connecting to the MyInfo portal' : 'Retrieving your verified details from MyInfo'}
            </p>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #f3f4f6', borderTopColor: '#4f46e5', margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: '11px', color: '#9ca3af' }}>Do not close this window</p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
