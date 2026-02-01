import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            AP English Language & Composition
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">
            Practice like a pro.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Passage-based multiple-choice practice with instant scoring, review, and rubric tracking.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/practice">Go to Practice</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/login">Log in</Link>
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
              <div className="font-semibold text-slate-900">10 questions</div>
              <div className="mt-1">Per practice quiz</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
              <div className="font-semibold text-slate-900">Rubric</div>
              <div className="mt-1">Evidence · Reasoning · Style</div>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-indigo-600 to-fuchsia-600" />
          <CardHeader>
            <CardTitle>What you get</CardTitle>
            <CardDescription>Clean workflow, consistent feedback.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600" />
                Passage library + one-click practice
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-fuchsia-600" />
                Review: correct vs your choice + explanations
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600" />
                History dashboard to track progress
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
