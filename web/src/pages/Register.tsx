import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, setToken } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

export function RegisterPage() {
  const nav = useNavigate();
  const userId = useId();
  const passId = useId();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto grid max-w-5xl place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Username (3–32). Password (8+).</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const res = await register(username, password);
                setToken(res.token);
                nav('/practice');
              } catch (err: any) {
                setError(err.message ?? 'Registration failed');
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="grid gap-2">
              <label htmlFor={userId} className="text-sm font-medium text-slate-700">
                Username
              </label>
              <Input id={userId} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. neo" />
            </div>
            <div className="grid gap-2">
              <label htmlFor={passId} className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Input
                id={passId}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="at least 8 characters"
              />
            </div>

            {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <Button disabled={loading} type="submit" className="w-full">
              {loading ? 'Creating…' : 'Create account'}
            </Button>

            <div className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link className="font-medium text-slate-900 underline underline-offset-4" to="/login">
                Log in
              </Link>
              .
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
