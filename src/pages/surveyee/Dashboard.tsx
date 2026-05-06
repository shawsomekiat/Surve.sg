import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import BottomNav from '../../components/BottomNav';
import { getScopedStorageKey } from '../../utils/userStorage';

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
  let bestFood = SG_FOODS[0], bestCount = 0, bestCoverage = 0;
  for (const food of SG_FOODS) {
    const count = Math.floor(balance / food.price);
    if (count < 1 || count > 6) continue;
    const coverage = (count * food.price) / balance;
    if (coverage > bestCoverage) { bestCoverage = coverage; bestFood = food; bestCount = count; }
  }
  if (bestCount === 0) { bestCount = Math.floor(balance / 4.50); bestFood = SG_FOODS[0]; }
  return `${bestFood.emoji} ${bestCount} ${bestCount === 1 ? bestFood.name : bestFood.plural}!`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SurveyeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, totalEarned, surveysCompleted, addAdEarning, addSurveyEarning } = useWallet();
  const verificationKey = getScopedStorageKey('survesg_singpass_verified', user);

  const [isVerified, setIsVerified] = useState(localStorage.getItem(verificationKey) === 'true');

  const [adModal, setAdModal] = useState<'idle' | 'watching' | 'done'>('idle');
  const [adCountdown, setAdCountdown] = useState(30);
  const [adProgress, setAdProgress] = useState(0);
  const [singpassModal, setSingpassModal] = useState<'idle' | 'connecting' | 'verifying' | 'done'>('idle');

  useEffect(() => {
    setIsVerified(localStorage.getItem(verificationKey) === 'true');
  }, [verificationKey]);

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
      localStorage.setItem(verificationKey, 'true');
      setIsVerified(true);
      addSurveyEarning('__singpass_bonus__', 'SingPass Verification Bonus', 0.50);
    }, 4000);
  };

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
              <span style={{ background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>
                ✓ Verified
              </span>
            )}
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
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
              <div style={{ fontSize: '18px', fontWeight: 700 }}>S${totalEarned.toFixed(2)}</div>
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

        {/* SingPass Banner */}
        {!isVerified && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '18px 20px', border: '2px solid #e0e7ff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🪪</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px', color: '#0d1117' }}>Verify with SingPass</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Unlock verified-only surveys + earn S$0.50 bonus</div>
            </div>
            <button
              onClick={() => setSingpassModal('connecting')}
              style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}
            >
              Verify Now
            </button>
          </div>
        )}

        {/* Watch & Earn */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '2px dashed #2d7a4f', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
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

        {/* Quick link to surveys */}
        <button
          onClick={() => navigate('/surveyee/surveys')}
          style={{ width: '100%', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '22px' }}>📋</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0d1117' }}>Browse Surveys</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>See available &amp; completed surveys</div>
            </div>
          </div>
          <span style={{ fontSize: '18px', color: '#9ca3af' }}>›</span>
        </button>
      </div>

      {/* Ad Modal */}
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

      {/* SingPass Modal */}
      {singpassModal !== 'idle' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '36px 28px', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
            {singpassModal === 'done' ? (
              <>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px' }}>✓</div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0d1117', marginBottom: '8px' }}>Identity Verified!</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '6px' }}>Your SingPass identity has been confirmed.</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#22c55e', marginBottom: '24px' }}>S$0.50 bonus added to your wallet 🎉</p>
                <button onClick={() => setSingpassModal('idle')} style={{ background: '#2d7a4f', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                  Start Earning
                </button>
              </>
            ) : (
              <>
                <div style={{ background: '#e63946', borderRadius: '14px', padding: '14px 20px', display: 'inline-block', marginBottom: '20px' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.5px' }}>Sing<span style={{ color: '#ffd166' }}>Pass</span></span>
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
                {singpassModal === 'connecting' && (
                  <button onClick={handleSingpassVerify} style={{ marginTop: '16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Continue with SingPass →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
