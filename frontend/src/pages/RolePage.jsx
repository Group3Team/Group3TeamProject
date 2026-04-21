import { useNavigate } from 'react-router-dom';

export default function RolePage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Who are you?</h2>
      <p style={{ color: 'var(--background-light)', marginBottom: '3rem', fontSize: '1.1rem' }}>
        Choose your role to get started
      </p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className="glass-panel"
          onClick={() => navigate('/owner')}
          style={roleCardStyle}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐾</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>I'm an Owner</h3>
          <p style={{ color: 'var(--background-light)', fontSize: '0.95rem' }}>
            Request a trusted walker for your dog
          </p>
        </button>

        <button
          className="glass-panel"
          onClick={() => navigate('/walker')}
          style={roleCardStyle}
        >
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🦮</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>I'm a Walker</h3>
          <p style={{ color: 'var(--background-light)', fontSize: '0.95rem' }}>
            Accept walk requests and start earning
          </p>
        </button>
      </div>
    </div>
  );
}

const roleCardStyle = {
  width: '240px',
  textAlign: 'center',
  cursor: 'pointer',
  border: 'none',
  background: 'var(--glass-bg)',
  color: 'var(--text-light)',
  padding: '2.5rem 2rem',
  transition: 'all 0.3s ease',
};
