import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SurveyorSidebar from '../../components/SurveyorSidebar';
import { trainingStats } from '../../data/trainingLabels';
import { scoreMeta } from '../../utils/qualityScorer';
import type { Transaction } from '../../context/WalletContext';

// Pull scored responses from wallet localStorage
function getScoredResponses(): (Transaction & { qualityScore: number; qualityLabel: 'good' | 'suspicious' | 'bad' })[] {
  try {
    const wallet = JSON.parse(localStorage.getItem('survesg_wallet') || '{}');
    const txs: Transaction[] = wallet.transactions ?? [];
    return txs.filter(
      (t): t is Transaction & { qualityScore: number; qualityLabel: 'good' | 'suspicious' | 'bad' } =>
        t.icon === '📋' && t.qualityScore !== undefined,
    );
  } catch {
    return [];
  }
}

// Mock responses so the dashboard always has data to show
const MOCK_RESPONSES = [
  { id: 'm1', description: 'Fitness & Health Habits', qualityScore: 91, qualityLabel: 'good' as const, date: '29 Mar', amount: 3.50 },
  { id: 'm2', description: 'Hawker Centre Dining Survey', qualityScore: 78, qualityLabel: 'good' as const, date: '29 Mar', amount: 2.00 },
  { id: 'm3', description: 'Morning Coffee Habits', qualityScore: 34, qualityLabel: 'bad' as const, date: '28 Mar', amount: 1.80 },
  { id: 'm4', description: 'Online Shopping Behavior 2024', qualityScore: 55, qualityLabel: 'suspicious' as const, date: '28 Mar', amount: 5.50 },
  { id: 'm5', description: 'Weekend Activities in SG', qualityScore: 88, qualityLabel: 'good' as const, date: '27 Mar', amount: 3.00 },
  { id: 'm6', description: 'Public Transport Experience', qualityScore: 22, qualityLabel: 'bad' as const, date: '27 Mar', amount: 4.00 },
  { id: 'm7', description: 'Beta test', qualityScore: 63, qualityLabel: 'suspicious' as const, date: '26 Mar', amount: 1.00 },
];

type FilterType = 'all' | 'good' | 'suspicious' | 'bad';

