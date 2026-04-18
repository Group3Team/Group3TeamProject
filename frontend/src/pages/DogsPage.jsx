import { useEffect, useState } from 'react';
import { getDogs } from '../services/api';

export default function DogsPage() {
  const [dogs, setDogs] = useState([]);

  useEffect(() => {
    getDogs().then(r => setDogs(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dogs</h1>
      {dogs.length === 0 ? <p>No dogs found.</p> : dogs.map(d => <p key={d.id}>{d.name}</p>)}
    </div>
  );
}
