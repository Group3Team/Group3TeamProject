import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Stack,
  MenuItem,
} from '@mui/material';

export default function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', role: 'OWNER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 420, p: 4 }}>
        <Typography variant="h3" align="center" sx={{ mb: 3 }}>
          Create Account
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              placeholder="your_username"
              required
              fullWidth
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              fullWidth
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              select
              label="Role"
              fullWidth
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <MenuItem value="OWNER">Owner</MenuItem>
              <MenuItem value="WALKER">Walker</MenuItem>
            </TextField>
            <TextField
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              fullWidth
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <TextField
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
              fullWidth
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </Stack>
        </Box>

        <Typography align="center" sx={{ mt: 3 }} color="text.secondary">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>Log In</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
