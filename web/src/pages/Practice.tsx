import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz, listPassages } from '../lib/api';
import type { Passage } from '../lib/api';

export function PracticePage() {
  const nav = useNavigate();
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await listPassages();
        setPassages(res.passages);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load passages');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2>Practice</h2>
      <p style={{ color: '#666' }}>Choose a passage. You will get a 10-question multiple-choice quiz.</p>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}

      {!loading && passages.length === 0 && (
        <div>
          <p>No passages found yet.</p>
          <p style={{ color: '#666' }}>
            Next step: we will add a seed script to import a public-domain/CC passage and generate 10 questions.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 720 }}>
        {passages.map((p) => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 600 }}>{p.title}</div>
            {p.author && <div style={{ color: '#666' }}>by {p.author}</div>}
            <div style={{ marginTop: 10 }}>
              <button
                onClick={async () => {
                  setError(null);
                  try {
                    const quiz = await createQuiz(p.id);
                    nav(`/quiz/${quiz.id}`, { state: { quiz } });
                  } catch (err: any) {
                    setError(err.message ?? 'Failed to create quiz');
                  }
                }}
              >
                Start quiz
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
