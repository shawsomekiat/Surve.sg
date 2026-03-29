import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: string;
  icon: string;
  description: string;
  amount: number;
  date: string;
}

const transactions: Transaction[] = [
  { id: '1', icon: '📋', description: 'Fitness & Health Habits', amount: 3.50, date: '3 Jan' },
  { id: '2', icon: '📋', description: 'Hawker Centre Dining Survey', amount: 2.00, date: '4 Jan' },
  { id: '3', icon: '📋', description: 'Morning Coffee Habits', amount: 1.80, date: '4 Jan' },
  { id: '4', icon: '📺', description: 'Watch & Earn Ad', amount: 0.10, date: '4 Jan' },
  { id: '5', icon: '📺', description: 'Watch & Earn Ad', amount: 0.10, date: '4 Jan' },
  { id: '6', icon: '💸', description: 'Withdrawal - PayNow', amount: -8.00, date: '2 Jan' },
  { id: '7', icon: '🎁', description: 'Sign-up Bonus', amount: 1.60, date: '1 Jan' },
];

const WITHDRAW_METHODS = [
  { id: 'paynow', icon: '📱', label: 'PayNow', desc: 'Instant transfer' },
  { id: 'bank', icon: '🏦', label: 'Bank Transfer', desc: '1-2 business days' },
  { id: 'grabpay', icon: '🟢', label: 'GrabPay', desc: 'Instant transfer' },
];

export default function Wallet() {
  const navigate = useNavigate();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('paynow');
  const [amount, setAmount] = useState('');
  const [withdrawDone, setWithdrawDone] = useState(false);

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val < 5) return;
    setWithdrawDone(true);
  };

  return (
    <div style={{ background: '#f0f2f0', minHeight: '100vh', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/surveyee/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#374151' }}
          >
            ← Back
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0d1117' }}>My Wallet</h2>
        </div>

        {/* Wallet Card */}
        <div style={{
          background: '#0d1117', borderRadius: '16px', padding: '24px',
          marginBottom: '24px', color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>📋</span>
            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>Balance</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', marginBottom: '4px' }}>S$11.10</div>
          <div style={{ fontSize: '14px', color: '#22c55e', fontWeight: 600, marginBottom: '20px' }}>☕ 6 kopis!</div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Earned</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>S$11.10</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Done</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>3</div>
            </div>
          </div>
          <button
            onClick={() => { setShowWithdraw(true); setWithdrawDone(false); setAmount(''); }}
            style={{
              width: '100%', background: '#2d7a4f', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '13px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Withdraw
          </button>
        </div>

        {/* Transaction History */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Transaction History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {transactions.map((tx, i) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '13px 0',
                  borderBottom: i < transactions.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#f9fafb', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                }}>
                  {tx.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0d1117', marginBottom: '2px' }}>{tx.description}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>{tx.date}</div>
                </div>
                <div style={{
                  fontSize: '14px', fontWeight: 700,
                  color: tx.amount > 0 ? '#22c55e' : '#ef4444',
                }}>
                  {tx.amount > 0 ? '+' : ''}S${tx.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid #e5e7eb',
        display: 'flex', justifyContent: 'space-around',
        padding: '10px 0 14px', zIndex: 100,
      }}>
        {[
          { icon: '🏠', label: 'Dashboard', path: '/surveyee/dashboard', active: false },
          { icon: '📋', label: 'Surveys', path: '/surveyee/dashboard', active: false },
          { icon: '💰', label: 'Wallet', path: '/surveyee/wallet', active: true },
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
            <span style={{ fontSize: '10px', fontWeight: 600, color: item.active ? '#2d7a4f' : '#9ca3af' }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px 20px 0 0', padding: '28px 24px 36px',
            width: '100%', maxWidth: '480px',
          }}>
            {withdrawDone ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Withdrawal Requested!</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                  S${parseFloat(amount).toFixed(2)} will be transferred shortly.
                </p>
                <button
                  onClick={() => setShowWithdraw(false)}
                  style={{
                    background: '#2d7a4f', color: '#fff', border: 'none',
                    borderRadius: '12px', padding: '14px', fontSize: '15px',
                    fontWeight: 600, cursor: 'pointer', width: '100%',
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Withdraw Funds</h3>
                  <button
                    onClick={() => setShowWithdraw(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9ca3af' }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {WITHDRAW_METHODS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                        border: selectedMethod === m.id ? '2px solid #2d7a4f' : '2px solid #e5e7eb',
                        background: selectedMethod === m.id ? '#f0fdf4' : '#fff',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{m.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{m.label}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{m.desc}</div>
                      </div>
                      {selectedMethod === m.id && (
                        <span style={{ color: '#2d7a4f', fontWeight: 700 }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                    Amount (min S$5)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      fontWeight: 600, color: '#374151', fontSize: '15px',
                    }}>S$</span>
                    <input
                      type="number"
                      min="5"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%', padding: '13px 14px 13px 36px',
                        borderRadius: '10px', border: '2px solid #e5e7eb',
                        fontSize: '15px', outline: 'none', fontFamily: 'Inter, sans-serif',
                      }}
                    />
                  </div>
                  {amount && parseFloat(amount) < 5 && (
                    <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>Minimum withdrawal is S$5</p>
                  )}
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 5}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                    fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                    background: amount && parseFloat(amount) >= 5 ? '#2d7a4f' : '#d1d5db',
                    color: '#fff',
                  }}
                >
                  Withdraw
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}