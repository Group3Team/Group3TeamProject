import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import OwnerView from './OwnerView';
import WalkerView from './WalkerView';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RolePage from './pages/RolePage';
import DashboardPage from './pages/DashboardPage';
import './index.css';

function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="main-header">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1><span style={{ color: 'var(--accent-color)' }}>Dog</span>
        <span style={{ color: 'var(--primary-color)' }}>GO</span></h1>
      </Link>
      <nav>
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="btn btn-outline" style={{ marginRight: '1rem' }}>Dashboard</Link>
            {user?.role === 'OWNER' ? (
              <Link to="/owner" className="btn btn-outline" style={{ marginRight: '1rem' }}>Request Walk</Link>
            ) : (
              <Link to="/walker" className="btn btn-outline" style={{ marginRight: '1rem' }}>Find Jobs</Link>
            )}
            <button className="btn btn-outline" onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline" style={{ marginRight: '1rem' }}>Log In</Link>
            <Link to="/signup" className="btn">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}

function AppContent() {
  return (
    <div className="app-container">
      <Header />
      <Routes>
        <Route path="/" element={
          <div className="hero-section animate-fade-in">
            <div className="hero-content">
              <h2 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.2 }}>Premium Dog Walking on Demand.</h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--background-light)', lineHeight: 1.6 }}>
                Connect with trusted, local dog walkers instantly. Give your furry best friend the walk they deserve while you focus on your day.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/signup" className="btn btn-large">Get Started</Link>
                <Link to="/login" className="btn btn-large btn-outline">Log In</Link>
              </div>
            </div>
            <div className="hero-image-container">
              <img src="/hero.png" alt="Guillermo Trigger!" className="hero-image" />
            </div>
          </div>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/role" element={<PrivateRoute><RolePage /></PrivateRoute>} />
        <Route path="/owner" element={<PrivateRoute><OwnerView /></PrivateRoute>} />
        <Route path="/walker" element={<PrivateRoute><WalkerView /></PrivateRoute>} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
