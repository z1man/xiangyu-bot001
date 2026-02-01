import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAttempt, saveRubric } from '../lib/api';
import type { AttemptDetail } from '../lib/api';

function badgeColor(isCorrect: boolean | null) {
  if (isCorrect === true) return '#1a7f37';
  if (isCorrect === false) return '#cf222e';
  return '#6e7781';
}

export function ResultPage() {
  const nav = useNavigate();
  const location = useLocation();

  const attemptId = (location.state as any)?.attemptId as string | undefined;
  const mcqScore = (location.state as any)?.mcqScore as number | undefined;
  const mcqTotal = (location.state as any)?.mcqTotal as number | undefined;

  const [detail, setDetail] = useState<AttemptDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [evidence, setEvidence] = useState(3);
  const [reasoning, setReasoning] = useState(3);
  const [style, setStyle] = useState(3);
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!attemptId) return;
    (async () => {
      setLoadingDetail(true);
      try {
        const d = await getAttempt(attemptId);
        setDetail(d);

        // Prefill rubric if already saved
        if (d.attempt.rubric.evidence != null) setEvidence(d.attempt.rubric.evidence);
        if (d.attempt.rubric.reasoning != null) setReasoning(d.attempt.rubric.reasoning);
        if (d.attempt.rubric.style != null) setStyle(d.attempt.rubric.style);
        if (d.attempt.rubric.notes != null) setNotes(d.attempt.rubric.notes);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load attempt details');
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [attemptId]);

  const review = useMemo(() => detail?.questions ?? [], [detail]);

  if (!attemptId) {
    return (
      <div>
        <h2>Result</h2>
        <p style={{ color: 'crimson' }}>Missing attempt id. Please complete a quiz first.</p>
        <button onClick={() => nav('/practice')}>Back to Practice</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Result</h2>
      <div style={{ marginTop: 8 }}>
        <b>MCQ score:</b> {mcqScore}/{mcqTotal}
      </div>

      <h3 style={{ marginTop: 18 }}>Rubric self-scoring (0–5)</h3>
      <p style={{ color: '#666' }}>Be honest. The goal is to track your progress over time.</p>

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

        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        {saved && <div style={{ color: 'green' }}>Saved.</div>}

        <button
          disabled={saving}
          onClick={async () => {
            setError(null);
            setSaved(false);
            setSaving(true);
            try {
              await saveRubric(attemptId, evidence, reasoning, style, notes);
              setSaved(true);
            } catch (err: any) {
              setError(err.message ?? 'Failed to save rubric');
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? 'Saving…' : 'Save rubric'}
        </button>

        <button onClick={() => nav('/practice')}>Start another practice</button>
      </div>

      <h3 style={{ marginTop: 28 }}>Review</h3>
      <p style={{ color: '#666' }}>Your answer, the correct answer, and an explanation (when available).</p>

      {loadingDetail && <div>Loading review…</div>}

      {detail && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
          {review.map((q, idx) => (
            <div key={q.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ fontWeight: 600 }}>Q{idx + 1}. {q.stem}</div>
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
                        background: isCorrectChoice ? 'rgba(26,127,55,0.08)' : isSelected ? 'rgba(207,34,46,0.06)' : 'transparent',
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
      )}
    </div>
  );
}
