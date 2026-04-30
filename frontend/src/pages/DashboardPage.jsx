import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--background-light)' }}>
            Welcome, <strong>{user?.username}</strong> · {user?.role}
          </p>
        </div>
        <button className="btn btn-outline" onClick={logout}>Log Out</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {user?.role === 'OWNER' ? (
          <Link to="/owner" className="btn" style={{ textDecoration: 'none' }}>🗺 Request a Walk</Link>
        ) : (
          <Link to="/walker" className="btn" style={{ textDecoration: 'none' }}>🗺 Walker Map & Jobs</Link>
        )}
      </div>

      {user?.role === 'OWNER' ? <OwnerDashboard /> : <WalkerDashboard />}
    </div>
  );
}

// ── Owner: Dogs CRUD ────────────────────────────────────────────────────────

const SIZE_LABELS = { SMALL: 'Small', MEDIUM: 'Medium', LARGE: 'Large' };
const emptyDogForm = { name: '', breed: '', size: 'MEDIUM', notes: '' };

function OwnerDashboard() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyDogForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchDogs = useCallback(async () => {
    try {
      const { data } = await api.get('/dogs/');
      setDogs(data);
    } catch {
      setError('Failed to load dogs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDogs(); }, [fetchDogs]);

  const openAdd = () => { setForm(emptyDogForm); setEditingId(null); setShowForm(true); };
  const openEdit = (dog) => {
    setForm({ name: dog.name, breed: dog.breed, size: dog.size, notes: dog.notes });
    setEditingId(dog.id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await api.patch(`/dogs/${editingId}/`, form);
        setDogs((prev) => prev.map((d) => (d.id === editingId ? data : d)));
      } else {
        const { data } = await api.post('/dogs/', form);
        setDogs((prev) => [...prev, data]);
      }
      setShowForm(false);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/dogs/${id}/`);
      setDogs((prev) => prev.filter((d) => d.id !== id));
      setDeleteConfirm(null);
    } catch {
      setError('Failed to delete. Please try again.');
    }
  };

  return (
    <>
      {error && (
        <p style={{ color: '#d63031', background: 'rgba(214,48,49,0.1)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer' }}
          onClick={() => setError('')}>
          {error} <span style={{ float: 'right' }}>✕</span>
        </p>
      )}

      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>My Dogs</h3>
          <button className="btn" onClick={openAdd}>+ Add Dog</button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ marginTop: 0 }}>{editingId ? 'Edit Dog' : 'Add New Dog'}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input className="input-field" required placeholder="Buddy" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Breed</label>
                <input className="input-field" placeholder="Golden Retriever" value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Size *</label>
                <select className="input-field" value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}>
                  <option value="SMALL">Small</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LARGE">Large</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <input className="input-field" placeholder="Loves fetch..." value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Dog' : 'Add Dog'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p style={{ color: 'var(--background-light)', textAlign: 'center', padding: '2rem' }}>Loading your dogs...</p>
        ) : dogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--background-light)' }}>
            <p style={{ fontSize: '3rem', margin: '0 0 0.5rem' }}>🐶</p>
            <p>No dogs yet. Add your first dog above!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  {['Name', 'Breed', 'Size', 'Notes', 'Actions'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--background-light)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dogs.map((dog) => (
                  <tr key={dog.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={cellStyle}><strong>{dog.name}</strong></td>
                    <td style={cellStyle}>{dog.breed || '—'}</td>
                    <td style={cellStyle}>
                      <span style={{ background: 'rgba(108,92,231,0.2)', color: 'var(--secondary-color)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' }}>
                        {SIZE_LABELS[dog.size]}
                      </span>
                    </td>
                    <td style={{ ...cellStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dog.notes || '—'}</td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem' }} onClick={() => openEdit(dog)}>Edit</button>
                        <button style={{ padding: '0.3rem 0.75rem', fontSize: '0.85rem', background: 'rgba(214,48,49,0.15)', color: '#d63031', border: '1px solid rgba(214,48,49,0.3)', borderRadius: '8px', cursor: 'pointer' }}
                          onClick={() => setDeleteConfirm(dog)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ marginTop: 0 }}>Delete {deleteConfirm.name}?</h3>
            <p style={{ color: 'var(--background-light)' }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button style={{ padding: '0.6rem 1.5rem', background: '#d63031', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => handleDelete(deleteConfirm.id)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Walker: Walk Requests ───────────────────────────────────────────────────

const STATUS_COLORS = {
  SEARCHING: '#fdcb6e',
  ACCEPTED: '#6c5ce7',
  ARRIVING: '#00cec9',
  IN_PROGRESS: '#00b894',
  COMPLETED: '#a29bfe',
  CANCELLED: '#d63031',
};

function WalkerDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      const { data } = await api.get('/walk-requests/');
      setRequests(data);
    } catch {
      setError('Failed to load walk requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/walk-requests/${id}/`, { status });
      setRequests((prev) => prev.map((r) => (r.id === id ? data : r)));
    } catch {
      setError('Failed to update status.');
    }
  };

  return (
    <>
      {error && (
        <p style={{ color: '#d63031', background: 'rgba(214,48,49,0.1)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer' }}
          onClick={() => setError('')}>
          {error} <span style={{ float: 'right' }}>✕</span>
        </p>
      )}

      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>My Walk Requests</h3>
          <button className="btn btn-outline" style={{ fontSize: '0.85rem' }} onClick={fetchRequests}>Refresh</button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--background-light)', textAlign: 'center', padding: '2rem' }}>Loading walk requests...</p>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--background-light)' }}>
            <p style={{ fontSize: '3rem', margin: '0 0 0.5rem' }}>🦮</p>
            <p>No walk requests assigned to you yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.map((req) => (
              <div key={req.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '600' }}>Walk #{req.id}</p>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--background-light)', fontSize: '0.85rem' }}>
                      {req.owner_address || 'No address provided'} · {req.duration_minutes ? `${req.duration_minutes} min` : '—'}
                    </p>
                  </div>
                  <span style={{ background: STATUS_COLORS[req.status] + '33', color: STATUS_COLORS[req.status], padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {req.status === 'SEARCHING' && (
                    <button className="btn" style={{ fontSize: '0.85rem', padding: '0.3rem 0.9rem' }} onClick={() => updateStatus(req.id, 'ACCEPTED')}>Accept</button>
                  )}
                  {req.status === 'ACCEPTED' && (
                    <button className="btn" style={{ fontSize: '0.85rem', padding: '0.3rem 0.9rem' }} onClick={() => updateStatus(req.id, 'IN_PROGRESS')}>Start Walk</button>
                  )}
                  {req.status === 'IN_PROGRESS' && (
                    <button className="btn" style={{ fontSize: '0.85rem', padding: '0.3rem 0.9rem', background: 'var(--success-color)' }} onClick={() => updateStatus(req.id, 'COMPLETED')}>Complete Walk</button>
                  )}
                  {(req.status === 'SEARCHING' || req.status === 'ACCEPTED') && (
                    <button style={{ fontSize: '0.85rem', padding: '0.3rem 0.9rem', background: 'rgba(214,48,49,0.15)', color: '#d63031', border: '1px solid rgba(214,48,49,0.3)', borderRadius: '8px', cursor: 'pointer' }}
                      onClick={() => updateStatus(req.id, 'CANCELLED')}>Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const labelStyle = { display: 'block', marginBottom: '0.3rem', fontWeight: '600', color: 'var(--background-light)', fontSize: '0.85rem' };
const cellStyle = { padding: '0.85rem 1rem', color: '#fff' };
