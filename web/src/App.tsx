import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { NavBar } from './components/NavBar';
import { getToken } from './lib/api';
import { HomePage } from './pages/Home';
import { LoginPage } from './pages/Login';
import { PracticePage } from './pages/Practice';
import { QuizPage } from './pages/Quiz';
import { RegisterPage } from './pages/Register';
import { ResultPage } from './pages/Result';

function RequireAuth({ children }: { children: React.ReactElement }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
