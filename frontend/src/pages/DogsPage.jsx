import { useEffect, useState } from 'react';
import { getDogs } from '../services/api';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Alert,
} from '@mui/material';

export default function DogsPage() {
  const [dogs, setDogs] = useState([]);

  useEffect(() => {
    getDogs().then(r => setDogs(r.data)).catch(() => {});
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" sx={{ fontSize: '2.25rem' }}>My Dogs 🐕</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        All dogs registered to your account.
      </Typography>

      {dogs.length === 0 ? (
        <Alert severity="info" sx={{ fontWeight: 600 }}>
          No dogs found. Add your first dog!
        </Alert>
      ) : (
        <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
          {dogs.map(d => (
            <Card key={d.id} sx={{ minWidth: 180, flex: 1 }}>
              <CardContent>
                <Typography variant="h5">{d.name}</Typography>
                <Typography color="text.secondary">{d.breed} — {d.size}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
