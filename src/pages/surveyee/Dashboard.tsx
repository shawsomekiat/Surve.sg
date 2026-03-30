import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveys } from '../../data/surveys';
import type { Survey } from '../../data/surveys';
import { useWallet } from '../../context/WalletContext';

// ── Urgency helpers ──────────────────────────────────────────────────────────

function getDaysLeft(expiresAt?: string): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function urgencyBadge(daysLeft: number | null): { label: string; bg: string; color: string } | null {
  if (daysLeft === null) return null;
  if (daysLeft <= 0) return null; // expired — filtered out elsewhere
  if (daysLeft === 1) return { label: '🔥 Ends today', bg: '#fef2f2', color: '#dc2626' };
  if (daysLeft === 2) return { label: '⚡ 1 day left', bg: '#fff7ed', color: '#ea580c' };
  if (daysLeft <= 4) return { label: `⏰ ${daysLeft - 1} days left`, bg: '#fefce8', color: '#ca8a04' };
  return null;
}

// ── Demographic matching ─────────────────────────────────────────────────────

interface UserProfile {
  age?: string;
  gender?: string;
  employment?: string;
}

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

  if (t.genders?.length && profile.gender && !t.genders.includes(profile.gender))
    return 'locked_demographic';

  if (t.employment?.length && profile.employment && !t.employment.includes(profile.employment))
    return 'locked_demographic';

  return 'eligible';
}

// ── SG food equivalent motivator ─────────────────────────────────────────────

const SG_FOODS = [
  { name: 'cai fan',          plural: 'cai fan',           emoji: '🍱', price: 4.50 },
  { name: 'nasi lemak',       plural: 'nasi lemak',        emoji: '🍛', price: 3.80 },
  { name: 'ice kachang',      plural: 'ice kachang',       emoji: '🧊', price: 2.80 },
  { name: 'kopi',             plural: 'kopis',             emoji: '☕', price: 1.70 },
  { name: 'curry puff',       plural: 'curry puffs',       emoji: '🥟', price: 1.30 },
  { name: 'plain roti prata', plural: 'plain roti pratas', emoji: '🫓', price: 1.00 },
];

function getFoodEquivalent(balance: number): string {
  if (balance < 1.00) return '🏃 One more survey for your first kopi!';

  let bestFood = SG_FOODS[0];
  let bestCount = 0;
  let bestCoverage = 0;

  for (const food of SG_FOODS) {
    const count = Math.floor(balance / food.price);
    if (count < 1 || count > 6) continue;
    const coverage = (count * food.price) / balance;
    if (coverage > bestCoverage) {
      bestCoverage = coverage;
      bestFood = food;
      bestCount = count;
    }
  }

  if (bestCount === 0) {
    // balance > 6 × cai fan ($27+), just divide by cai fan
    bestCount = Math.floor(balance / 4.50);
    bestFood = SG_FOODS[0];
  }

  const label = bestCount === 1 ? bestFood.name : bestFood.plural;
  return `${bestFood.emoji} ${bestCount} ${label}!`;
}

