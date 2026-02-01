import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAttempts } from '../lib/api';
import type { AttemptListItem } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

function SkeletonRow() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      <div className="mt-6 h-10 w-24 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">History</h2>
        <p className="text-sm text-slate-600">Your recent attempts.</p>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>No attempts yet</CardTitle>
              <CardDescription>Start a practice quiz to see your attempts here.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={() => nav('/practice')}>Go to Practice</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {items.map((a) => {
            const rubricDone = a.rubric.evidence != null && a.rubric.reasoning != null && a.rubric.style != null;
            return (
              <Card key={a.id}>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{a.passage.title}</CardTitle>
                  <CardDescription>
                    {new Date(a.submittedAt).toLocaleString()} · MCQ {a.mcqScore}/{a.mcqTotal} · Rubric{' '}
                    {rubricDone ? `E${a.rubric.evidence} R${a.rubric.reasoning} S${a.rubric.style}` : 'Not saved'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <Button variant="secondary" onClick={() => nav(`/attempt/${a.id}`)}>
                    View
                  </Button>
                  <Button variant="outline" onClick={() => nav('/practice')}>
                    Practice
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
