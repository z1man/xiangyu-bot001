import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { submitAttempt } from '../lib/api';
import type { QuizPayload } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function QuizPage() {
  const nav = useNavigate();
  const { quizId } = useParams();
  const location = useLocation();

  const quiz = (location.state as any)?.quiz as QuizPayload | undefined;

  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | undefined>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassage, setShowPassage] = useState(false);

  const unansweredCount = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter((q) => !answers[q.id]).length;
  }, [quiz, answers]);

  if (!quiz) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Quiz</CardTitle>
            <CardDescription>Quiz data is missing. Please go back and start a new quiz.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => nav('/practice')}>
              Back to Practice
            </Button>
            <div className="text-xs text-slate-500">Quiz id: {quizId}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Quiz</h2>
        <p className="text-sm text-slate-600">{quiz.passage.title}</p>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Passage</CardTitle>
              <CardDescription>Read first, then answer the questions.</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setShowPassage((v) => !v)}>
              {showPassage ? 'Hide' : 'Show'}
            </Button>
          </CardHeader>
          {showPassage && <CardContent className="whitespace-pre-wrap text-sm leading-6 text-slate-800">{quiz.passage.text}</CardContent>}
        </Card>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 grid gap-4">
        {quiz.questions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader>
              <CardTitle className="text-base">Q{idx + 1}. {q.stem}</CardTitle>
              <CardDescription className="flex gap-2">
                <span>Tag: {q.tag}</span>
                <span>·</span>
                <span>Difficulty: {q.difficulty}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {(['A', 'B', 'C', 'D'] as const).map((k) => {
                  const selected = answers[q.id] === k;
                  return (
                    <label
                      key={k}
                      className={
                        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors ' +
                        (selected ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:bg-slate-50')
                      }
                    >
                      <input
                        className="mt-1"
                        type="radio"
                        name={q.id}
                        checked={selected}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: k }))}
                      />
                      <div>
                        <div className="font-medium text-slate-900">{k}.</div>
                        <div className="text-slate-700">{q.choices[k]}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-0 mt-8 border-t border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" onClick={() => nav('/practice')}>
            Exit
          </Button>
          <div className="flex-1" />
          <div className="text-sm text-slate-600">{unansweredCount} unanswered</div>
          <Button
            disabled={submitting}
            onClick={async () => {
              setError(null);
              if (unansweredCount > 0) {
                setError('Please answer all questions before submitting.');
                return;
              }
              setSubmitting(true);
              try {
                const payload = quiz.questions.map((qq) => ({
                  questionId: qq.id,
                  selected: answers[qq.id] as 'A' | 'B' | 'C' | 'D',
                }));
                const res = await submitAttempt(quiz.id, payload);
                nav(`/attempt/${res.attemptId}`);
              } catch (err: any) {
                setError(err.message ?? 'Failed to submit');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}
