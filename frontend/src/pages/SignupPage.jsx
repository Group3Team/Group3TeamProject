import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage({ onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    onLogin();
    navigate('/role');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Create Account</h2>

        {error && (
          <p style={{ color: '#d63031', background: 'rgba(214,48,49,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Full Name</label>
          <input
            className="input-field"
            type="text"
            placeholder="John Doe"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

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

          <label style={labelStyle}>Confirm Password</label>
          <input
            className="input-field"
            type="password"
            placeholder="••••••••"
            required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />

          <button className="btn" type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
            Sign Up
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--background-light)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: '600' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '0.3rem', fontWeight: '600', color: 'var(--background-light)' };
