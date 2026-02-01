import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAttempt, saveRubric } from '../lib/api';
import type { AttemptDetail } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

function StatusPill({ status }: { status: 'correct' | 'incorrect' | 'unanswered' }) {
  const cls =
    status === 'correct'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'incorrect'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-slate-200 bg-slate-50 text-slate-700';

  const label = status === 'correct' ? 'Correct' : status === 'incorrect' ? 'Incorrect' : 'Unanswered';

  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function clampScore(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(5, n));
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

  const scoreSummary = useMemo(() => {
    if (!detail) return null;
    const total = detail.attempt.mcqTotal;
    const score = detail.attempt.mcqScore;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return { score, total, pct };
  }, [detail]);

  if (!attemptId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Attempt</CardTitle>
            <CardDescription>Missing attempt id.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" onClick={() => nav('/history')}>
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Attempt</h2>
        <p className="text-sm text-slate-600">Review your answers and record rubric scores.</p>
      </div>

      {loading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {detail && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Score</CardTitle>
                <CardDescription>Your multiple-choice result for this attempt.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-semibold text-slate-900">
                    {scoreSummary?.score}/{scoreSummary?.total}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{scoreSummary?.pct}% correct</div>
                </div>
                <Button variant="outline" onClick={() => nav('/practice')}>
                  New practice
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>Passage</CardTitle>
                  <CardDescription className="line-clamp-1">{detail.passage.title}</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setShowPassage((v) => !v)}>
                  {showPassage ? 'Hide' : 'Show'}
                </Button>
              </CardHeader>
              {showPassage && (
                <CardContent className="max-h-[320px] overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-800">
                  {detail.passage.text}
                </CardContent>
              )}
              {!showPassage && <CardContent className="text-sm text-slate-600">Passage hidden.</CardContent>}
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rubric self-scoring (0–5)</CardTitle>
                <CardDescription>Evidence / Reasoning / Style. Save to track progress.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Evidence</label>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      value={evidence}
                      onChange={(e) => setEvidence(clampScore(Number(e.target.value)))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Reasoning</label>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      value={reasoning}
                      onChange={(e) => setReasoning(clampScore(Number(e.target.value)))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-slate-700">Style</label>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      value={style}
                      onChange={(e) => setStyle(clampScore(Number(e.target.value)))}
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <label className="text-sm font-medium text-slate-700">Notes (optional)</label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <Button
                    disabled={saving}
                    onClick={async () => {
                      setSaved(false);
                      setSaving(true);
                      try {
                        await saveRubric(attemptId, evidence, reasoning, style, notes);
                        setSaved(true);
                      } catch {
                        // keep silent; UI already shows saved state only
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saving ? 'Saving…' : 'Save rubric'}
                  </Button>

                  {saved && <span className="text-sm text-emerald-700">Saved.</span>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Review</h3>
                <p className="text-sm text-slate-600">Your choice, the correct answer, and an explanation (when available).</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              {detail.questions.map((q, idx) => {
                const status = q.isCorrect === true ? 'correct' : q.isCorrect === false ? 'incorrect' : 'unanswered';
                return (
                  <Card key={q.id}>
                    <CardHeader className="flex-row items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">Q{idx + 1}. {q.stem}</CardTitle>
                        <CardDescription className="flex gap-2">
                          <span>Tag: {q.tag}</span>
                          <span>·</span>
                          <span>Difficulty: {q.difficulty}</span>
                        </CardDescription>
                      </div>
                      <StatusPill status={status} />
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        {(['A', 'B', 'C', 'D'] as const).map((k) => {
                          const isSelected = q.selected === k;
                          const isCorrect = q.correct === k;
                          const bg = isCorrect ? 'bg-emerald-50 border-emerald-200' : isSelected ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200';
                          const note = isCorrect ? '(correct)' : isSelected ? '(your choice)' : '';
                          const noteCls = isCorrect ? 'text-emerald-700' : isSelected ? 'text-red-700' : 'text-slate-500';
                          return (
                            <div key={k} className={`rounded-lg border p-3 text-sm ${bg}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-medium text-slate-900">{k}. {q.choices[k]}</div>
                                </div>
                                {note && <div className={`shrink-0 text-xs font-medium ${noteCls}`}>{note}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                          <span className="font-medium text-slate-900">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
