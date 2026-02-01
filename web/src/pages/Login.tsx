import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, setToken } from '../lib/api';

export function LoginPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <h2>Log in</h2>
      <p style={{ color: '#666' }}>Use your username and password to log in.</p>

      <form
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. neo" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
          </label>

          {error && <div style={{ color: 'crimson' }}>{error}</div>}

          <button disabled={loading} type="submit">
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </div>
      </form>

      <p>
        No account yet? <Link to="/register">Create one</Link>.
      </p>
    </div>
  );
}
