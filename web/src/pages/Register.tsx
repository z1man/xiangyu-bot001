import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, setToken } from '../lib/api';

export function RegisterPage() {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <h2>Create an account</h2>
      <p style={{ color: '#666' }}>Username (3–32). Password (8+).</p>

      <form
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. neo" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="at least 8 characters" />
          </label>

          {error && <div style={{ color: 'crimson' }}>{error}</div>}

          <button disabled={loading} type="submit">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </div>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in</Link>.
      </p>
    </div>
  );
}
