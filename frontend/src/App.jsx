import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import OwnerView from './OwnerView';
import WalkerView from './WalkerView';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RolePage from './pages/RolePage';
import './index.css';

// ─────────────────────────────────────────────────────────────
// Header Component (Fixed: Added proper <header> tag)
// ─────────────────────────────────────────────────────────────
function Header({ isLoggedIn, onLogout }) {
  return (
    <header className="main-header" style={{ marginBottom: '2rem' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <span style={{ color: 'var(--accent-color)' }}>Dog</span>
        <span style={{ color: 'var(--primary-color)' }}>GO</span>
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isLoggedIn ? (
          <button className="btn btn-outline" onClick={onLogout}>Log Out</button>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline" style={{ marginRight: '1rem' }}>Log In</Link>
            <Link to="/signup" className="btn">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// HomeView Component (Extracted for root route)
// ─────────────────────────────────────────────────────────────
function HomeView() {
  return (
    <div className="hero-section">
      <div>
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.2 }}>
          Premium Dog Walking on Demand.
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: 'var(--background-light)', lineHeight: 1.6 }}>
          Connect with trusted, local dog walkers instantly. Give your furry best friend the walk they deserve while you focus on your day.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/signup" className="btn btn-large">Get Started</Link>
          <Link to="/login" className="btn btn-large btn-outline">Log In</Link>
        </div>
      </div>
      <div className="hero-image-container">
        <img src="/hero.png" alt="Happy dog being walked" className="hero-image" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AppContent Component (Fixed: Routes wrapped in <Routes>)
// ─────────────────────────────────────────────────────────────
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/login" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/signup" element={<SignupPage onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/role" element={<RolePage />} />
        <Route path="/owner" element={<OwnerView />} />
        <Route path="/walker" element={<WalkerView />} />
      </Routes>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main App Component - Router is in main.jsx, just render the container here
// ─────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="app-container">
      <AppContent />
    </div>
  );
}