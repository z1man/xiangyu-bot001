import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { getToken } from './lib/api';
import { HomePage } from './pages/Home';
import { LoginPage } from './pages/Login';
import { PracticePage } from './pages/Practice';
import { QuizPage } from './pages/Quiz';
import { RegisterPage } from './pages/Register';
import { ResultPage } from './pages/Result';
import { HistoryPage } from './pages/History';
import { AttemptPage } from './pages/Attempt';
import { SettingsPage } from './pages/Settings';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_0%,rgba(99,102,241,0.16),transparent_60%),radial-gradient(900px_500px_at_100%_0%,rgba(217,70,239,0.12),transparent_50%)]">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/practice"
            element={
              <RequireAuth>
                <PracticePage />
              </RequireAuth>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <RequireAuth>
                <QuizPage />
              </RequireAuth>
            }
          />
          <Route
            path="/result"
            element={
              <RequireAuth>
                <ResultPage />
              </RequireAuth>
            }
          />
          <Route
            path="/history"
            element={
              <RequireAuth>
                <HistoryPage />
              </RequireAuth>
            }
          />
          <Route
            path="/attempt/:attemptId"
            element={
              <RequireAuth>
                <AttemptPage />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
