import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function WalkerView() {
  const [isOnline, setIsOnline] = useState(false);
  const [request, setRequest] = useState(null); // null, pending, accepted, in_progress
  const position = [51.509, -0.08]; // Walker pos

  const toggleOnline = () => {
    if (!isOnline) {
      setIsOnline(true);
      // Simulate incoming request after 3 seconds
      setTimeout(() => {
        setRequest('pending');
      }, 3000);
    } else {
      setIsOnline(false);
      setRequest(null);
    }
  };

  return (
    <div className="grid-2 animate-fade-in">
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Walker Dashboard</h2>
          <div className="status-badge" style={{ background: isOnline ? 'var(--success-color)' : 'var(--background-dark)', margin: 0 }}>
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {!request && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <button 
              className="btn" 
              style={{ background: isOnline ? '#d63031' : 'var(--success-color)', width: '100%', padding: '1rem', fontSize: '1.2rem' }}
              onClick={toggleOnline}
            >
              {isOnline ? 'Go Offline' : 'Go Online to Receive Requests'}
            </button>
            {isOnline && <p style={{ marginTop: '1rem', color: 'var(--background-light)' }}>Looking for nearby dogs...</p>}
          </div>
        )}

        {request === 'pending' && (
          <div className="glass-panel" style={{ background: 'rgba(108, 92, 231, 0.2)', border: '1px solid var(--primary-color)' }}>
            <h3>New Walk Request!</h3>
            <p><strong>Distance:</strong> 1.2 miles away</p>
            <p><strong>Dogs:</strong> 2 (Medium, Large)</p>
            <p><strong>Earnings:</strong> $25.00</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn" style={{ flex: 1, background: 'var(--success-color)' }} onClick={() => setRequest('accepted')}>Accept</button>
              <button className="btn" style={{ flex: 1, background: '#d63031' }} onClick={() => setRequest(null)}>Decline</button>
            </div>
          </div>
        )}

        {request === 'accepted' && (
          <div>
            <h3>Head to Pickup</h3>
            <p style={{ marginBottom: '1.5rem' }}>The owner has been notified you are arriving.</p>
            <button className="btn" style={{ width: '100%', marginBottom: '1rem' }} onClick={() => setRequest('in_progress')}>
              Start Walk
            </button>
          </div>
        )}

        {request === 'in_progress' && (
          <div>
            <div className="status-badge" style={{ background: 'var(--success-color)' }}>Walk in Progress</div>
            <div style={{ margin: '2rem 0' }}>
              <button className="btn" style={{ width: '100%', marginBottom: '1rem', background: 'var(--secondary-color)' }}>
                Upload Photo Update
              </button>
              <button className="btn" style={{ width: '100%' }} onClick={() => setRequest(null)}>
                Complete Walk
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="map-container">
          <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>You</Popup>
            </Marker>
            {(request === 'pending' || request === 'accepted') && (
              <Marker position={[51.505, -0.09]}>
                <Popup>Pickup Location</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
