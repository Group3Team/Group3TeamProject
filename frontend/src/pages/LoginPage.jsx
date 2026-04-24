import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
    navigate('/role');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome Back</h2>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Email</label>
          <input
            className="input-field"
            type="email"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <label style={labelStyle}>Password</label>
          <input
            className="input-field"
            type="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button className="btn" type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
            Log In
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--background-light)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '0.3rem', fontWeight: '600', color: 'var(--background-light)' };
