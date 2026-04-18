import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '1rem' }}>
      <Link to="/">Dashboard</Link>
      <Link to="/dogs">Dogs</Link>
      <Link to="/walks">Walk Requests</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}
