import { Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import OwnerView from './OwnerView';
import WalkerView from './WalkerView';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import RolePage from './pages/RolePage';
import DashboardPage from './pages/DashboardPage';
import ProfileOwner from './pages/ProfileOwner';
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Button,
  IconButton,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useColorMode } from './ColorMode';
import './index.css';

function ColorModeToggle() {
  const { mode, toggle } = useColorMode();
  const isDark = mode === 'dark';
  return (
    <Tooltip title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton onClick={toggle} color="inherit" aria-label="Toggle color mode">
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar>
        <Typography
          component={RouterLink}
          to="/"
          variant="h4"
          sx={{ textDecoration: 'none', mr: 'auto', display: 'flex', gap: 0.5 }}
        >
          <Box component="span" sx={{ color: 'secondary.main' }}>Dog</Box>
          <Box component="span" sx={{ color: 'primary.main' }}>GO</Box>
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {isLoggedIn ? (
            <>
              <Button component={RouterLink} to="/dashboard" variant="text" color="inherit">Dashboard</Button>
              {user?.role === 'OWNER' ? (
                <Button component={RouterLink} to="/owner" variant="text" color="inherit">Request Walk</Button>
              ) : (
                <Button component={RouterLink} to="/walker" variant="text" color="inherit">Find Jobs</Button>
              )}
              <ColorModeToggle />
              <Button variant="contained" onClick={handleLogout}>Log Out</Button>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/login" variant="text" color="inherit">Log In</Button>
              <ColorModeToggle />
              <Button component={RouterLink} to="/signup" variant="contained">Sign Up</Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

function Landing() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 4, md: 6 }}
        alignItems="center"
      >
        <Box sx={{ flex: 1, alignSelf: 'center' }}>
          <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '2.25rem', md: '3rem' } }}>
            Premium Dog Walking on Demand.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.15rem' }}>
            Connect with trusted, local dog walkers instantly. Give your furry best friend the walk they deserve while you focus on your day.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button component={RouterLink} to="/signup" variant="contained" size="large">Get Started</Button>
            <Button component={RouterLink} to="/login" variant="outlined" size="large">Log In</Button>
          </Stack>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignSelf: 'center' }}>
          <Box
            component="img"
            src="/dog.jpg"
            alt=""
            sx={{ maxWidth: '75%', height: 'auto', borderRadius: 3 }}
          />
        </Box>
      </Stack>
    </Container>
  );
}

function AppContent() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/role" element={<PrivateRoute><RolePage /></PrivateRoute>} />
        <Route path="/owner" element={<PrivateRoute><OwnerView /></PrivateRoute>} />
        <Route path="/walker" element={<PrivateRoute><WalkerView /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfileOwner /></PrivateRoute>} />
      </Routes>
    </Box>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
