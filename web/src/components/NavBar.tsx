import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearToken, getToken } from '../lib/api';
import { Button } from './ui/button';

function NavLink({ to, label }: { to: string; label: string }) {
  const loc = useLocation();
  const active = loc.pathname === to || (to !== '/' && loc.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={
        'rounded-full px-3 py-1.5 text-sm font-medium transition ' +
        (active
          ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')
      }
    >
      {label}
    </Link>
  );
}

export function NavBar() {
  const nav = useNavigate();
  const token = getToken();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 shadow-sm shadow-indigo-600/30" />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight text-slate-900">AP Lang</div>
              <div className="-mt-0.5 text-xs font-medium text-slate-500">Practice</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink to="/practice" label="Practice" />
            <NavLink to="/history" label="History" />
            <NavLink to="/settings" label="Settings" />
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
        <nav className="flex gap-2">
          <NavLink to="/practice" label="Practice" />
          <NavLink to="/history" label="History" />
          <NavLink to="/settings" label="Settings" />
        </nav>
      </div>
    </header>
  );
}
