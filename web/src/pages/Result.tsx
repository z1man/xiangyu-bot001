import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveRubric } from '../lib/api';

export function ResultPage() {
  const nav = useNavigate();
  const location = useLocation();

  const attemptId = (location.state as any)?.attemptId as string | undefined;
  const mcqScore = (location.state as any)?.mcqScore as number | undefined;
  const mcqTotal = (location.state as any)?.mcqTotal as number | undefined;

  const [evidence, setEvidence] = useState(3);
  const [reasoning, setReasoning] = useState(3);
  const [style, setStyle] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

      <div style={{ display: 'grid', gap: 10, maxWidth: 420 }}>
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
    </div>
  );
}
