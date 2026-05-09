import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { locate } from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import Weather from "./components/Weather";
import api from './services/api';
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

export default function WalkerView() {
  const [isOnline, setIsOnline] = useState(false);
  const [request, setRequest] = useState(null);
  const [activeRequestData, setActiveRequestData] = useState(null);
  const [, setWalkerLocation] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);

  const navigate = useNavigate();

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isOnline && !request) {
      const fetchRequests = async () => {
        try {
          const response = await api.get('/walk-requests/');
          const data = response.data;
          const pending = data.filter(r => r.status === 'SEARCHING').sort((a, b) => b.id - a.id)[0];

          if (pending) {
            setActiveRequestData(pending);
            setRequest('pending');
          }
        } catch (error) {
          console.error('Error fetching requests:', error);
        }
      };

      fetchRequests();
      interval = setInterval(fetchRequests, 5000);
    }
    return () => clearInterval(interval);
  }, [isOnline, request]);

  const updateRequestStatus = async (newStatus) => {
    if (!activeRequestData) return;
    try {
      const response = await api.patch(`/walk-requests/${activeRequestData.id}/`, { status: newStatus });
      const updatedData = response.data;
      setActiveRequestData(updatedData);

      if (newStatus === 'ACCEPTED') setRequest('accepted');
      if (newStatus === 'IN_PROGRESS') setRequest('in_progress');
      if (newStatus === 'COMPLETED') {
        setRequest(null);
        setActiveRequestData(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update walk status.');
    }
  };

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(
      [40.45952882340246, -98.73938654648938],
      4,
    );

    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    locate({
      position: "topleft",
      setView: true,
      keepCurrentZoomLevel: true,
      showCompass: false,
      onLocationError: function (err) {
        alert(err.message);
      },
      timeout: 1000,
      maximumAge: 1000,
    }).addTo(map);

    map.on("locationtimeout", function (e) {
      console.log("Location timeout count:", e.count);
    });

    map.on("locationfound", function (e) {
      setWalkerLocation(e.latlng);
      console.log("Location found:", e.latlng);
      console.log("Accuracy:", e.accuracy, "meters");
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  async function getRoute(start, end) {
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?alternatives=false&geometries=geojson&language=en&overview=simplified&steps=true&access_token=${import.meta.env.VITE_MAPBOX_KEY}`,
      );
      const data = await query.json();
      const [startLng, startLat] = data.waypoints[0].location;
      const [endLng, endLat] = data.waypoints[1].location;

      L.marker([startLat, startLng]).addTo(map).bindPopup("Start");
      L.marker([endLat, endLng]).addTo(map).bindPopup("End");

      const steps = data.routes[0].legs[0].steps;

      setRouteInfo({
        miles: (data.routes[0].distance / 1609).toFixed(1),
        minutes: Math.round(data.routes[0].duration / 60),
        steps: steps,
      });

      const coords = steps.flatMap((step) =>
        step.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      );

      const routeLine = L.polyline(coords, {
        color: "blue",
        weight: 5,
        opacity: 0.75,
      }).addTo(map);

      map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
    } catch (err) {
      console.error("Mapbox Route fetch failed:", err);
    }
  }

  const toggleOnline = () => {
    if (!isOnline) {
      setIsOnline(true);
    } else {
      setIsOnline(false);
      setRequest(null);
      setActiveRequestData(null);
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
            onClick={() => navigate("/dashboard")}
            sx={{ mb: 2 }}
          >
            Back to Menu
          </Button>

          <Weather />

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h3">Walker Dashboard</Typography>
            <Chip sx={{ ml: 1.5,}}
              label={isOnline ? 'Online' : 'Offline'}
              color={isOnline ? 'success' : 'default'}
            />
          </Stack>

          {!request && (
            <Stack spacing={2} alignItems="center" sx={{ py: 2, textAlign: 'center' }}>
              <Button
                variant="contained"
                color={isOnline ? 'error' : 'success'}
                size="large"
                fullWidth
                onClick={toggleOnline}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {isOnline ? 'Go Offline' : 'Go Online to Receive Requests'}
              </Button>
              {isOnline && (
                <Typography color="text.secondary">
                  Looking for nearby dogs...
                </Typography>
              )}
            </Stack>
          )}

          {request === 'pending' && activeRequestData && (
            <Paper variant="outlined" sx={{ p: 2, borderColor: 'primary.main', bgcolor: 'rgba(53, 113, 121, 0.06)' }}>
              <Typography variant="h5" sx={{ mb: 1.5 }}>New Walk Request!</Typography>
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography><strong>Pickup Address:</strong> {activeRequestData.owner_address || 'Not provided'}</Typography>
                <Typography><strong>Phone:</strong> {activeRequestData.owner_phone || 'Not provided'}</Typography>
                <Typography><strong>Duration:</strong> {activeRequestData.duration_minutes || '30'} mins</Typography>
                <Typography><strong>Status:</strong> {activeRequestData.status}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={() => {
                    updateRequestStatus('ACCEPTED');
                    getRoute('-111.739,40.3805', '-111.7534,40.3661');
                  }}
                >
                  Accept
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  onClick={() => {
                    setRequest(null);
                    setActiveRequestData(null);
                  }}
                >
                  Decline
                </Button>
              </Stack>
            </Paper>
          )}

          {request === 'accepted' && (
            <Stack spacing={2}>
              <Typography variant="h5">Head to Pickup</Typography>
              <Typography color="text.secondary">
                The owner has been notified you are arriving.
              </Typography>
              <Button variant="contained" fullWidth onClick={() => updateRequestStatus('IN_PROGRESS')}>
                Start Walk
              </Button>
            </Stack>
          )}

          {request === 'in_progress' && (
            <Stack spacing={2}>
              <Chip label="Walk in Progress" color="success" />
              <Button variant="contained" color="secondary" fullWidth>
                Upload Photo Update
              </Button>
              <Button variant="contained" fullWidth onClick={() => updateRequestStatus('COMPLETED')}>
                Complete Walk
              </Button>
            </Stack>
          )}
        </Paper>

        <Paper sx={{ p: 1, flex: 1, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
          {routeInfo && (
            <Box sx={{ p: 2 }}>
              <Stack direction="row" spacing={3} sx={{ mb: 1 }}>
                <Typography><strong>Distance:</strong> {routeInfo.miles} mi</Typography>
                <Typography><strong>Time:</strong> {routeInfo.minutes} min</Typography>
              </Stack>
              <Divider />
              <List dense sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {routeInfo.steps.map((step, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          {step.maneuver.modifier === 'left' && <ArrowBackRoundedIcon fontSize="small" />}
                          {step.maneuver.modifier === 'right' && <ArrowForwardRoundedIcon fontSize="small" />}
                          <span>{step.maneuver.instruction}</span>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Divider />
            </Box>
          )}
          <Box
            ref={mapRef}
            sx={{
              flex: 1,
              minHeight: 400,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          />
        </Paper>
      </Stack>
    </Container>
  );
}
