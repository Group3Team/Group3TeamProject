import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Paper,
  Box,
  Stack,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";

export default function Weather() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await api.get("/weather-note/");
        setData(response.data);
      } catch (err) {
        console.error("Weather note fetch failed:", err);
        setError("Weather unavailable");
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  if (loading) {
    return (
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CircularProgress size={20} />
        <Typography>Loading weather...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>
    );
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <WbSunnyIcon color="warning" />
        <Typography variant="h5">Weather</Typography>
      </Stack>

      <Typography sx={{ fontStyle: 'italic', mb: 2, lineHeight: 1.5 }}>
        {data.note} - DogGoAI
      </Typography>

      {data.forecast && data.forecast.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Next 12 Hours
          </Typography>
          <Stack direction="row" sx={{ overflowX: 'auto', pb: 0.5 }}>
            {data.forecast.map((period, i) => {
              const time = new Date(period.startTime);
              const hour = time.toLocaleTimeString([], { hour: "numeric" });
              return (
                <Box
                  key={i}
                  sx={{
                    minWidth: 64,
                    textAlign: 'center',
                    p: 1,
                    fontSize: '0.8rem',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">{hour}</Typography>
                  <Typography sx={{ fontWeight: 600, my: 0.5 }}>
                    {period.temperature}°
                  </Typography>
                  <Box
                    component="img"
                    src={period.icon}
                    alt={period.shortForecast}
                    sx={{ borderRadius: 1, width: 35, height: 35 }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
