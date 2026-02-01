import { Link, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../lib/api';
import { Button } from './ui/button';

export function NavBar() {
  const nav = useNavigate();
  const token = getToken();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold text-slate-900">
            AP Lang Practice
          </Link>
          <nav className="hidden items-center gap-3 text-sm text-slate-600 sm:flex">
            <Link className="hover:text-slate-900" to="/practice">
              Practice
            </Link>
            <Link className="hover:text-slate-900" to="/history">
              History
            </Link>
            <Link className="hover:text-slate-900" to="/settings">
              Settings
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {!token ? (
            <>
              <Button variant="ghost" onClick={() => nav('/login')}>
                Log in
              </Button>
              <Button variant="outline" onClick={() => nav('/register')}>
                Register
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                clearToken();
                nav('/login');
              }}
            >
              Log out
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-3 sm:hidden">
        <nav className="flex gap-3 text-sm text-slate-600">
          <Link className="hover:text-slate-900" to="/practice">
            Practice
          </Link>
          <Link className="hover:text-slate-900" to="/history">
            History
          </Link>
          <Link className="hover:text-slate-900" to="/settings">
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
