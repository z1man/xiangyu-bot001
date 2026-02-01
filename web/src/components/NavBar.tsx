import { Link, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../lib/api';

export function NavBar() {
  const nav = useNavigate();
  const token = getToken();

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0' }}>
      <Link to="/">Home</Link>
      <Link to="/practice">Practice</Link>
      <Link to="/history">History</Link>
      <Link to="/settings">Settings</Link>
      <div style={{ flex: 1 }} />
      {token ? (
        <button
          onClick={() => {
            clearToken();
            nav('/login');
          }}
        >
          Log out
        </button>
      ) : (
        <>
          <Link to="/login">Log in</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </div>
  );
}
