import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLocationData, fetchPlannedRoute, saveRouteHistory, loadRouteHistory } from './api';

// ─── Icons ────────────────────────────────────────────────────────────────────

const busIconSvg = (heading = 0) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="#4f7ef8" stroke="white" stroke-width="2.5" opacity="0.95"/>
    <g transform="rotate(${heading}, 20, 20)">
      <path d="M20 9 L26 28 L20 24 L14 28 Z" fill="white"/>
    </g>
  </svg>
`;

const startIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="12" fill="#22c55e" stroke="white" stroke-width="2.5"/>
    <circle cx="14" cy="14" r="5" fill="white"/>
  </svg>
`;

const destIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 2C8.477 2 4 6.477 4 12c0 7.5 10 22 10 22s10-14.5 10-22C24 6.477 19.523 2 14 2z" fill="#ef4444" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="12" r="4.5" fill="white"/>
  </svg>
`;

const makeIcon = (svg, anchor) =>
  L.divIcon({
    html: svg,
    className: '',
    iconSize: anchor === 'bus' ? [40, 40] : anchor === 'dest' ? [28, 36] : [28, 28],
    iconAnchor: anchor === 'bus' ? [20, 20] : anchor === 'dest' ? [14, 36] : [14, 14],
    popupAnchor: [0, anchor === 'dest' ? -36 : -16],
  });

// ─── Auto-fit map to show full route ─────────────────────────────────────────

function AutoFit({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [bounds, map]);
  return null;
}

// ─── ETA Badge overlay ────────────────────────────────────────────────────────

function ETAOverlay({ eta, distance, vehicleName }) {
  if (!eta) return null;
  return (
    <div style={{
      position: 'absolute',
      bottom: 28,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      background: 'rgba(255,255,255,0.96)',
      borderRadius: 16,
      padding: '12px 24px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      pointerEvents: 'none',
      fontFamily: "'DM Sans', sans-serif",
      minWidth: 280,
      border: '1px solid #e4e8f0',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 11, color: '#9ba3b8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {vehicleName}
        </span>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1f36', marginTop: 2 }}>
          ETA: <span style={{ color: '#4f7ef8' }}>{eta}</span>
        </span>
      </div>
      {distance && (
        <div style={{
          borderLeft: '1px solid #e4e8f0',
          paddingLeft: 20,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <span style={{ fontSize: 11, color: '#9ba3b8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Remaining</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1f36', marginTop: 2 }}>{distance}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

// Demo data — simulates a live shuttle moving from start to destination
// Remove this and use real fetchLocationData() when your API is ready
const DEMO_ROUTE = [
  [6.8100, 80.0300], [6.8120, 80.0320], [6.8140, 80.0345], [6.8165, 80.0365],
  [6.8185, 80.0385], [6.8211, 80.0409], [6.8235, 80.0428], [6.8255, 80.0450],
  [6.8275, 80.0470], [6.8300, 80.0495], [6.8325, 80.0515], [6.8350, 80.0550],
];

let demoStep = 0;

const getDemoLocation = () => {
  const pos = DEMO_ROUTE[demoStep % DEMO_ROUTE.length];
  const next = DEMO_ROUTE[(demoStep + 1) % DEMO_ROUTE.length];
  const heading = Math.atan2(next[1] - pos[1], next[0] - pos[0]) * (180 / Math.PI);
  demoStep++;
  return [{
    id: 'shuttle-1',
    lat: pos[0],
    lng: pos[1],
    name: 'UniRide Shuttle A',
    status: demoStep >= DEMO_ROUTE.length - 1 ? 'Arrived' : 'En Route',
    startLat: DEMO_ROUTE[0][0],
    startLng: DEMO_ROUTE[0][1],
    destLat: DEMO_ROUTE[DEMO_ROUTE.length - 1][0],
    destLng: DEMO_ROUTE[DEMO_ROUTE.length - 1][1],
    heading: heading,
    speed: 28,
  }];
};

const MapComponent = () => {
  const [vehicles, setVehicles] = useState([]);
  // routeHistories: { [id]: [[lat, lng], ...] }
  const [routeHistories, setRouteHistories] = useState({});
  // plannedRoutes: { [id]: { coords, durationSeconds, distanceMeters } }
  const [plannedRoutes, setPlannedRoutes] = useState({});
  const [mapBounds, setMapBounds] = useState(null);
  const [etaInfo, setEtaInfo] = useState(null);
  const plannedFetched = useRef({});

  // Compute ETA based on remaining planned route
  const computeETA = useCallback((vehicle, planned) => {
    if (!planned) return null;
    const { coords, distanceMeters, durationSeconds } = planned;
    if (!coords || coords.length === 0) return null;

    // Find closest point on planned route to current position
    let minDist = Infinity;
    let closestIdx = 0;
    coords.forEach(([lat, lng], i) => {
      const d = Math.hypot(lat - vehicle.lat, lng - vehicle.lng);
      if (d < minDist) { minDist = d; closestIdx = i; }
    });

    const progress = closestIdx / (coords.length - 1);
    const remainingFraction = 1 - progress;
    const remainingSeconds = Math.round(durationSeconds * remainingFraction);
    const remainingMeters = Math.round(distanceMeters * remainingFraction);

    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const etaStr = mins > 0 ? `${mins} min${mins !== 1 ? 's' : ''}` : `${secs}s`;
    const distStr = remainingMeters >= 1000
      ? `${(remainingMeters / 1000).toFixed(1)} km`
      : `${remainingMeters} m`;

    return { eta: etaStr, distance: distStr, vehicleName: vehicle.name };
  }, []);

  const updateVehicles = useCallback(async () => {
    let data;
    try {
      // Try real API first; fall back to demo
      data = await fetchLocationData();
      if (!Array.isArray(data) || data.length === 0) throw new Error('empty');
    } catch (_) {
      data = getDemoLocation();
    }

    setVehicles(data);

    // Update route histories (breadcrumb trail)
    setRouteHistories(prev => {
      const updated = { ...prev };
      data.forEach(v => {
        const existing = updated[v.id] || loadRouteHistory(v.id);
        const last = existing[existing.length - 1];
        const isDuplicate = last && last[0] === v.lat && last[1] === v.lng;
        if (!isDuplicate) {
          const newHistory = [...existing, [v.lat, v.lng]];
          updated[v.id] = newHistory;
          saveRouteHistory(v.id, newHistory);
        }
      });
      return updated;
    });

    // Fetch planned route once per vehicle (when start+dest coords are available)
    data.forEach(async v => {
      const hasRoute = v.startLat && v.startLng && v.destLat && v.destLng;
      if (hasRoute && !plannedFetched.current[v.id]) {
        plannedFetched.current[v.id] = true;
        const route = await fetchPlannedRoute(v.startLat, v.startLng, v.destLat, v.destLng);
        if (route) {
          setPlannedRoutes(prev => ({ ...prev, [v.id]: route }));
          // Fit map to the planned route bounds
          setMapBounds(route.coords);
        }
      }

      // Compute ETA
      setPlannedRoutes(prev => {
        const planned = prev[v.id];
        const eta = computeETA(v, planned);
        setEtaInfo(eta);
        return prev;
      });
    });
  }, [computeETA]);

  useEffect(() => {
    updateVehicles();
    const interval = setInterval(updateVehicles, 5000);
    return () => clearInterval(interval);
  }, [updateVehicles]);

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 64px)', width: '100vw', marginTop: 64 }}>
      <MapContainer
        center={[6.8211, 80.0409]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {mapBounds && <AutoFit bounds={mapBounds} />}

        {vehicles.map(v => {
          const history = routeHistories[v.id] || [];
          const planned = plannedRoutes[v.id];

          return (
            <React.Fragment key={v.id}>
              {/* ── Planned route (grey dashed) */}
              {planned && planned.coords.length > 1 && (
                <Polyline
                  positions={planned.coords}
                  pathOptions={{
                    color: '#c0cefb',
                    weight: 4,
                    dashArray: '8 6',
                    opacity: 0.8,
                  }}
                />
              )}

              {/* ── Travelled path (solid blue gradient-ish) */}
              {history.length > 1 && (
                <Polyline
                  positions={history}
                  pathOptions={{
                    color: '#4f7ef8',
                    weight: 5,
                    opacity: 0.9,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              )}

              {/* ── Start marker */}
              {v.startLat && (
                <Marker
                  position={[v.startLat, v.startLng]}
                  icon={makeIcon(startIconSvg, 'start')}
                >
                  <Popup>
                    <strong>Journey Start</strong><br />
                    <span style={{ color: '#22c55e' }}>●</span> Origin point
                  </Popup>
                </Marker>
              )}

              {/* ── Destination marker */}
              {v.destLat && (
                <Marker
                  position={[v.destLat, v.destLng]}
                  icon={makeIcon(destIconSvg, 'dest')}
                >
                  <Popup>
                    <strong>Final Destination</strong><br />
                    <span style={{ color: '#ef4444' }}>📍</span> Drop-off point
                  </Popup>
                </Marker>
              )}

              {/* ── Breadcrumb dots along travelled path */}
              {history.filter((_, i) => i % 3 === 0 && i > 0 && i < history.length - 1).map(([lat, lng], i) => (
                <CircleMarker
                  key={`dot-${i}`}
                  center={[lat, lng]}
                  radius={3}
                  pathOptions={{ color: '#4f7ef8', fillColor: '#fff', fillOpacity: 1, weight: 1.5 }}
                />
              ))}

              {/* ── Live vehicle marker */}
              <Marker
                position={[v.lat, v.lng]}
                icon={makeIcon(busIconSvg(v.heading || 0), 'bus')}
              >
                <Popup>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: 160 }}>
                    <strong style={{ fontSize: 14, color: '#1a1f36' }}>{v.name}</strong>
                    <br />
                    <span style={{
                      display: 'inline-block',
                      marginTop: 4,
                      padding: '2px 8px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: v.status === 'Arrived' ? '#dcfce7' : '#eff3ff',
                      color: v.status === 'Arrived' ? '#16a34a' : '#4f7ef8',
                    }}>
                      {v.status}
                    </span>
                    <br />
                    {v.speed && (
                      <span style={{ fontSize: 12, color: '#6b7280', marginTop: 4, display: 'block' }}>
                        Speed: {v.speed} km/h
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#9ba3b8', display: 'block', marginTop: 2 }}>
                      {v.lat.toFixed(5)}, {v.lng.toFixed(5)}
                    </span>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* ── ETA pill at bottom */}
      <ETAOverlay {...(etaInfo || {})} />
    </div>
  );
};

export default MapComponent;

