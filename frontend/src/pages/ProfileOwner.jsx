import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';

export default function ProfileOwner() {
  const { user } = useAuth();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h2" sx={{ mb: 3 }}>Profile</Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5">{user?.username}</Typography>
              <Typography color="text.secondary">{user?.email}</Typography>
            </Box>
          </Stack>

          {user?.role === 'OWNER' && (
            <>
              <Divider />
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 48, height: 48 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Dog name</Typography>
                  <Typography>—</Typography>
                </Box>
              </Stack>
            </>
          )}

          <Divider />
          <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>Settings</Typography>
            <Typography variant="caption" color="text.secondary">Username</Typography>
            <Typography>{user?.username}</Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