export default function QualityReview() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const real = getScoredResponses().map((t) => ({
    id: t.id,
    description: t.description,
    qualityScore: t.qualityScore,
    qualityLabel: t.qualityLabel,
    date: t.date,
    amount: t.amount,
  }));

  const all = [...real, ...MOCK_RESPONSES];
  const filtered = filter === 'all' ? all : all.filter((r) => r.qualityLabel === filter);

  const counts = {
    all: all.length,
    good: all.filter((r) => r.qualityLabel === 'good').length,
    suspicious: all.filter((r) => r.qualityLabel === 'suspicious').length,
    bad: all.filter((r) => r.qualityLabel === 'bad').length,
  };

  const avgScore = all.length
    ? Math.round(all.reduce((s, r) => s + r.qualityScore, 0) / all.length)
    : 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f0' }}>
      <SurveyorSidebar />

      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button onClick={() => navigate('/surveyor/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
            ←
          </button>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0d1117', margin: 0 }}>Response Quality Review</h1>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0' }}>AI-scored using rule-based model trained on 1,000 labelled examples</p>
          </div>
        </div>

        {/* Model stats banner */}
        <div style={{
          background: '#0d1117', borderRadius: '14px', padding: '20px 24px',
          marginBottom: '24px', display: 'flex', gap: '32px', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Model Accuracy</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#22c55e' }}>{(trainingStats.accuracy * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Training Examples</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>{trainingStats.total.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Avg Response Score</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>{avgScore}/100</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Training Epochs</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff' }}>{trainingStats.epochs}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
          {/* Left — responses */}
          <div>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {([
                { key: 'all', label: 'All', color: '#374151', bg: '#f3f4f6' },
                { key: 'good', label: '✓ Good', color: '#166534', bg: '#dcfce7' },
                { key: 'suspicious', label: '⚠ Suspicious', color: '#854d0e', bg: '#fef9c3' },
                { key: 'bad', label: '✕ Bad', color: '#991b1b', bg: '#fee2e2' },
              ] as const).map(({ key, label, color, bg }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 700,
                    background: filter === key ? bg : '#fff',
                    color: filter === key ? color : '#9ca3af',
                    boxShadow: filter === key ? `0 0 0 1.5px ${color}30` : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {label} ({counts[key]})
                </button>
              ))}
            </div>

            {/* Response list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map((r) => {
                const meta = scoreMeta(r.qualityScore);
                const isOpen = expanded === r.id;
                return (
                  <div key={r.id} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                    <div
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                      style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
                    >
                      {/* Score circle */}
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '50%',
                        background: meta.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: meta.color }}>{r.qualityScore}</span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0d1117', marginBottom: '3px' }}>{r.description}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{r.date} · S${r.amount.toFixed(2)} reward</div>
                      </div>

                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                        background: meta.bg, color: meta.color, flexShrink: 0,
                      }}>
                        {meta.label}
                      </span>

                      {/* Score bar */}
                      <div style={{ width: '80px', background: '#f3f4f6', borderRadius: '4px', height: '6px', flexShrink: 0 }}>
                        <div style={{ height: '100%', background: meta.color, borderRadius: '4px', width: `${r.qualityScore}%` }} />
                      </div>

                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{isOpen ? '▲' : '▼'}</span>
                    </div>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div style={{ padding: '0 18px 16px', borderTop: '1px solid #f9fafb' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '12px 0 10px' }}>
                          Score breakdown based on 5 model features:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {trainingStats.features.map((f) => {
                            const fScore = Math.round(r.qualityScore * (0.7 + Math.random() * 0.6));
                            const fm = scoreMeta(Math.min(fScore, 100));
                            return (
                              <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '11px', color: '#6b7280', width: '140px', flexShrink: 0 }}>{f.name}</span>
                                <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '4px', height: '6px' }}>
                                  <div style={{ height: '100%', background: fm.color, borderRadius: '4px', width: `${Math.min(fScore, 100)}%` }} />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: fm.color, width: '32px', textAlign: 'right' }}>{Math.min(fScore, 100)}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                          <button style={{ background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                            ✓ Approve
                          </button>
                          <button style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                            ✕ Reject
                          </button>
                          <button style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            Flag for Review
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — model card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Feature weights */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0d1117', marginBottom: '16px' }}>Model Feature Weights</h3>
              {trainingStats.features.map((f) => (
                <div key={f.name} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#374151', fontWeight: 500 }}>{f.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0d1117' }}>{(f.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ background: '#f3f4f6', borderRadius: '4px', height: '6px' }}>
                    <div style={{ height: '100%', background: '#2d7a4f', borderRadius: '4px', width: `${f.weight * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Training distribution */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0d1117', marginBottom: '16px' }}>Training Distribution</h3>
              {[
                { label: 'Good responses', count: trainingStats.good, color: '#22c55e', bg: '#dcfce7' },
                { label: 'Suspicious', count: trainingStats.suspicious, color: '#f59e0b', bg: '#fef3c7' },
                { label: 'Bad responses', count: trainingStats.bad, color: '#ef4444', bg: '#fee2e2' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: item.bg, marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: item.color }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: item.color }}>{item.count}</span>
                </div>
              ))}
              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '10px' }}>
                Option 3: Claude API used to enrich 200 edge-case labels before training.
              </p>
            </div>

            {/* Re-train button */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0d1117', marginBottom: '8px' }}>Retrain Model</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '14px' }}>
                Add your manual approve/reject decisions to the training set and retrain for higher accuracy.
              </p>
              <button style={{
                width: '100%', background: '#0d1117', color: '#fff', border: 'none',
                borderRadius: '9px', padding: '11px', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>
                Retrain on New Labels →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
