import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { submitAttempt } from '../lib/api';
import type { QuizPayload } from '../lib/api';

export function QuizPage() {
  const nav = useNavigate();
  const { quizId } = useParams();
  const location = useLocation();

  const quiz = (location.state as any)?.quiz as QuizPayload | undefined;

  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | undefined>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const unansweredCount = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter((q) => !answers[q.id]).length;
  }, [quiz, answers]);

  if (!quiz) {
    return (
      <div>
        <h2>Quiz</h2>
        <p style={{ color: 'crimson' }}>
          Quiz data is missing. Please go back to Practice and start a new quiz.
        </p>
        <button onClick={() => nav('/practice')}>Back to Practice</button>
        <div style={{ color: '#666', marginTop: 8 }}>Quiz id: {quizId}</div>
      </div>
    );
  }

  return (
    <div>
      <h2>Quiz</h2>
      <div style={{ color: '#666' }}>{quiz.passage.title}</div>

      <div style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 8, whiteSpace: 'pre-wrap' }}>
        {quiz.passage.text}
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {quiz.questions.map((q, idx) => (
          <div key={q.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <div style={{ fontWeight: 600 }}>
              Q{idx + 1}. {q.stem}
            </div>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              {(['A', 'B', 'C', 'D'] as const).map((k) => (
                <label key={k} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === k}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: k }))}
                  />
                  <span>
                    <b>{k}.</b> {q.choices[k]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <div style={{ color: 'crimson', marginTop: 12 }}>{error}</div>}

      <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={() => nav('/practice')}>Exit</button>
        <div style={{ flex: 1 }} />
        <div style={{ color: '#666' }}>{unansweredCount} unanswered</div>
        <button
          disabled={submitting}
          onClick={async () => {
            setError(null);
            if (unansweredCount > 0) {
              setError('Please answer all questions before submitting.');
              return;
            }
            setSubmitting(true);
            try {
              const payload = quiz.questions.map((q) => ({
                questionId: q.id,
                selected: answers[q.id] as 'A' | 'B' | 'C' | 'D',
              }));
              const res = await submitAttempt(quiz.id, payload);
              // Go directly to canonical attempt page
              nav(`/attempt/${res.attemptId}`);
            } catch (err: any) {
              setError(err.message ?? 'Failed to submit');
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
