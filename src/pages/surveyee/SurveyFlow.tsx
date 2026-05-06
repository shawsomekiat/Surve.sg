import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { surveys } from '../../data/surveys';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { extractFeatures, scoreResponse, scoreMeta } from '../../utils/qualityScorer';
import { saveResponse } from '../../utils/exportCSV';
import { getScopedStorageKey } from '../../utils/userStorage';

export default function SurveyFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addSurveyEarning } = useWallet();
  const survey = surveys.find((s) => s.id === id);
  const profileKey = getScopedStorageKey('survesg_profile', user);

  const startTime = useRef(Date.now());
  const answerChanges = useRef(0);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [showComplete, setShowComplete] = useState(false);
  const [qualityScore, setQualityScore] = useState(0);
  const [qualityLabel, setQualityLabel] = useState<'good' | 'suspicious' | 'bad'>('good');
  void qualityLabel; // passed to wallet context, not rendered directly

  if (!survey) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>😕</div>
          <p style={{ fontWeight: 600, marginBottom: '16px' }}>Survey not found</p>
          <button onClick={() => navigate('/surveyee/dashboard')}
            style={{ background: '#2d7a4f', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', cursor: 'pointer', fontWeight: 600 }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const questions = survey.questions;
  const question = questions[currentStep];
  const total = questions.length;
  const progress = ((currentStep + 1) / total) * 100;
  const currentAnswer = answers[question.id];
  const isLast = currentStep === total - 1;

  const handleAnswer = (value: string | number) => {
    if (answers[question.id] !== undefined) answerChanges.current += 1;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (isLast) {
      // Load profile for demographic check
      let userAge: number | undefined;
      try {
        const p = JSON.parse(localStorage.getItem(profileKey) || '{}');
        if (p.age) userAge = parseInt(p.age);
      } catch { /* ignore */ }

      const features = extractFeatures(
        answers, questions, startTime.current, answerChanges.current, userAge,
      );
      const result = scoreResponse(features);
      setQualityScore(result.score);
      setQualityLabel(result.label);
      saveResponse(survey.id, answers, result.score, result.label);
      addSurveyEarning(survey.id, survey.title, survey.rewardSGD, result.score, result.label);
      setShowComplete(true);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const meta = scoreMeta(qualityScore);

  return (
    <div style={{ background: '#f0f2f0', minHeight: '100vh', padding: '20px 16px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => navigate('/surveyee/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#374151', padding: '6px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ← Back
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#0d1117', marginBottom: '6px' }}>{survey.title}</div>
            <div style={{ background: '#e5e7eb', borderRadius: '8px', height: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#2d7a4f', borderRadius: '8px', width: `${progress}%`, transition: 'width 0.3s ease' }} />
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {currentStep + 1}/{total}
          </span>
        </div>

        {/* Info bar */}
        <div style={{ background: '#dcfce7', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#166534', fontWeight: 500, marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <span>S${survey.rewardSGD.toFixed(2)} reward</span>
          <span>•</span>
          <span>{survey.durationMins} min</span>
          <span>•</span>
          <span>{survey.targetResponses - survey.currentResponses} spots left</span>
        </div>

        {/* Question Card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '28px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Question {currentStep + 1} of {total}
          </div>
          <p style={{ fontSize: '17px', fontWeight: 600, color: '#0d1117', lineHeight: '1.5', marginBottom: '24px' }}>
            {question.text}
          </p>

          {question.type === 'multiple_choice' && question.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {question.options.map((opt) => (
                <button key={opt} onClick={() => handleAnswer(opt)}
                  style={{
                    padding: '14px 16px', borderRadius: '10px', textAlign: 'left',
                    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    border: currentAnswer === opt ? '2px solid #2d7a4f' : '2px solid #e5e7eb',
                    background: currentAnswer === opt ? '#dcfce7' : '#fff',
                    color: currentAnswer === opt ? '#166534' : '#374151',
                    transition: 'all 0.15s ease',
                  }}>{opt}</button>
              ))}
            </div>
          )}

          {question.type === 'rating' && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => handleAnswer(n)}
                  style={{
                    width: '52px', height: '52px', borderRadius: '12px',
                    fontSize: '18px', fontWeight: 700, cursor: 'pointer',
                    border: currentAnswer === n ? '2px solid #2d7a4f' : '2px solid #e5e7eb',
                    background: currentAnswer === n ? '#2d7a4f' : '#fff',
                    color: currentAnswer === n ? '#fff' : '#374151',
                    transition: 'all 0.15s ease',
                  }}>{n}</button>
              ))}
            </div>
          )}

          {question.type === 'yes_no' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {['Yes', 'No'].map((opt) => (
                <button key={opt} onClick={() => handleAnswer(opt)}
                  style={{
                    flex: 1, padding: '20px', borderRadius: '12px',
                    fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                    border: currentAnswer === opt ? '2px solid #2d7a4f' : '2px solid #e5e7eb',
                    background: currentAnswer === opt ? '#dcfce7' : '#fff',
                    color: currentAnswer === opt ? '#166534' : '#374151',
                    transition: 'all 0.15s ease',
                  }}>{opt}</button>
              ))}
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={(currentAnswer as string) || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={4}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '2px solid #e5e7eb', fontSize: '14px', fontFamily: 'Inter, sans-serif', resize: 'vertical', outline: 'none', color: '#374151', boxSizing: 'border-box' }}
              onFocus={(e) => (e.target.style.borderColor = '#2d7a4f')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={currentAnswer === undefined || currentAnswer === ''}
          style={{
            width: '100%', marginTop: '20px', padding: '15px',
            borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: 600,
            cursor: currentAnswer !== undefined && currentAnswer !== '' ? 'pointer' : 'not-allowed',
            background: currentAnswer !== undefined && currentAnswer !== '' ? '#2d7a4f' : '#d1d5db',
            color: '#fff', transition: 'background 0.2s ease',
          }}
        >
          {isLast ? 'Submit Survey' : 'Next →'}
        </button>
      </div>

      {/* Completion Modal */}
      {showComplete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '40px 28px', width: '100%', maxWidth: '360px', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Survey Complete!</h2>
            <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '6px' }}>You've earned</p>
            <p style={{ fontSize: '32px', fontWeight: 800, color: '#22c55e', marginBottom: '16px' }}>
              S${survey.rewardSGD.toFixed(2)}
            </p>

            {/* Quality score bar */}
            <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Response Quality</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: meta.color }}>{qualityScore}/100 — {meta.label}</span>
              </div>
              <div style={{ background: '#e5e7eb', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: meta.color, borderRadius: '6px', width: `${qualityScore}%`, transition: 'width 0.6s ease' }} />
              </div>
            </div>

            <button
              onClick={() => navigate('/surveyee/dashboard')}
              style={{ background: '#2d7a4f', color: '#fff', border: 'none', borderRadius: '12px', padding: '15px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', width: '100%' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
