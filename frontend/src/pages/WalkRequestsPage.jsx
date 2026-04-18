import { useEffect, useState } from 'react';
import { getWalkRequests } from '../services/api';

export default function WalkRequestsPage() {
  const [walks, setWalks] = useState([]);

  useEffect(() => {
    getWalkRequests().then(r => setWalks(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Walk Requests</h1>
      {walks.length === 0 ? <p>No walk requests found.</p> : walks.map(w => <p key={w.id}>{w.status}</p>)}
    </div>
  );
}
