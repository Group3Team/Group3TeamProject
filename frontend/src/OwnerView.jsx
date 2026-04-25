import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
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
  const position = [51.505, -0.09];
  const navigate = useNavigate();

  // Poll for status updates once a request is created
  useEffect(() => {
    let interval;
    if (activeRequestId && step !== 'request' && step !== 'completed') {
      const checkStatus = async () => {
        try {
          const response = await fetch(`http://localhost:8001/api/walks/${activeRequestId}/`);
          const data = await response.json();
          
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
      
      const payload = {
        owner: 1, 
        dogs: [], 
        status: 'SEARCHING',
        pickup_location: {
          type: 'Point',
          coordinates: [-0.09, 51.505]
        },
        owner_phone: ownerPhone,
        owner_address: ownerAddress,
        duration_minutes: parseInt(duration),
      };

      const response = await fetch('http://localhost:8001/api/walks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create walk request');
      }

      const data = await response.json();
      setActiveRequestId(data.id);
      
      // Removed simulations - the useEffect polling will now drive the state changes
    } catch (error) {
      console.error('Error requesting walk:', error);
      alert('Failed to request walk. Please ensure backend is running.');
      setStep('request');
    }
  };

  return (
    <div className="grid-2 animate-fade-in">
      <div className="glass-panel">
        <button className="btn btn-outline" onClick={() => navigate('/role')} style={{ marginBottom: '1.5rem', padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
          ← Back to Menu
        </button>
        <h2>Request a Dog Walker</h2>
        
        {step === 'request' && (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Owner Phone Number</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g., 555-0123"
                value={ownerPhone} 
                onChange={(e) => setOwnerPhone(e.target.value)} 
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Pickup Address</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="123 Bark St, Woof City"
                value={ownerAddress} 
                onChange={(e) => setOwnerAddress(e.target.value)} 
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Walk Duration (minutes)</label>
              <input 
                type="number" 
                className="input-field" 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)} 
                min="15" 
                step="15"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Number of Dogs</label>
              <input 
                type="number" 
                className="input-field" 
                value={dogs} 
                onChange={(e) => setDogs(e.target.value)} 
                min="1" 
                max="5"
              />
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
          </div>
        )}

        {step === 'arriving' && (
          <div>
            <div className="status-badge" style={{ background: 'var(--primary-color)' }}>Walker Arriving</div>
            
            <div className="walker-card">
              <img src="/walker.png" alt="Alex the walker" className="walker-avatar" />
              <div>
                <h3 style={{ marginBottom: '0.2rem' }}>Alex is on the way!</h3>
                <p style={{ color: 'var(--background-light)', margin: 0 }}>★ 4.9 (120 walks) • Estimated arrival: 4 mins</p>
              </div>
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <h4>Chat with Alex</h4>
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
            <p style={{ marginBottom: '2rem' }}>Payment of $25.00 has been released.</p>
            <button className="btn" onClick={() => setStep('request')}>New Walk</button>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="map-container">
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>Your Location</Popup>
            </Marker>
            {(step === 'arriving' || step === 'in_progress') && (
              <Marker position={[51.509, -0.08]}>
                 <Popup>Walker</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
