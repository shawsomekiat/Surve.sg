import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import BottomNav from '../../components/BottomNav';

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

const WITHDRAW_METHODS = [
  { id: 'paynow', icon: '📱', label: 'PayNow', desc: 'Instant transfer' },
  { id: 'bank', icon: '🏦', label: 'Bank Transfer', desc: '1-2 business days' },
  { id: 'grabpay', icon: '🟢', label: 'GrabPay', desc: 'Instant transfer' },
];

export default function Wallet() {
  const navigate = useNavigate();
  const { balance, totalEarned, surveysCompleted, transactions, withdraw } = useWallet();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('paynow');
  const [amount, setAmount] = useState('');
  const [withdrawDone, setWithdrawDone] = useState(false);

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val <= 0 || val > balance) return;
    const method = WITHDRAW_METHODS.find((m) => m.id === selectedMethod)?.label ?? selectedMethod;
    withdraw(val, method);
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
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '13px' }}>
              No transactions yet. Complete a survey to get started!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                  <div style={{ fontSize: '14px', fontWeight: 700, color: tx.amount > 0 ? '#22c55e' : '#ef4444' }}>
                    {tx.amount > 0 ? '+' : ''}S${Math.abs(tx.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />

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
                      {selectedMethod === m.id && <span style={{ color: '#2d7a4f', fontWeight: 700 }}>✓</span>}
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                    Amount (available: S${balance.toFixed(2)})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      fontWeight: 600, color: '#374151', fontSize: '15px',
                    }}>S$</span>
                    <input
                      type="number"
                      min="0.01"
                      max={balance}
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      style={{
                        width: '100%', padding: '13px 14px 13px 36px',
                        borderRadius: '10px', border: '2px solid #e5e7eb',
                        fontSize: '15px', outline: 'none', fontFamily: 'Inter, sans-serif',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  {amount && parseFloat(amount) > balance && (
                    <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>Amount exceeds your balance</p>
                  )}
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                    fontSize: '15px', fontWeight: 600, cursor: 'pointer',
                    background: amount && parseFloat(amount) > 0 && parseFloat(amount) <= balance ? '#2d7a4f' : '#d1d5db',
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
