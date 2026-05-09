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
} from '@mui/material';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 420, p: 4 }}>
        <Typography variant="h3" align="center" sx={{ mb: 3 }}>
          Welcome Back
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
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              fullWidth
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </Stack>
        </Box>

        <Typography align="center" sx={{ mt: 3 }} color="text.secondary">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/signup" sx={{ fontWeight: 600 }}>Sign Up</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
