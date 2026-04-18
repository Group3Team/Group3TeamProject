import { useEffect, useState } from 'react';
import { getDogs } from '../services/api';

export default function DogsPage() {
  const [dogs, setDogs] = useState([]);

  useEffect(() => {
    getDogs().then(r => setDogs(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Dogs 🐕</h1>
      <p style={{ margin: '0.5rem 0 2rem' }}>All dogs registered to your account.</p>

      {dogs.length === 0 ? (
        <div style={emptyBox}>No dogs found. Add your first dog!</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {dogs.map(d => (
            <div key={d.id} style={cardStyle}>
              <h2>{d.name}</h2>
              <p>{d.breed} — {d.size}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  backgroundColor: '#fff', borderRadius: '12px', padding: '1.2rem 1.5rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minWidth: '180px', flex: '1',
};

const emptyBox = {
  backgroundColor: '#d8f3dc', borderRadius: '12px', padding: '1.5rem',
  color: '#1b4332', fontWeight: '600',
};
