export default function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Login</h1>

        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" placeholder="you@example.com" />

        <label style={labelStyle}>Password</label>
        <input style={inputStyle} type="password" placeholder="••••••••" />

        <button style={btnStyle}>Sign In</button>

        <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Don't have an account? <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', marginBottom: '0.3rem', fontWeight: '600', color: '#2d6a4f' };
const inputStyle = {
  width: '100%', padding: '0.7rem 1rem', marginBottom: '1rem',
  borderRadius: '8px', border: '1px solid #b7e4c7', fontSize: '1rem', outline: 'none',
};
const btnStyle = {
  width: '100%', padding: '0.8rem', backgroundColor: '#2d6a4f',
  color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem',
  fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem',
};
