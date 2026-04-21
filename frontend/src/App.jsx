import { Routes, Route, Link } from 'react-router-dom';
import OwnerView from './OwnerView';
import WalkerView from './WalkerView';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RolePage from './pages/RolePage';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <header className="main-header">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1><span style={{ color: 'var(--accent-color)' }}>Dog</span>Go</h1>
        </Link>
        <nav>
          <Link to="/login" className="btn btn-outline" style={{ marginRight: '1rem' }}>Log In</Link>
          <Link to="/signup" className="btn">Sign Up</Link>
        </nav>
      </header>

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
              <img src="/hero.png" alt="Happy dog being walked" className="hero-image" />
            </div>
          </div>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/role" element={<RolePage />} />
        <Route path="/owner" element={<OwnerView />} />
        <Route path="/walker" element={<WalkerView />} />
      </Routes>
    </div>
  );
}

export default App;
