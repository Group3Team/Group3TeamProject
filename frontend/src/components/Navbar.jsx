import { Link, useLocation } from 'react-router-dom';

const navStyle = {
  backgroundColor: '#2d6a4f',
  padding: '1rem 2rem',
  display: 'flex',
  alignItems: 'center',
  gap: '2rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

const brandStyle = {
  color: '#fff',
  fontSize: '1.3rem',
  fontWeight: '700',
  marginRight: 'auto',
  textDecoration: 'none',
};

const linkStyle = {
  color: '#d8f3dc',
  fontWeight: '600',
  fontSize: '0.95rem',
  textDecoration: 'none',
  padding: '0.3rem 0.8rem',
  borderRadius: '6px',
  transition: 'background 0.2s',
};

const activeLinkStyle = {
  ...linkStyle,
  backgroundColor: '#1b4332',
  color: '#fff',
};

export default function Navbar() {
  const { pathname } = useLocation();

  const link = (to, label) => (
    <Link to={to} style={pathname === to ? activeLinkStyle : linkStyle}>
      {label}
    </Link>
  );

  return (
    <nav style={navStyle}>
      <Link to="/" style={brandStyle}>🐾 PawWalker</Link>
      {link('/', 'Dashboard')}
      {link('/dogs', 'Dogs')}
      {link('/walks', 'Walk Requests')}
      {link('/login', 'Login')}
    </nav>
  );
}
