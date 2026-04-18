import { useEffect, useState } from 'react';
import { getWalkRequests } from '../services/api';

const statusColors = {
  SEARCHING: '#fff3cd',
  ACCEPTED: '#d8f3dc',
  IN_PROGRESS: '#b7e4c7',
  COMPLETED: '#95d5b2',
  CANCELLED: '#f8d7da',
};

export default function WalkRequestsPage() {
  const [walks, setWalks] = useState([]);

  useEffect(() => {
    getWalkRequests().then(r => setWalks(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Walk Requests 🦮</h1>
      <p style={{ margin: '0.5rem 0 2rem' }}>Track all your walk requests here.</p>

      {walks.length === 0 ? (
        <div style={emptyBox}>No walk requests found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {walks.map(w => (
            <div key={w.id} style={{ ...cardStyle, backgroundColor: statusColors[w.status] || '#fff' }}>
              <h2>Walk #{w.id}</h2>
              <p>Status: <strong>{w.status}</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  borderRadius: '12px', padding: '1.2rem 1.5rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
};

const emptyBox = {
  backgroundColor: '#d8f3dc', borderRadius: '12px', padding: '1.5rem',
  color: '#1b4332', fontWeight: '600',
};
