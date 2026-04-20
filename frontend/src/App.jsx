import { Routes, Route, Link } from 'react-router-dom';
import OwnerView from './OwnerView';
import WalkerView from './WalkerView';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <header className="main-header">
        <h1><span style={{ color: 'var(--accent-color)' }}>Dog</span>Go</h1>
        <nav>
          <Link to="/owner" className="btn btn-outline" style={{ marginRight: '1rem' }}>I am an Owner</Link>
          <Link to="/walker" className="btn">I am a Walker</Link>
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
                <Link to="/owner" className="btn btn-large">Request a Walk</Link>
                <Link to="/walker" className="btn btn-large btn-outline">Start Earning</Link>
              </div>
            </div>
            <div className="hero-image-container">
              <img src="/hero.png" alt="Happy dog being walked" className="hero-image" />
            </div>
          </div>
        } />
        <Route path="/owner" element={<OwnerView />} />
        <Route path="/walker" element={<WalkerView />} />
      </Routes>
    </div>
  );
}

export default App;
