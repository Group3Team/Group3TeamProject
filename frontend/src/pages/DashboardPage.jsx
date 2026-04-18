export default function DashboardPage() {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Welcome to PawWalker 🐶</h1>
      <p style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}>
        Connect dog owners with trusted walkers in your area.
      </p>

      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
        {[
          { title: 'My Dogs', desc: 'Manage your dogs profile', link: '/dogs', color: '#d8f3dc' },
          { title: 'Walk Requests', desc: 'View and manage walk requests', link: '/walks', color: '#b7e4c7' },
          { title: 'Login', desc: 'Sign in to your account', link: '/login', color: '#95d5b2' },
        ].map(card => (
          <a key={card.title} href={card.link} style={{
            backgroundColor: card.color,
            borderRadius: '12px',
            padding: '1.5rem',
            minWidth: '180px',
            flex: '1',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s',
            color: '#1b4332',
            textDecoration: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <h2 style={{ marginBottom: '0.4rem' }}>{card.title}</h2>
            <p style={{ fontSize: '0.9rem' }}>{card.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
