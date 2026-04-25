import { useEffect, useState } from "react";
import api from "../services/api";

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
      <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <p style={{ margin: 0 }}>Loading weather...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <p style={{ margin: 0, color: "#d63031" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: "1rem", marginBottom: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="28px"
          viewBox="0 -960 960 960"
          width="28px"
          fill="#fff"
        >
          <path d="m734-556-56-58 86-84 56 56-86 86ZM80-160v-80h800v80H80Zm360-520v-120h80v120h-80ZM226-558l-84-86 56-56 86 86-58 56Zm71 158h366q-23-54-72-87t-111-33q-62 0-111 33t-72 87Zm-97 80q0-117 81.5-198.5T480-600q117 0 198.5 81.5T760-320H200Zm280-80Z" />
        </svg>
        <h3 style={{ margin: 0 }}>Weather</h3>
      </div>

      <p style={{ margin: "0 0 1rem 0", fontStyle: "italic", lineHeight: 1.4 }}>
        {data.note} - PawWalkerAI
      </p>

      {data.forecast && data.forecast.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 0.6rem 0", fontSize: "0.9rem", color: "var(--background-light)" }}>
            Next 12 Hours
          </h4>
          <div style={{ display: "flex", gap: "0rem", overflowX: "auto", paddingBottom: "0rem" }}>
            {data.forecast.map((period, i) => {
              const time = new Date(period.startTime);
              const hour = time.toLocaleTimeString([], { hour: "numeric" });
              return (
                <div
                  key={i}
                  style={{
                    minWidth: "60px",
                    textAlign: "center",
                    padding: "0.5rem",
                    background: "rgba(255,255,255,0.05)",                    
                    fontSize: "0.8rem",
                  }}
                >
                  <div style={{ color: "var(--background-light)" }}>{hour}</div>
                  <div style={{ fontSize: "1rem", fontWeight: 600, margin: "0.25rem 0" }}>
                    {period.temperature}°
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--background-light)" }}>
                    {period.shortForecast}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
