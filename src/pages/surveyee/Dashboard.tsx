import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { surveys } from '../../data/surveys';
import { useWallet } from '../../context/WalletContext';

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

export default function SurveyeeDashboard() {
  const navigate = useNavigate();
  const { balance, surveysCompleted, completedSurveyIds, addAdEarning } = useWallet();
  const [minReward, setMinReward] = useState(0);
  const [maxDuration, setMaxDuration] = useState(Infinity);
  const [adModal, setAdModal] = useState<'idle' | 'watching' | 'done'>('idle');
  const [adCountdown, setAdCountdown] = useState(30);
  const [adProgress, setAdProgress] = useState(0);

  const filteredSurveys = surveys.filter(
    (s) => s.rewardSGD >= minReward && s.durationMins <= maxDuration
  );

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

  const clearFilters = () => {
    setMinReward(0);
    setMaxDuration(Infinity);
  };

  const hasFilters = minReward > 0 || maxDuration < Infinity;

  return (
    <div style={{ background: '#f0f2f0', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0d1117' }}>
            Surve<span style={{ color: '#ef4444' }}>.</span>
          </h1>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#0d1117', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700,
          }}>A</div>
        </div>

        {/* Wallet Card */}
        <div style={{
          background: '#0d1117', borderRadius: '16px', padding: '24px',
          marginBottom: '16px', color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>📋</span>
            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>Balance</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '4px' }}>
            S${balance.toFixed(2)}
          </div>
          <div style={{ fontSize: '14px', color: '#22c55e', fontWeight: 600, marginBottom: '20px' }}>
            ☕ {Math.floor(balance / 1.85)} kopis!
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '10px',
              padding: '12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Earned</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>S${balance.toFixed(2)}</div>
            </div>
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '10px',
              padding: '12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Done</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{surveysCompleted}</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/surveyee/wallet')}
            style={{
              width: '100%', background: '#2d7a4f', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '13px', fontSize: '15px',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            Withdraw
          </button>
        </div>

        {/* Watch & Earn Card */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '20px',
          border: '2px dashed #2d7a4f', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: '#dcfce7', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '22px', flexShrink: 0,
          }}>📺</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>Watch & Earn</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Watch a 30-second ad and earn S$0.10</div>
          </div>
          <button
            onClick={handleWatchAd}
            style={{
              background: '#2d7a4f', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '9px 14px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
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
                onClick={clearFilters}
                style={{
                  background: 'none', border: 'none', color: '#ef4444',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0,
                }}
              >
                × Clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={minReward}
              onChange={(e) => setMinReward(Number(e.target.value))}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: '10px',
                border: '1.5px solid #e5e7eb', background: '#fff',
                fontSize: '13px', fontWeight: 500, color: '#374151',
                cursor: 'pointer', outline: 'none',
              }}
            >
              {MIN_REWARD_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select
              value={maxDuration}
              onChange={(e) => setMaxDuration(Number(e.target.value))}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: '10px',
                border: '1.5px solid #e5e7eb', background: '#fff',
                fontSize: '13px', fontWeight: 500, color: '#374151',
                cursor: 'pointer', outline: 'none',
              }}
            >
              {MAX_DURATION_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Survey Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {filteredSurveys.map((survey) => {
            const done = completedSurveyIds.includes(survey.id);
            return (
            <div
              key={survey.id}
              style={{
                background: '#fff', borderRadius: '14px',
                padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                display: 'flex', flexDirection: 'column', gap: '8px',
                opacity: done ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0d1117', lineHeight: '1.3' }}>{survey.title}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: done ? '#9ca3af' : '#22c55e', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {done ? '✓ Done' : `S${survey.rewardSGD.toFixed(2)}`}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.4' }}>{survey.description}</p>
              <span style={{
                display: 'inline-block', background: '#f3f4f6', borderRadius: '6px',
                padding: '2px 8px', fontSize: '10px', color: '#6b7280', fontWeight: 500,
                alignSelf: 'flex-start',
              }}>
                {survey.audienceTag}
              </span>
              <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                <span>⏰ {survey.durationMins}min</span>
                <span>👥 {survey.targetResponses - survey.currentResponses} spots</span>
              </div>
              <button
                onClick={() => !done && navigate(`/surveyee/survey/${survey.id}`)}
                disabled={done}
                style={{
                  background: done ? '#f3f4f6' : '#0d1117',
                  color: done ? '#9ca3af' : '#fff',
                  border: 'none', borderRadius: '8px', padding: '10px', fontSize: '12px',
                  fontWeight: 600, cursor: done ? 'default' : 'pointer',
                  width: '100%', marginTop: '4px',
                }}
              >
                {done ? 'Completed ✓' : 'Start Survey ›'}
              </button>
            </div>
            );
          })}
        </div>

        {filteredSurveys.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>No surveys match your filters</div>
            <div style={{ fontSize: '13px' }}>Try adjusting your filter settings</div>
          </div>
        )}
      </div>

      {/* Ad Modal */}
      {adModal !== 'idle' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '32px 28px',
            width: '100%', maxWidth: '360px', textAlign: 'center',
          }}>
            {adModal === 'watching' ? (
              <>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📺</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Watching Ad...</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
                  {adCountdown}s remaining
                </p>
                <div style={{ background: '#f3f4f6', borderRadius: '8px', height: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{
                    height: '100%', background: '#2d7a4f', borderRadius: '8px',
                    width: `${adProgress}%`, transition: 'width 1s linear',
                  }} />
                </div>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>Please wait for the ad to finish</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>S$0.10 added!</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                  Reward credited to your wallet
                </p>
                <button
                  onClick={() => setAdModal('idle')}
                  style={{
                    background: '#2d7a4f', color: '#fff', border: 'none',
                    borderRadius: '10px', padding: '13px 32px', fontSize: '15px',
                    fontWeight: 600, cursor: 'pointer', width: '100%',
                  }}
                >
                  Awesome!
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #e5e7eb',
        display: 'flex', justifyContent: 'space-around',
        padding: '10px 0 14px', zIndex: 100,
      }}>
        {[
          { icon: '🏠', label: 'Dashboard', path: '/surveyee/dashboard', active: true },
          { icon: '📋', label: 'Surveys', path: '/surveyee/dashboard', active: false },
          { icon: '💰', label: 'Wallet', path: '/surveyee/wallet', active: false },
          { icon: '👤', label: 'Profile', path: '/surveyee/dashboard', active: false },
        ].map((item) => (
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
            <span style={{
              fontSize: '10px', fontWeight: 600,
              color: item.active ? '#2d7a4f' : '#9ca3af',
            }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}