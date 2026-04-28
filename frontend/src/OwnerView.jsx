import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import api from './services/api'; // ✅ Import configured axios instance

// Fix default Leaflet marker icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function OwnerView() {
  const [step, setStep] = useState('request');
  const [dogs, setDogs] = useState(1);
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [duration, setDuration] = useState(30);
  const [activeRequestId, setActiveRequestId] = useState(null);
  
  // ✅ Dynamic user location instead of hardcoded [51.505, -0.09]
  const [userLocation, setUserLocation] = useState([51.505, -0.09]); 
  const [locationError, setLocationError] = useState(null);

  const navigate = useNavigate();

  // ✅ Fetch real geolocation on component mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      () => {
        setLocationError('Location access denied. Using default location.');
      }
    );
  }, []);

  // ✅ Poll for backend status updates
  useEffect(() => {
    let interval;
    if (activeRequestId && step !== 'request' && step !== 'completed') {
      const checkStatus = async () => {
        try {
          // ✅ Uses axios instance & correct /walk-requests/ endpoint
          const response = await api.get(`/walk-requests/${activeRequestId}/`);
          const data = response.data;
          if (data.status === 'ACCEPTED') setStep('arriving');
          if (data.status === 'IN_PROGRESS') setStep('in_progress');
          if (data.status === 'COMPLETED') setStep('completed');
        } catch (error) {
          console.error('Error checking walk status:', error);
        }
      };
      checkStatus();
      interval = setInterval(checkStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [activeRequestId, step]);

  const requestWalk = async () => {
    try {
      setStep('searching');
      
      // ✅ Removed hardcoded owner: 1. Backend `perform_create` will auto-assign `request.user`.
      // ✅ Uses real geolocation in PostGIS WKT format: POINT(longitude latitude)
      const payload = {
        dogs: [], 
        status: 'SEARCHING',
        pickup_location: `POINT(${userLocation[1]} ${userLocation[0]})`,
        owner_phone: ownerPhone,
        owner_address: ownerAddress,
        duration_minutes: parseInt(duration),
      };

      // ✅ Uses axios instance (automatically attaches JWT token)
      const response = await api.post('/walk-requests/', payload);

      setActiveRequestId(response.data.id);
    } catch (error) {
      console.error('Error requesting walk:', error);
      alert('Failed to request walk. Please check your connection or login.');
      setStep('request');
    }
  };

  const cancelRequest = async () => {
    if (!activeRequestId) return;
    try {
      // ✅ Uses axios instance
      await api.delete(`/walk-requests/${activeRequestId}/`);
      setStep('request');
      setActiveRequestId(null);
    } catch (error) {
      console.error('Error canceling walk:', error);
      alert('Failed to cancel request.');
    }
  };

  return (
    <div className="app-container">
      <button className="btn btn-outline" onClick={() => navigate('/role')} style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
        ← Back to Menu
      </button>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Request a Dog Walker</h2>
        
        {locationError && <p style={{color: 'var(--accent-color)', marginBottom: '1rem'}}>{locationError}</p>}

        {step === 'request' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Owner Phone Number</label>
              <input type="text" className="input-field" placeholder="e.g., 555-0123" value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Pickup Address</label>
              <input type="text" className="input-field" placeholder="123 Bark St, Woof City" value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Walk Duration (minutes)</label>
              <input type="number" className="input-field" value={duration} onChange={(e) => setDuration(e.target.value)} min="15" step="15" />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Number of Dogs</label>
              <input type="number" className="input-field" value={dogs} onChange={(e) => setDogs(e.target.value)} min="1" max="5" />
            </div>
            <button className="btn" style={{ width: '100%', marginTop: '1rem' }} onClick={requestWalk}>
              Find Walker Now
            </button>
          </div>
        )}

        {step === 'searching' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="status-badge">Searching...</div>
            <h3>Finding the best walker nearby...</h3>
            <div style={{ marginTop: '2rem', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '50%', height: '100%', background: 'var(--accent-color)', animation: 'slide 2s infinite linear' }} />
            </div>
            <style>{`@keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
            <button className="btn btn-outline" style={{ marginTop: '2rem', borderColor: '#d63031', color: '#d63031' }} onClick={cancelRequest}>
              Cancel Request
            </button>
          </div>
        )}

        {step === 'arriving' && (
          <div>
            <div className="status-badge" style={{ background: 'var(--primary-color)' }}>Walker Arriving</div>
            <div className="walker-card">
              <img src="/walker.png" alt="Walker avatar" className="walker-avatar" />
              <div>
                <h3 style={{ marginBottom: '0.2rem' }}>Walker is on the way!</h3>
                <p style={{ color: 'var(--background-light)', margin: 0 }}>★ 4.9 • Estimated arrival: 4 mins</p>
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h4>Chat with Walker</h4>
              <div style={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderBottom: '1px solid var(--glass-border)', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                <div style={{ background: 'var(--primary-color)', padding: '0.5rem', borderRadius: '8px', alignSelf: 'flex-start', marginBottom: '0.5rem' }}>Hi, I'm 2 blocks away!</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="text" className="input-field" style={{ marginBottom: 0 }} placeholder="Type a message..." />
                <button className="btn" style={{ padding: '0.5rem 1rem' }}>Send</button>
              </div>
            </div>
            <button className="btn" style={{ width: '100%', background: 'var(--success-color)' }} onClick={() => setStep('in_progress')}>
              Simulate: Handover Dogs
            </button>
          </div>
        )}

        {step === 'in_progress' && (
          <div>
            <div className="status-badge" style={{ background: 'var(--success-color)' }}>Walk in Progress</div>
            <h3>Your dogs are having a great time!</h3>
            <div style={{ marginTop: '2rem' }}>
              <button className="btn" style={{ width: '100%', marginBottom: '1rem', background: 'var(--secondary-color)' }}>
                Request Photo Update
              </button>
              <button className="btn" style={{ width: '100%' }} onClick={() => setStep('completed')}>
                Simulate: Complete Walk
              </button>
            </div>
          </div>
        )}

        {step === 'completed' && (
          <div style={{ textAlign: 'center' }}>
            <div className="status-badge" style={{ background: 'var(--success-color)' }}>Completed</div>
            <h3>Walk Finished!</h3>
            <p style={{ marginBottom: '2rem' }}>Payment has been processed.</p>
            <button className="btn" onClick={() => setStep('request')}>New Walk</button>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="map-container">
          <MapContainer center={userLocation} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={userLocation}>
              <Popup>Your Location</Popup>
            </Marker>
            {(step === 'arriving' || step === 'in_progress') && (
              <Marker position={[userLocation[0] + 0.004, userLocation[1] + 0.004]}>
                <Popup>Walker Location</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}