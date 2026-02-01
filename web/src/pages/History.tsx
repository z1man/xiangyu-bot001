import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAttempt, listAttempts } from '../lib/api';
import type { AttemptListItem } from '../lib/api';

export function HistoryPage() {
  const nav = useNavigate();
  const [items, setItems] = useState<AttemptListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await listAttempts();
        setItems(res.attempts);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load history');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2>History</h2>
      <p style={{ color: '#666' }}>Your recent attempts.</p>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}

      {!loading && items.length === 0 && <div>No attempts yet.</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, maxWidth: 820 }}>
        {items.map((a) => {
          const rubricDone = a.rubric.evidence != null && a.rubric.reasoning != null && a.rubric.style != null;
          return (
            <div key={a.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 600 }}>{a.passage.title}</div>
              <div style={{ color: '#666', marginTop: 4 }}>
                {new Date(a.submittedAt).toLocaleString()} · MCQ {a.mcqScore}/{a.mcqTotal} · Rubric{' '}
                {rubricDone
                  ? `E${a.rubric.evidence} R${a.rubric.reasoning} S${a.rubric.style}`
                  : 'Not saved'}
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                <button
                  onClick={async () => {
                    // Navigate to Result page with attempt details (reusing Result UI)
                    const d = await getAttempt(a.id);
                    nav('/result', {
                      state: {
                        attemptId: d.attempt.id,
                        mcqScore: d.attempt.mcqScore,
                        mcqTotal: d.attempt.mcqTotal,
                      },
                    });
                  }}
                >
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
