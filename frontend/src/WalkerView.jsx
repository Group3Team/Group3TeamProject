import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.js";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import Weather from "./components/Weather";


export default function WalkerView() {
  const [isOnline, setIsOnline] = useState(false);
  const [request, setRequest] = useState(null);
  const [, setWalkerLocation] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);

  const navigate = useNavigate();

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
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

    L.control
      .locate({
        position: "topleft",
        setView: true,
        keepCurrentZoomLevel: true,
        showCompass: false,
        onLocationError: function (err) {
          alert(err.message);
        },
        timeout: 1000,
        maximumAge: 1000,
      })
      .addTo(map);
   
      map.on("locationtimeout", function (e) {
        console.log("Location timeout count:", e.count);
        // Provide custom feedback or retry logic
      });

      map.on("locationfound", function (e) {
        setWalkerLocation(e.latlng)
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
      L.marker([endLat, endLng], ).addTo(map).bindPopup("End");

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
      // Simulate incoming request after 3 seconds
      setTimeout(() => {
        setRequest("pending");
      }, 3000);
    } else {
      setIsOnline(false);
      setRequest(null);
    }
  };

  return (
    <div className="grid-2 animate-fade-in">
      <div className="glass-panel">
        <button
          className="btn btn-outline"
          onClick={() => navigate("/role")}
          style={{
            marginBottom: "1.5rem",
            padding: "0.4rem 1rem",
            fontSize: "0.9rem",
          }}
        >
          ← Back to Menu
        </button>

        <Weather />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2>Walker Dashboard</h2>
          <div
            className="status-badge"
            style={{
              background: isOnline
                ? "var(--success-color)"
                : "var(--background-dark)",
              margin: 0,
            }}
          >
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>

        {!request && (
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <button
              className="btn"
              style={{
                background: isOnline ? "#d63031" : "var(--success-color)",
                width: "100%",
                padding: "1rem",
                fontSize: "1.2rem",
              }}
              onClick={toggleOnline}
            >
              {isOnline ? "Go Offline" : "Go Online to Receive Requests"}
            </button>
            {isOnline && (
              <p
                style={{ marginTop: "1rem", color: "var(--background-light)" }}
              >
                Looking for nearby dogs...
              </p>
            )}
          </div>
        )}

        {request === "pending" && (
          <div
            className="glass-panel"
            style={{
              background: "rgba(108, 92, 231, 0.2)",
              border: "1px solid var(--primary-color)",
            }}
          >
            <h3>New Walk Request!</h3>
            <p>
              <strong>Distance:</strong> 1.2 miles away
            </p>
            <p>
              <strong>Dogs:</strong> 2 (Medium, Large)
            </p>
            <p>
              <strong>Earnings:</strong> $25.00
            </p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button
                className="btn"
                style={{ flex: 1, background: "var(--success-color)" }}
                onClick={() => {
                  setRequest("accepted");
                  getRoute("-111.739,40.3805", "-111.7534,40.3661");
                }}
              >
                Accept
              </button>
              <button
                className="btn"
                style={{ flex: 1, background: "#d63031" }}
                onClick={() => setRequest(null)}
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {request === "accepted" && (
          <div>
            <h3>Head to Pickup</h3>
            <p style={{ marginBottom: "1.5rem" }}>
              The owner has been notified you are arriving.
            </p>
            <button
              className="btn"
              style={{ width: "100%", marginBottom: "1rem" }}
              onClick={() => setRequest("in_progress")}
            >
              Start Walk
            </button>
          </div>
        )}

        {request === "in_progress" && (
          <div>
            <div
              className="status-badge"
              style={{ background: "var(--success-color)" }}
            >
              Walk in Progress
            </div>
            <div style={{ margin: "2rem 0" }}>
              <button
                className="btn"
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  background: "var(--secondary-color)",
                }}
              >
                Upload Photo Update
              </button>
              <button
                className="btn"
                style={{ width: "100%" }}
                onClick={() => setRequest(null)}
              >
                Complete Walk
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: "1rem" }}>
        <div style={{ margin: "1rem" }}>
          {routeInfo && (
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ borderBottom: "solid gray", borderBottomWidth: ".5px", padding: "0.5rem 0" }}>
                <p style={{ margin: 0 }}>
                  <strong>Distance:</strong> {routeInfo.miles} mi
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Time:</strong> {routeInfo.minutes} min
                </p>
              </li>
              {routeInfo.steps.map((step, index) => (
                <li
                  key={index}
                  style={{ borderBottom: "solid gray", borderBottomWidth: ".5px", padding: "0.5rem 0" }}
                >
                  <p style={{ margin: 0 }}>
                    {(step.maneuver.modifier)==='left'?
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M600-160v-360H272l64 64-56 56-160-160 160-160 56 56-64 64h328q33 0 56.5 23.5T680-520v360h-80Z"/></svg>
                    : <></>} 
                     {(step.maneuver.modifier)==='right'? 
                     <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="M280-160v-360q0-33 23.5-56.5T360-600h328l-64-64 56-56 160 160-160 160-56-56 64-64H360v360h-80Z"/></svg>
                    : <></>} {step.maneuver.instruction}
                  </p>                
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="map-container">
          <div ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
        </div>
      </div>
    </div>
  );
}


   {/* <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>You</Popup>
            </Marker>
            {(request === 'pending' || request === 'accepted') && (
              <Marker position={[51.505, -0.09]}>
                <Popup>Pickup Location</Popup>
              </Marker>
            )}
          </MapContainer> */}