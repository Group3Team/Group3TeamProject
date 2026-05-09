import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';

export default function ProfileWalker() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h2" sx={{ mb: 3 }}>Profile</Typography>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">Name</Typography>
              <Typography>—</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>Service Area</Typography>
              <Typography>—</Typography>
            </Box>
          </Stack>

          <Divider />
          <Box>
            <Typography variant="h5" sx={{ mb: 1 }}>Settings</Typography>
            <Typography variant="caption" color="text.secondary">Username</Typography>
            <Typography>—</Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
