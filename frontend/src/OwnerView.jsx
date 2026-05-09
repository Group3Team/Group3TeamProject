import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from './services/api';
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Fix for default marker icon in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function OwnerView() {
  const [step, setStep] = useState('request');
  const [dogs, setDogs] = useState(1);
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [duration, setDuration] = useState(30);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [activeRequestData, setActiveRequestData] = useState(null);
  const position = [51.505, -0.09];
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (activeRequestId && step !== 'request' && step !== 'completed') {
      const checkStatus = async () => {
        try {
          const response = await api.get(`/walk-requests/${activeRequestId}/`);
          const data = response.data;
          setActiveRequestData(data);

          if (data.status === 'ACCEPTED') setStep('arriving');
          if (data.status === 'IN_PROGRESS') setStep('in_progress');
          if (data.status === 'COMPLETED') setStep('completed');
        } catch (error) {
          console.error('Error checking walk status:', error);
        }
      };

      checkStatus();
      interval = setInterval(checkStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [activeRequestId, step]);

  const requestWalk = async () => {
    try {
      setStep('searching');

      const payload = {
        owner: 1,
        dogs: [],
        status: 'SEARCHING',
        pickup_location: 'POINT(-0.09 51.505)',
        owner_phone: ownerPhone,
        owner_address: ownerAddress,
        duration_minutes: parseInt(duration),
        dogs: [],
      };


      const response = await api.post('/walk-requests/', payload);
      const data = response.data;

      setActiveRequestId(data.id);
    } catch (error) {
      console.error('Error requesting walk:', error);
      alert('Failed to request walk. Please ensure backend is running.');
      setStep('request');
    }
  };

  const cancelRequest = async () => {
    if (!activeRequestId) return;
    try {

      await api.delete(`/walk-requests/${activeRequestId}/`);
      setStep('request');
      setActiveRequestId(null);
    } catch (error) {
      console.error('Error canceling walk:', error);
      alert('Failed to cancel request.');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems="stretch"
      >
        <Paper sx={{ p: 3, flex: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mb: 2 }}
          >
            Back to Menu
          </Button>
          <Typography variant="h3" sx={{ mb: 2 }}>Request a Dog Walker</Typography>

          {step === 'request' && (
            <Stack spacing={2}>
              <TextField
                label="Owner Phone Number"
                placeholder="e.g., 555-0123"
                fullWidth
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
              />
              <TextField
                label="Pickup Address"
                placeholder="123 Bark St, Woof City"
                fullWidth
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
              />
              <TextField
                label="Walk Duration (minutes)"
                type="number"
                fullWidth
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                slotProps={{ htmlInput: { min: 15, step: 15 } }}
              />
              <TextField
                label="Number of Dogs"
                type="number"
                fullWidth
                value={dogs}
                onChange={(e) => setDogs(e.target.value)}
                slotProps={{ htmlInput: { min: 1, max: 5 } }}
              />
              <Button variant="contained" size="large" fullWidth onClick={requestWalk}>
                Find Walker Now
              </Button>
            </Stack>
          )}

          {step === 'searching' && (
            <Stack spacing={3} alignItems="center" sx={{ py: 4, textAlign: 'center' }}>
              <Chip label="Searching..." color="warning" />
              <Typography variant="h5">Finding the best walker nearby...</Typography>
              <Box sx={{ width: '100%' }}>
                <LinearProgress />
              </Box>
              <Button variant="outlined" color="error" onClick={cancelRequest}>
                Cancel Request
              </Button>
            </Stack>
          )}

          {step === 'arriving' && (
            <Stack spacing={2}>
              <Chip label="Walker Arriving" color="primary" />

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src="/walker.png" sx={{ width: 56, height: 56 }} />
                  <Box>
                    <Typography variant="h5" sx={{ mb: 0.25 }}>
                      {activeRequestData?.walker_username || 'Your walker'} is on the way!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ★ 4.9 (120 walks) • Estimated arrival: 4 mins
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Chat with {activeRequestData?.walker_username || 'your walker'}
                </Typography>
                <Box
                  sx={{
                    minHeight: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    mb: 1,
                    pb: 1,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      p: 1,
                      borderRadius: 2,
                      alignSelf: 'flex-start',
                    }}
                  >
                    Hi, I'm 2 blocks away!
                  </Box>
                </Box>
                <Stack direction="row" spacing={1}>
                  <TextField placeholder="Type a message..." size="small" fullWidth />
                  <Button variant="contained">Send</Button>
                </Stack>
              </Paper>

              <Button variant="contained" color="success" fullWidth onClick={() => setStep('in_progress')}>
                Simulate: Handover Dogs
              </Button>
            </Stack>
          )}

          {step === 'in_progress' && (
            <Stack spacing={2}>
              <Chip label="Walk in Progress" color="success" />
              <Typography variant="h5">Your dogs are having a great time!</Typography>
              <Divider />
              <Button variant="contained" color="secondary" fullWidth>
                Request Photo Update
              </Button>
              <Button variant="contained" fullWidth onClick={() => setStep('completed')}>
                Simulate: Complete Walk
              </Button>
            </Stack>
          )}

          {step === 'completed' && (
            <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', py: 2 }}>
              <Chip label="Completed" color="success" />
              <Typography variant="h4">Walk Finished!</Typography>
              <Typography>Payment of $25.00 has been released.</Typography>
              <Button variant="contained" onClick={() => setStep('request')}>New Walk</Button>
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 1, flex: 1, minHeight: 400 }}>
          <Box sx={{ height: '100%', minHeight: 400, borderRadius: 2, overflow: 'hidden' }}>
            <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%', minHeight: 400 }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position}>
                <Popup>Your Location</Popup>
              </Marker>
              {(step === 'arriving' || step === 'in_progress') && (
                <Marker position={[51.509, -0.08]}>
                  <Popup>Walker</Popup>
                </Marker>
              )}
            </MapContainer>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}
