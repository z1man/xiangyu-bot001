import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAttempt, saveRubric } from '../lib/api';
import type { AttemptDetail } from '../lib/api';

function badgeColor(isCorrect: boolean | null) {
  if (isCorrect === true) return '#1a7f37';
  if (isCorrect === false) return '#cf222e';
  return '#6e7781';
}

export function AttemptPage() {
  const nav = useNavigate();
  const { attemptId } = useParams();

  const [detail, setDetail] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [evidence, setEvidence] = useState(3);
  const [reasoning, setReasoning] = useState(3);
  const [style, setStyle] = useState(3);
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [showPassage, setShowPassage] = useState(false);

  useEffect(() => {
    if (!attemptId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await getAttempt(attemptId);
        setDetail(d);

        if (d.attempt.rubric.evidence != null) setEvidence(d.attempt.rubric.evidence);
        if (d.attempt.rubric.reasoning != null) setReasoning(d.attempt.rubric.reasoning);
        if (d.attempt.rubric.style != null) setStyle(d.attempt.rubric.style);
        if (d.attempt.rubric.notes != null) setNotes(d.attempt.rubric.notes);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load attempt');
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  if (!attemptId) {
    return (
      <div>
        <h2>Attempt</h2>
        <p style={{ color: 'crimson' }}>Missing attempt id.</p>
        <button onClick={() => nav('/history')}>Back to History</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Attempt</h2>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}

      {detail && (
        <>
          <div style={{ marginTop: 8 }}>
            <b>MCQ score:</b> {detail.attempt.mcqScore}/{detail.attempt.mcqTotal}
          </div>

          <div style={{ marginTop: 14, border: '1px solid #eee', padding: 12, borderRadius: 8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ fontWeight: 600 }}>{detail.passage.title}</div>
              <div style={{ flex: 1 }} />
              <button onClick={() => setShowPassage((v) => !v)}>{showPassage ? 'Hide passage' : 'Show passage'}</button>
            </div>
            {showPassage && (
              <div style={{ marginTop: 10, whiteSpace: 'pre-wrap', color: '#333' }}>{detail.passage.text}</div>
            )}
          </div>

          <h3 style={{ marginTop: 18 }}>Rubric self-scoring (0–5)</h3>
          <div style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
            <label>
              Evidence
              <input type="number" min={0} max={5} value={evidence} onChange={(e) => setEvidence(Number(e.target.value))} />
            </label>
            <label>
              Reasoning
              <input type="number" min={0} max={5} value={reasoning} onChange={(e) => setReasoning(Number(e.target.value))} />
            </label>
            <label>
              Style
              <input type="number" min={0} max={5} value={style} onChange={(e) => setStyle(Number(e.target.value))} />
            </label>
            <label>
              Notes (optional)
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
            </label>

            {saved && <div style={{ color: 'green' }}>Saved.</div>}

            <button
              disabled={saving}
              onClick={async () => {
                setSaved(false);
                setSaving(true);
                try {
                  await saveRubric(attemptId, evidence, reasoning, style, notes);
                  setSaved(true);
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? 'Saving…' : 'Save rubric'}
            </button>
          </div>

          <h3 style={{ marginTop: 28 }}>Review</h3>
          <p style={{ color: '#666' }}>Your answer, the correct answer, and an explanation (when available).</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
            {detail.questions.map((q, idx) => (
              <div key={q.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ fontWeight: 600 }}>
                    Q{idx + 1}. {q.stem}
                  </div>
                  <div style={{ flex: 1 }} />
                  <span
                    style={{
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${badgeColor(q.isCorrect)}`,
                      color: badgeColor(q.isCorrect),
                    }}
                  >
                    {q.isCorrect === true ? 'Correct' : q.isCorrect === false ? 'Incorrect' : 'Unanswered'}
                  </span>
                </div>

                <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                  {(['A', 'B', 'C', 'D'] as const).map((k) => {
                    const isSelected = q.selected === k;
                    const isCorrectChoice = q.correct === k;
                    return (
                      <div
                        key={k}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: '1px solid #eee',
                          background: isCorrectChoice
                            ? 'rgba(26,127,55,0.08)'
                            : isSelected
                            ? 'rgba(207,34,46,0.06)'
                            : 'transparent',
                        }}
                      >
                        <b>{k}.</b> {q.choices[k]}{' '}
                        {isCorrectChoice && <span style={{ color: '#1a7f37' }}>(correct)</span>}
                        {isSelected && !isCorrectChoice && <span style={{ color: '#cf222e' }}>(your choice)</span>}
                        {isSelected && isCorrectChoice && <span style={{ color: '#1a7f37' }}>(your choice)</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div style={{ marginTop: 10, color: '#444' }}>
                    <b>Explanation:</b> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
