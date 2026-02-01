import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, setToken } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';

export function LoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto grid max-w-5xl place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Use your username and password to log in.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const res = await login(username, password);
                setToken(res.token);
                nav('/practice');
              } catch (err: any) {
                setError(err.message ?? 'Login failed');
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. neo" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
            </div>

            {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            <Button disabled={loading} type="submit" className="w-full">
              {loading ? 'Logging in…' : 'Log in'}
            </Button>

            <div className="text-sm text-slate-600">
              No account yet?{' '}
              <Link className="font-medium text-slate-900 underline underline-offset-4" to="/register">
                Create one
              </Link>
              .
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
