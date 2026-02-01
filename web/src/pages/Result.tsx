import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Legacy route kept for backward compatibility.
// Canonical view is /attempt/:attemptId
export function ResultPage() {
  const nav = useNavigate();
  const location = useLocation();
  const attemptId = (location.state as any)?.attemptId as string | undefined;

  useEffect(() => {
    if (attemptId) nav(`/attempt/${attemptId}`, { replace: true });
  }, [attemptId, nav]);

  if (!attemptId) {
    return (
      <div>
        <h2>Result</h2>
        <p style={{ color: 'crimson' }}>Missing attempt id. Please complete a quiz first.</p>
        <button onClick={() => nav('/practice')}>Back to Practice</button>
      </div>
    );
  }

  return <div>Redirecting…</div>;
}