// ── Filters ──────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function SurveyeeDashboard() {
  const navigate = useNavigate();
  const { balance, surveysCompleted, completedSurveyIds, addAdEarning, addSurveyEarning } = useWallet();

  // Profile + verification from localStorage
  const profile: UserProfile = (() => {
    try { return JSON.parse(localStorage.getItem('survesg_profile') || '{}'); }
    catch { return {}; }
  })();
  const [isVerified, setIsVerified] = useState(
    localStorage.getItem('survesg_singpass_verified') === 'true'
  );

  // Filters
  const [minReward, setMinReward] = useState(0);
  const [maxDuration, setMaxDuration] = useState(Infinity);

  // Ad modal
  const [adModal, setAdModal] = useState<'idle' | 'watching' | 'done'>('idle');
  const [adCountdown, setAdCountdown] = useState(30);
  const [adProgress, setAdProgress] = useState(0);

  // SingPass modal
  const [singpassModal, setSingpassModal] = useState<'idle' | 'connecting' | 'verifying' | 'done'>('idle');

  const handleWatchAd = () => {
    setAdModal('watching');
    setAdCountdown(30);
    setAdProgress(0);
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 1;
      setAdCountdown(30 - elapsed);
      setAdProgress((elapsed / 30) * 100);
      if (elapsed >= 30) {
        clearInterval(interval);
        addAdEarning();
        setAdModal('done');
      }
    }, 1000);
  };

  const handleSingpassVerify = () => {
    setSingpassModal('connecting');
    setTimeout(() => setSingpassModal('verifying'), 2000);
    setTimeout(() => {
      setSingpassModal('done');
      localStorage.setItem('survesg_singpass_verified', 'true');
      setIsVerified(true);
      // S$0.50 verification bonus
      addSurveyEarning('__singpass_bonus__', 'SingPass Verification Bonus', 0.50);
    }, 4000);
  };

  // Build survey list — filter expired, apply reward/duration filters, sort by urgency
  const visibleSurveys = surveys
    .filter((s) => {
      const daysLeft = getDaysLeft(s.expiresAt);
      if (daysLeft !== null && daysLeft <= 0) return false; // expired
      if (s.rewardSGD < minReward) return false;
      if (s.durationMins > maxDuration) return false;
      return true;
    })
    .sort((a, b) => {
      const da = getDaysLeft(a.expiresAt) ?? 999;
      const db = getDaysLeft(b.expiresAt) ?? 999;
      return da - db; // most urgent first
    });

  const hasFilters = minReward > 0 || maxDuration < Infinity;

  return (
    <div style={{ background: '#f0f2f0', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0d1117' }}>
            Surve<span style={{ color: '#ef4444' }}>.</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isVerified && (
              <span style={{
                background: '#dcfce7', color: '#166534', fontSize: '11px',
                fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
              }}>
                ✓ Verified
              </span>
            )}
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#0d1117', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700,
            }}>
              {profile.age ? (profile as { fullName?: string }).fullName?.[0]?.toUpperCase() ?? 'A' : 'A'}
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div style={{ background: '#0d1117', borderRadius: '16px', padding: '24px', marginBottom: '16px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>📋</span>
            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>Balance</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '4px' }}>
            S${balance.toFixed(2)}
          </div>
          <div style={{ fontSize: '14px', color: '#22c55e', fontWeight: 600, marginBottom: '20px' }}>
            {getFoodEquivalent(balance)}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Earned</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>S${balance.toFixed(2)}</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Done</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{surveysCompleted}</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/surveyee/wallet')}
            style={{ width: '100%', background: '#2d7a4f', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
          >
            Withdraw
          </button>
        </div>

        {/* SingPass Verification Banner (shown when not verified) */}
        {!isVerified && (
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '18px 20px',
            border: '2px solid #e0e7ff', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: '#eef2ff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '22px', flexShrink: 0,
            }}>🪪</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px', color: '#0d1117' }}>
                Verify with SingPass
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Unlock verified-only surveys + earn S$0.50 bonus
              </div>
            </div>
            <button
              onClick={() => setSingpassModal('connecting')}
              style={{
                background: '#4f46e5', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '9px 14px', fontSize: '12px',
                fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Verify Now
            </button>
          </div>
        )}

        {/* Watch & Earn Card */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '20px',
          border: '2px dashed #2d7a4f', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>📺</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>Watch & Earn</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Watch a 30-second ad and earn S$0.10</div>
          </div>
          <button
            onClick={handleWatchAd}
            style={{ background: '#2d7a4f', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            ▶ Watch Ad
          </button>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>⚡ Filters</span>
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

        {/* Survey Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {visibleSurveys.map((survey) => {
            const done = completedSurveyIds.includes(survey.id);
            const eligibility = checkEligibility(survey, profile, isVerified);
            const locked = eligibility !== 'eligible';
            const daysLeft = getDaysLeft(survey.expiresAt);
            const badge = urgencyBadge(daysLeft);

            return (
              <div
                key={survey.id}
                style={{
                  background: '#fff', borderRadius: '14px', padding: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  display: 'flex', flexDirection: 'column', gap: '7px',
                  opacity: done || locked ? 0.75 : 1,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Urgency badge */}
                {badge && !done && !locked && (
                  <div style={{
                    background: badge.bg, color: badge.color,
                    fontSize: '10px', fontWeight: 700,
                    padding: '3px 8px', borderRadius: '6px',
                    alignSelf: 'flex-start',
                  }}>
                    {badge.label}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: '#0d1117', lineHeight: '1.3' }}>{survey.title}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, flexShrink: 0,
                    color: done ? '#9ca3af' : locked ? '#9ca3af' : '#22c55e',
                  }}>
                    {done ? '✓' : locked ? '🔒' : `S$${survey.rewardSGD.toFixed(2)}`}
                  </span>
                </div>

                <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.4', margin: 0 }}>{survey.description}</p>

                {/* Audience tag */}
                <span style={{
                  display: 'inline-block', borderRadius: '6px',
                  padding: '2px 8px', fontSize: '10px', fontWeight: 500, alignSelf: 'flex-start',
                  background: survey.targeting?.requiresVerification ? '#eef2ff' : '#f3f4f6',
                  color: survey.targeting?.requiresVerification ? '#4f46e5' : '#6b7280',
                }}>
                  {survey.targeting?.requiresVerification ? '🪪 Verified only' : survey.audienceTag}
                </span>

                <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                  <span>⏰ {survey.durationMins}min</span>
                  <span>👥 {survey.targetResponses - survey.currentResponses} spots</span>
                </div>

                {/* Locked reason */}
                {locked && !done && (
                  <div style={{ fontSize: '11px', color: '#6b7280', background: '#f9fafb', borderRadius: '6px', padding: '6px 8px', lineHeight: '1.4' }}>
                    {eligibility === 'locked_verification'
                      ? <span>Verify with <span style={{ color: '#4f46e5', fontWeight: 700, cursor: 'pointer' }} onClick={() => setSingpassModal('connecting')}>SingPass</span> to unlock</span>
                      : 'Not eligible — age or profile mismatch'
                    }
                  </div>
                )}

                <button
                  onClick={() => !done && !locked && navigate(`/surveyee/survey/${survey.id}`)}
                  disabled={done || locked}
                  style={{
                    background: done ? '#f3f4f6' : locked ? '#f3f4f6' : '#0d1117',
                    color: done || locked ? '#9ca3af' : '#fff',
                    border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px',
                    fontWeight: 600, cursor: done || locked ? 'default' : 'pointer',
                    width: '100%', marginTop: '2px',
                  }}
                >
                  {done ? 'Completed ✓' : locked ? 'Locked' : 'Start Survey ›'}
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
      </div>

      {/* ── Ad Modal ── */}
      {adModal !== 'idle' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px 28px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            {adModal === 'watching' ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📺</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Watching Ad...</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>{adCountdown}s remaining</p>
                <div style={{ background: '#f3f4f6', borderRadius: '8px', height: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ height: '100%', background: '#2d7a4f', borderRadius: '8px', width: `${adProgress}%`, transition: 'width 1s linear' }} />
                </div>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>Please wait for the ad to finish</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>S$0.10 added!</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Reward credited to your wallet</p>
                <button onClick={() => setAdModal('idle')} style={{ background: '#2d7a4f', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 32px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                  Awesome!
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── SingPass Verification Modal ── */}
      {singpassModal !== 'idle' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '36px 28px', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
            {singpassModal === 'done' ? (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px' }}>✓</div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0d1117', marginBottom: '8px' }}>Identity Verified!</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>Your SingPass identity has been confirmed.</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#22c55e', marginBottom: '24px' }}>S$0.50 bonus added to your wallet 🎉</p>
                <button
                  onClick={() => setSingpassModal('idle')}
                  style={{ background: '#2d7a4f', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                >
                  Start Earning
                </button>
              </>
            ) : (
              <>
                {/* SingPass logo mock */}
                <div style={{ background: '#e63946', borderRadius: '14px', padding: '14px 20px', display: 'inline-block', marginBottom: '20px' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.5px' }}>Sing<span style={{ color: '#ffd166' }}>Pass</span></span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0d1117', marginBottom: '8px' }}>
                  {singpassModal === 'connecting' ? 'Connecting to SingPass...' : 'Verifying your identity...'}
                </h3>
                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '28px' }}>
                  {singpassModal === 'connecting'
                    ? 'Securely connecting to the MyInfo portal'
                    : 'Retrieving your verified details from MyInfo'}
                </p>
                {/* Spinner */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  border: '3px solid #f3f4f6', borderTopColor: '#4f46e5',
                  margin: '0 auto 20px',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ fontSize: '11px', color: '#9ca3af' }}>Do not close this window</p>
                {singpassModal === 'connecting' && (
                  <button
                    onClick={() => handleSingpassVerify()}
                    style={{ marginTop: '20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                  >
                    Authorise with SingPass
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', zIndex: 100 }}>
        {[
          { icon: '🏠', label: 'Dashboard', path: '/surveyee/dashboard', active: true },
          { icon: '📋', label: 'Surveys', path: '/surveyee/dashboard', active: false },
          { icon: '💰', label: 'Wallet', path: '/surveyee/wallet', active: false },
          { icon: '👤', label: 'Profile', path: '/surveyee/dashboard', active: false },
        ].map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '0 16px' }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: item.active ? '#2d7a4f' : '#9ca3af' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
