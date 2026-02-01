import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz, listPassages } from '../lib/api';
import type { Passage } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-1/3 animate-pulse rounded bg-slate-100" />
      <div className="mt-6 h-10 w-28 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export function PracticePage() {
  const nav = useNavigate();
  const [passages, setPassages] = useState<Passage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<string | null>(null);

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
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-slate-900">Practice</h2>
        <p className="text-sm text-slate-600">Choose a passage. You will get a 10-question multiple-choice quiz.</p>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && passages.length === 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>No passages found</CardTitle>
              <CardDescription>
                Add passages via Settings (Generate 10 passages) or ingest scripts. Then come back here.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="secondary" onClick={() => nav('/settings')}>
                Go to Settings
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && passages.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {passages.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="line-clamp-2">{p.title}</CardTitle>
                {p.author ? <CardDescription>by {p.author}</CardDescription> : <CardDescription> </CardDescription>}
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">10 questions</div>
                <Button
                  disabled={creating === p.id}
                  onClick={async () => {
                    setError(null);
                    setCreating(p.id);
                    try {
                      const quiz = await createQuiz(p.id);
                      nav(`/quiz/${quiz.id}`, { state: { quiz } });
                    } catch (err: any) {
                      setError(err.message ?? 'Failed to create quiz');
                    } finally {
                      setCreating(null);
                    }
                  }}
                >
                  {creating === p.id ? 'Starting…' : 'Start quiz'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
