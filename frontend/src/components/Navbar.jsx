import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/dogs', label: 'Dogs' },
  { to: '/walks', label: 'Walk Requests' },
  { to: '/login', label: 'Login' },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <AppBar position="static" color="primary" elevation={1}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{
            color: 'inherit',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mr: 'auto',
            fontWeight: 700,
          }}
        >
          <PetsIcon /> PawWalker
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {NAV_LINKS.map(({ to, label }) => {
            const active = pathname === to;
            return (
              <Button
                key={to}
                component={RouterLink}
                to={to}
                size="small"
                sx={{
                  color: active ? 'primary.contrastText' : 'rgba(255,255,255,0.85)',
                  bgcolor: active ? 'primary.dark' : 'transparent',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                {label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
