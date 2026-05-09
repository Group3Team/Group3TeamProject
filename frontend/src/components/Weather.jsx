import { useEffect, useState } from "react";
import api from "../services/api";
import {
  Paper,
  Box,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Tooltip,
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
      <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2">Loading weather...</Typography>
      </Paper>
    );
  }

  if (error) {
    return <Alert severity="warning" sx={{ py: 0.5 }}>{error}</Alert>;
  }

  const dayLabel = data.forecast?.length
    ? new Date(data.forecast[0].startTime).toLocaleDateString([], { weekday: 'long' })
    : new Date().toLocaleDateString([], { weekday: 'long' });

  return (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="body2" sx={{ fontStyle: 'italic', lineHeight: 1.4, color: 'text.secondary', mb: 1.5 }}>
        {data.note} — DogGoAI
      </Typography>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        <WbSunnyIcon color="warning" />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{dayLabel}</Typography>
      </Stack>

      {data.forecast && data.forecast.length > 0 && (
        <Stack spacing={0.75}>
          {data.forecast.map((period, i) => {
            const time = new Date(period.startTime);
            const hour = time
              .toLocaleTimeString([], { hour: 'numeric' })
              .replace(' ', '')
              .toLowerCase();
            return (
              <Tooltip key={i} title={period.shortForecast} placement="left">
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'center', gap: 1 }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 36 }}>
                    {hour}
                  </Typography>
                  <Box
                    component="img"
                    src={period.icon}
                    alt={period.shortForecast}
                    sx={{ borderRadius: 0.5, width: 28, height: 28 }}
                  />
                  <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', minWidth: 36, textAlign: 'right' }}>
                    {period.temperature}°
                  </Typography>
                </Stack>
              </Tooltip>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
