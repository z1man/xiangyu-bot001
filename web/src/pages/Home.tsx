import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div>
      <h1>AP Lang Practice</h1>
      <p style={{ color: '#666' }}>
        Passage-based multiple-choice practice for AP English Language & Composition.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <Link to="/practice">Go to Practice</Link>
        <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}
