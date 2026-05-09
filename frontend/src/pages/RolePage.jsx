import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardActionArea, CardContent, Stack } from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

const ROLES = [
  {
    to: '/owner',
    title: "I'm an Owner",
    blurb: 'Request a trusted walker for your dog',
    Icon: PetsIcon,
  },
  {
    to: '/walker',
    title: "I'm a Walker",
    blurb: 'Accept walk requests and start earning',
    Icon: DirectionsWalkIcon,
  },
];

export default function RolePage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        p: 2,
      }}
    >
      <Typography variant="h2" sx={{ mb: 0.5 }}>Who are you?</Typography>
      <Typography color="text.secondary" sx={{ mb: 5, fontSize: '1.1rem' }}>
        Choose your role to get started
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} useFlexGap flexWrap="wrap" justifyContent="center">
        {ROLES.map(({ to, title, blurb, Icon }) => (
          <Card key={to} sx={{ width: 240 }}>
            <CardActionArea onClick={() => navigate(to)} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Icon sx={{ fontSize: 64, mb: 2, color: 'primary.main' }} />
                <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 0.5 }}>{title}</Typography>
                <Typography variant="body2" color="text.secondary">{blurb}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
