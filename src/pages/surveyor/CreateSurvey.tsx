import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SurveyorSidebar from '../../components/SurveyorSidebar';

type QuestionType = 'multiple_choice' | 'yes_no' | 'rating' | 'free_text';

interface QuestionDraft {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function CreateSurvey() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [duration, setDuration] = useState('');
  const [targetResponses, setTargetResponses] = useState('');
  const [expiresOn, setExpiresOn] = useState('');
  const [audienceGeneral, setAudienceGeneral] = useState(true);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: uid(), text: '', type: 'multiple_choice', options: ['', ''] },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof QuestionDraft, value: string | QuestionType | string[]) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qId: string, idx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const opts = [...q.options];
        opts[idx] = value;
        return { ...q, options: opts };
      })
    );
  };

  const addOption = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: [...q.options, ''] } : q
      )
    );
  };

  const removeOption = (qId: string, idx: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const opts = q.options.filter((_, i) => i !== idx);
        return { ...q, options: opts };
      })
    );
  };

  const handleSave = () => {
    navigate('/surveyor/dashboard');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', borderRadius: '10px',
    border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'Inter, sans-serif',
    outline: 'none', color: '#374151', background: '#fff',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: 600, color: '#374151',
    display: 'block', marginBottom: '6px',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f0' }}>
      <SurveyorSidebar />

      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button
            onClick={() => navigate('/surveyor/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#374151' }}
          >
            ←
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0d1117' }}>Create New Survey</h1>
        </div>

        <div style={{ maxWidth: '680px' }}>
          {/* Basic Info Card */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: '#0d1117' }}>Survey Details</h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Survey Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Customer Satisfaction Survey"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the survey purpose..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Reward (SGD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.10"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder="e.g. 3.50"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Duration (mins)</label>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 10"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Target Responses</label>
                <input
                  type="number"
                  min="1"
                  value={targetResponses}
                  onChange={(e) => setTargetResponses(e.target.value)}
                  placeholder="e.g. 200"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Expires On</label>
                <input
                  type="date"
                  value={expiresOn}
                  onChange={(e) => setExpiresOn(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Audience Toggle */}
            <div>
              <label style={labelStyle}>Target Audience</label>
              <div
                onClick={() => setAudienceGeneral((v) => !v)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '10px 16px', borderRadius: '10px', cursor: 'pointer',
                  border: audienceGeneral ? '2px solid #2d7a4f' : '2px solid #e5e7eb',
                  background: audienceGeneral ? '#f0fdf4' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: '18px', height: '18px', borderRadius: '4px',
                  background: audienceGeneral ? '#2d7a4f' : '#fff',
                  border: audienceGeneral ? 'none' : '2px solid #d1d5db',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '12px', fontWeight: 700,
                }}>
                  {audienceGeneral && '✓'}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500, color: audienceGeneral ? '#166534' : '#374151' }}>
                  General Population
                </span>
              </div>
            </div>
          </div>

          {/* Questions Card */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0d1117' }}>
                Questions ({questions.length})
              </h2>
              <button
                onClick={addQuestion}
                style={{
                  background: '#f0fdf4', color: '#2d7a4f', border: '1.5px solid #86efac',
                  borderRadius: '8px', padding: '8px 14px', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                + Add Question
              </button>
            </div>

            {questions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>❓</div>
                <p style={{ fontSize: '14px' }}>No questions yet. Click "+ Add Question" to start.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((q, idx) => (
                <div key={q.id} style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#9ca3af', paddingTop: '12px', minWidth: '24px' }}>
                      Q{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                      placeholder="Enter your question..."
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(q.id, 'type', e.target.value as QuestionType)}
                      style={{ ...inputStyle, width: '160px', cursor: 'pointer' }}
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="yes_no">Yes or No</option>
                      <option value="rating">Rating 1-5</option>
                      <option value="free_text">Free Text</option>
                    </select>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#ef4444', fontSize: '18px', padding: '4px', lineHeight: 1,
                        paddingTop: '10px',
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {q.type === 'multiple_choice' && (
                    <div style={{ marginLeft: '34px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, oi) => (
                        <div key={oi} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #d1d5db', flexShrink: 0 }} />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(q.id, oi, e.target.value)}
                            placeholder={`Option ${oi + 1}`}
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          {q.options.length > 2 && (
                            <button
                              onClick={() => removeOption(q.id, oi)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '16px' }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(q.id)}
                        style={{
                          background: 'none', border: '1.5px dashed #d1d5db', borderRadius: '8px',
                          padding: '8px', fontSize: '12px', color: '#9ca3af', cursor: 'pointer',
                          fontWeight: 500, marginLeft: '20px',
                        }}
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  {q.type === 'yes_no' && (
                    <div style={{ marginLeft: '34px', display: 'flex', gap: '10px' }}>
                      {['Yes', 'No'].map((opt) => (
                        <div key={opt} style={{
                          padding: '8px 20px', borderRadius: '8px',
                          border: '1.5px solid #e5e7eb', fontSize: '13px',
                          color: '#6b7280', background: '#fff',
                        }}>{opt}</div>
                      ))}
                    </div>
                  )}

                  {q.type === 'rating' && (
                    <div style={{ marginLeft: '34px', display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div key={n} style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          border: '1.5px solid #e5e7eb', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontWeight: 600, color: '#6b7280', background: '#fff',
                        }}>{n}</div>
                      ))}
                    </div>
                  )}

                  {q.type === 'free_text' && (
                    <div style={{ marginLeft: '34px' }}>
                      <div style={{
                        padding: '10px 14px', borderRadius: '8px',
                        border: '1.5px dashed #e5e7eb', fontSize: '13px',
                        color: '#9ca3af', background: '#fff',
                      }}>
                        Respondent will type their answer here...
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={() => navigate('/surveyor/dashboard')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: 600, color: '#9ca3af', padding: '12px 16px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                background: '#2d7a4f', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '12px 28px', fontSize: '15px',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Save Survey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}