import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import PetsIcon from '@mui/icons-material/Pets';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

const SIZE_LABELS = { SMALL: 'Small', MEDIUM: 'Medium', LARGE: 'Large' };
const emptyDogForm = { name: '', breed: '', size: 'MEDIUM', notes: '' };

const STATUS_COLORS = {
  SEARCHING: 'warning',
  ACCEPTED: 'primary',
  ARRIVING: 'info',
  IN_PROGRESS: 'success',
  COMPLETED: 'secondary',
  CANCELLED: 'error',
};

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography sx={{ mb: 3 }} variant="h3">Dashboard</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Typography color="text.secondary">
            Welcome, <strong>{user?.username}</strong>
            {user?.role != null ? <> · {user.role}</> : null}
          </Typography>
          <Button variant="outlined" onClick={logout}>Log Out</Button>
        </Stack>
      </Paper>

      <Box sx={{ mb: 3 }}>
        {user?.role === 'OWNER' ? (
          <Button
            component={RouterLink}
            to="/owner"
            variant="contained"
            startIcon={<MapIcon />}
          >
            Request a Walk
          </Button>
        ) : (
          <Button
            component={RouterLink}
            to="/walker"
            variant="contained"
            startIcon={<MapIcon />}
          >
            Walker Map & Jobs
          </Button>
        )}
      </Box>

      {user?.role === 'OWNER' ? <OwnerDashboard /> : <WalkerDashboard />}
    </Container>
  );
}

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
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">My Dogs</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Dog</Button>
        </Stack>
        {showForm && (
          <Paper variant="outlined" component="form" onSubmit={handleSave} sx={{ p: 2.5, mb: 2.5 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {editingId ? 'Edit Dog' : 'Add New Dog'}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField label="Name" required placeholder="Buddy" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField label="Breed" placeholder="Golden Retriever" value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })} />
              <TextField select label="Size" required value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}>
                <MenuItem value="SMALL">Small</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LARGE">Large</MenuItem>
              </TextField>
              <TextField label="Notes" placeholder="Loves fetch..." value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Box>
            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update Dog' : 'Add Dog'}
              </Button>
              <Button variant="outlined" onClick={() => setShowForm(false)}>Cancel</Button>
            </Stack>
          </Paper>
        )}

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography color="text.secondary" sx={{ mt: 1 }}>Loading your dogs...</Typography>
          </Box>
        ) : dogs.length === 0 ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <PetsIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No dogs yet. Add your first dog above!</Typography>
          </Stack>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Name', 'Breed', 'Size', 'Notes', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'text.secondary' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dogs.map((dog) => (
                  <TableRow key={dog.id} hover>
                    <TableCell><strong>{dog.name}</strong></TableCell>
                    <TableCell>{dog.breed || '—'}</TableCell>
                    <TableCell>
                      <Chip label={SIZE_LABELS[dog.size]} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dog.notes || '—'}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => openEdit(dog)}>Edit</Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => setDeleteConfirm(dog)}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete {deleteConfirm?.name}?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(deleteConfirm.id)}>
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

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
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">My Walk Requests</Typography>
          <IconButton onClick={fetchRequests} aria-label="Refresh">
            <RefreshIcon />
          </IconButton>
        </Stack>

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography color="text.secondary" sx={{ mt: 1 }}>Loading walk requests...</Typography>
          </Box>
        ) : requests.length === 0 ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <DirectionsWalkIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No walk requests assigned to you yet.</Typography>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {requests.map((req) => (
              <Paper key={req.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>Walk #{req.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {req.owner_address || 'No address provided'} · {req.duration_minutes ? `${req.duration_minutes} min` : '—'}
                    </Typography>
                  </Box>
                  <Chip
                    label={req.status.replace('_', ' ')}
                    size="small"
                    color={STATUS_COLORS[req.status] || 'default'}
                  />
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {req.status === 'SEARCHING' && (
                    <Button size="small" variant="contained" onClick={() => updateStatus(req.id, 'ACCEPTED')}>Accept</Button>
                  )}
                  {req.status === 'ACCEPTED' && (
                    <Button size="small" variant="contained" onClick={() => updateStatus(req.id, 'IN_PROGRESS')}>Start Walk</Button>
                  )}
                  {req.status === 'IN_PROGRESS' && (
                    <Button size="small" variant="contained" color="success" onClick={() => updateStatus(req.id, 'COMPLETED')}>Complete Walk</Button>
                  )}
                  {(req.status === 'SEARCHING' || req.status === 'ACCEPTED') && (
                    <Button size="small" variant="outlined" color="error" onClick={() => updateStatus(req.id, 'CANCELLED')}>Cancel</Button>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </>
  );
}
