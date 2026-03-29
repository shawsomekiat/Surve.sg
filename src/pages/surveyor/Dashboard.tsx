import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SurveyorSidebar from '../../components/SurveyorSidebar';
import { surveys as surveyData } from '../../data/surveys';

type TabType = 'all' | 'active' | 'draft' | 'paused';

const extraSurveys = [
  { id: '8', title: 'Brand Awareness Study', status: 'active' as const, rewardSGD: 4.50, targetResponses: 300, currentResponses: 145, createdAt: '5 Jan' },
  { id: '9', title: 'App UX Feedback', status: 'draft' as const, rewardSGD: 3.00, targetResponses: 200, currentResponses: 0, createdAt: '6 Jan' },
  { id: '10', title: 'Local Food Preferences', status: 'paused' as const, rewardSGD: 2.50, targetResponses: 500, currentResponses: 210, createdAt: '6 Jan' },
  { id: '11', title: 'Digital Wallet Usage', status: 'active' as const, rewardSGD: 3.80, targetResponses: 400, currentResponses: 88, createdAt: '7 Jan' },
  { id: '12', title: 'Remote Work Survey', status: 'active' as const, rewardSGD: 5.00, targetResponses: 250, currentResponses: 30, createdAt: '7 Jan' },
  { id: '13', title: 'Travel Intentions 2025', status: 'active' as const, rewardSGD: 4.20, targetResponses: 350, currentResponses: 60, createdAt: '8 Jan' },
  { id: '14', title: 'Healthcare Access Survey', status: 'draft' as const, rewardSGD: 6.00, targetResponses: 300, currentResponses: 0, createdAt: '8 Jan' },
  { id: '15', title: 'Climate Change Attitudes', status: 'active' as const, rewardSGD: 3.50, targetResponses: 400, currentResponses: 55, createdAt: '9 Jan' },
];

const allTableSurveys = [
  ...surveyData.map((s) => ({ id: s.id, title: s.title, status: s.status, rewardSGD: s.rewardSGD, targetResponses: s.targetResponses, currentResponses: s.currentResponses, createdAt: s.createdAt })),
  ...extraSurveys,
];

export default function SurveyorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filtered = activeTab === 'all' ? allTableSurveys : allTableSurveys.filter((s) => s.status === activeTab);

  const tabCounts = {
    all: allTableSurveys.length,
    active: allTableSurveys.filter((s) => s.status === 'active').length,
    draft: allTableSurveys.filter((s) => s.status === 'draft').length,
    paused: allTableSurveys.filter((s) => s.status === 'paused').length,
  };

  const stats = [
    { label: 'Total Surveys', value: 15, icon: '📋' },
    { label: 'Active', value: 13, icon: '✅' },
    { label: 'Responses', value: 4, icon: '📊' },
    { label: 'Completed', value: 0, icon: '🏁' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f0' }}>
      <SurveyorSidebar />

      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0d1117' }}>Survey Management</h1>
          <button
            onClick={() => navigate('/surveyor/create')}
            style={{
              background: '#2d7a4f', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '11px 20px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            + Create Survey
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{
              background: '#fff', borderRadius: '12px', padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0d1117', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: '#fff', borderRadius: '10px', padding: '4px', width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          {(['all', 'active', 'draft', 'paused'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', borderRadius: '7px', border: 'none',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                background: activeTab === tab ? '#0d1117' : 'transparent',
                color: activeTab === tab ? '#fff' : '#6b7280',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)} ({tabCounts[tab]})
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['Survey', 'Status', 'Reward', 'Responses', 'Created', 'Actions'].map((col) => (
                  <th key={col} style={{
                    padding: '14px 16px', textAlign: 'left', fontSize: '12px',
                    fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((survey, i) => (
                <tr
                  key={survey.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f9fafb' : 'none' }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#0d1117' }}>{survey.title}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      background: survey.status === 'active' ? '#dcfce7' : survey.status === 'draft' ? '#fef9c3' : '#fee2e2',
                      color: survey.status === 'active' ? '#166534' : survey.status === 'draft' ? '#854d0e' : '#991b1b',
                    }}>
                      {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                    S${survey.rewardSGD.toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151' }}>
                    {survey.currentResponses}/{survey.targetResponses}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#9ca3af' }}>
                    {survey.createdAt}
                  </td>
                  <td style={{ padding: '14px 16px', position: 'relative' }}>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === survey.id ? null : survey.id)}
                      style={{
                        background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px',
                        padding: '5px 10px', fontSize: '16px', cursor: 'pointer', color: '#6b7280',
                      }}
                    >
                      ⋮
                    </button>
                    {openDropdown === survey.id && (
                      <div style={{
                        position: 'absolute', right: '16px', top: '40px', background: '#fff',
                        border: '1px solid #e5e7eb', borderRadius: '10px', zIndex: 100,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', minWidth: '120px',
                      }}>
                        {['Edit', 'Pause', 'Delete'].map((action) => (
                          <button
                            key={action}
                            onClick={() => setOpenDropdown(null)}
                            style={{
                              display: 'block', width: '100%', padding: '10px 16px',
                              background: 'none', border: 'none', textAlign: 'left',
                              fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                              color: action === 'Delete' ? '#ef4444' : '#374151',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}