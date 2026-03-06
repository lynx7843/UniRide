import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Marker, Polyline, CircleMarker, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  fetchLocationData, fetchShuttleData, fetchDriverData,
  fetchPlannedRoute, saveRouteHistory, loadRouteHistory, NSBM_ORIGIN,
} from './api';
import { useSearch } from './SearchContext';
import RideCard from './RideCard';

// ─── Offline threshold: treat tracker as offline if last ping > 5 minutes ago ─
const OFFLINE_THRESHOLD_MS = 5 * 60 * 1000;

function isOffline(vehicle) {
  if (!vehicle?.timestamp) return true;
  return Date.now() - new Date(vehicle.timestamp).getTime() > OFFLINE_THRESHOLD_MS;
}

// ─── Map Icons ────────────────────────────────────────────────────────────────
// Online shuttle icon — blue circle, green status dot
const shuttleSvgOnline = `
  <div style="position:relative;width:46px;height:46px;cursor:pointer;">
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
      <circle cx="23" cy="23" r="21" fill="#4f7ef8" stroke="white" stroke-width="3" opacity="0.97"/>
      <g transform="rotate(90,23,23)">
        <path d="M23 11 L31 33 L23 28 L15 33 Z" fill="white"/>
      </g>
    </svg>
    <div style="
      position:absolute;bottom:0;right:0;
      width:13px;height:13px;border-radius:50%;
      background:#22c55e;
      border:2px solid white;
    "></div>
  </div>
`;

// Offline shuttle icon — grey circle, grey status dot, semi-transparent
const shuttleSvgOffline = `
  <div style="position:relative;width:46px;height:46px;cursor:pointer;opacity:0.72;">
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
      <circle cx="23" cy="23" r="21" fill="#94a3b8" stroke="white" stroke-width="3" opacity="0.97"/>
      <g transform="rotate(90,23,23)">
        <path d="M23 11 L31 33 L23 28 L15 33 Z" fill="white"/>
      </g>
    </svg>
    <div style="
      position:absolute;bottom:0;right:0;
      width:13px;height:13px;border-radius:50%;
      background:#94a3b8;
      border:2px solid white;
    "></div>
  </div>
`;

const nsbmSvg = `
  <div style="display:flex;flex-direction:column;align-items:center;">
    <div style="background:#4f7ef8;color:#fff;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:700;padding:4px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 8px rgba(79,126,248,0.4);">NSBM</div>
    <div style="width:2px;height:6px;background:#4f7ef8;margin:0 auto;"></div>
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
      <circle cx="11" cy="11" r="9" fill="#4f7ef8" stroke="white" stroke-width="2.5"/>
      <circle cx="11" cy="11" r="4" fill="white"/>
    </svg>
  </div>
`;

const destSvg = (label = 'Home') => `
  <div style="display:flex;flex-direction:column;align-items:center;">
    <div style="background:#ef4444;color:#fff;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:700;padding:4px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 8px rgba(239,68,68,0.4);max-width:140px;overflow:hidden;text-overflow:ellipsis;">${label.split(',')[0]}</div>
    <div style="width:2px;height:6px;background:#ef4444;margin:0 auto;"></div>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30">
      <path d="M12 1C6.477 1 2 5.477 2 11c0 7.5 10 19 10 19S22 18.5 22 11C22 5.477 17.523 1 12 1z" fill="#ef4444" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="11" r="4" fill="white"/>
    </svg>
  </div>
`;

const makeIcon = (html, size, anchor) =>
  L.divIcon({ html, className: '', iconSize: size, iconAnchor: anchor });

// ─── FlyTo Helper ─────────────────────────────────────────────────────────────
function FlyTo({ lat, lng, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.flyTo([lat, lng], zoom, { duration: 1.4 });
  }, [lat, lng, zoom, map]);
  return null;
}

// ─── FitBounds Helper ─────────────────────────────────────────────────────────
// fitKey increments on every new route so this re-fires even for the same coords
function FitBounds({ coords, fitKey }) {
  const map = useMap();
  useEffect(() => {
    if (coords?.length >= 2) {
      map.fitBounds(L.latLngBounds(coords), { padding: [70, 70], maxZoom: 15 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, map]);
  return null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const MapComponent = () => {
  const { destination } = useSearch();

  // AWS data
  const [vehicles, setVehicles]             = useState([]);
  const [shuttles, setShuttles]             = useState([]);
  const [drivers, setDrivers]               = useState([]);
  const [routeHistories, setRouteHistories] = useState({});

  // Route
  const [plannedRoute, setPlannedRoute]     = useState(null);
  const [fitCoords, setFitCoords]           = useState(null);
  const [fitKey, setFitKey]                 = useState(0);

  // UI
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [flyTo, setFlyTo]                       = useState(null);

  const lastDestRef = useRef(null);

  // ── 1. Fetch shuttle & driver metadata once ───────────────────────────────
  useEffect(() => {
    fetchShuttleData().then(setShuttles);
    fetchDriverData().then(setDrivers);
  }, []);

  // ── 2. Auto-route NSBM → destination whenever destination changes ─────────
  useEffect(() => {
    if (!destination) {
      setPlannedRoute(null);
      setFitCoords(null);
      lastDestRef.current = null;
      return;
    }

    const destKey = `${destination.lat},${destination.lng}`;
    if (destKey === lastDestRef.current) return;
    lastDestRef.current = destKey;

    fetchPlannedRoute(
      NSBM_ORIGIN.lat, NSBM_ORIGIN.lng,
      destination.lat, destination.lng,
    ).then(route => {
      // Fallback to straight line if AWS route unavailable
      const coords = route?.coords?.length > 1
        ? route.coords
        : [[NSBM_ORIGIN.lat, NSBM_ORIGIN.lng], [destination.lat, destination.lng]];

      setPlannedRoute({ coords });
      setFitCoords(coords);
      setFitKey(k => k + 1); // force FitBounds to re-fire for every new destination
    });
  }, [destination]);

  // ── 3. Poll GPS every 30 s ────────────────────────────────────────────────
  // fetchLocationData never throws — it returns [] on any failure.
  // We MERGE into existing vehicle state so that if the API returns an empty
  // array (tracker off / network blip), last known positions stay on the map.
  const pollGPS = useCallback(async () => {
    const data = await fetchLocationData(); // always an array, never throws

    if (data.length > 0) {
      // Fresh data received — merge by deviceId so we never lose a device
      setVehicles(prev => {
        const merged = { ...Object.fromEntries(prev.map(v => [v.deviceId, v])) };
        data.forEach(v => { merged[v.deviceId] = v; });
        return Object.values(merged);
      });

      // Update breadcrumb trails
      setRouteHistories(prev => {
        const next = { ...prev };
        data.forEach(v => {
          const existing = next[v.deviceId] || loadRouteHistory(v.deviceId);
          const last = existing[existing.length - 1];
          if (!last || last[0] !== v.lat || last[1] !== v.lng) {
            const updated = [...existing, [v.lat, v.lng]];
            next[v.deviceId] = updated;
            saveRouteHistory(v.deviceId, updated);
          }
        });
        return next;
      });
    }
    // If data is empty (tracker offline / API error), vehicles state is untouched
    // so the last known marker stays visible on the map
  }, []);

  useEffect(() => {
    pollGPS();
    const id = setInterval(pollGPS, 30000);
    return () => clearInterval(id);
  }, [pollGPS]);

  // ── Derive active card data ───────────────────────────────────────────────
  const activeTracker = vehicles.find(v => v.deviceId === selectedDeviceId);
  const activeShuttle = shuttles.find(s => s.deviceId === selectedDeviceId);
  const activeDriver  = drivers.find(d => d.driverId === activeShuttle?.driverId);

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 64px)', width: '100vw', marginTop: 64 }}>

      {/* ── RideCard overlay — bottom-left ── */}
      {selectedDeviceId && (
        <div style={{ position: 'absolute', bottom: 30, left: 30, zIndex: 1000 }}>
          <RideCard
            driver={activeDriver}
            shuttle={activeShuttle}
            vehicle={activeTracker}
            onClose={() => setSelectedDeviceId(null)}
          />
        </div>
      )}

      <MapContainer
        center={[NSBM_ORIGIN.lat, NSBM_ORIGIN.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {flyTo && <FlyTo lat={flyTo.lat} lng={flyTo.lng} zoom={13} />}
        {fitCoords && <FitBounds coords={fitCoords} fitKey={fitKey} />}

        {/* NSBM origin marker */}
        <Marker
          position={[NSBM_ORIGIN.lat, NSBM_ORIGIN.lng]}
          icon={makeIcon(nsbmSvg, [80, 52], [40, 52])}
        />

        {/* Destination marker */}
        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={makeIcon(destSvg(destination.displayName), [160, 52], [80, 52])}
          />
        )}

        {/* Planned route: NSBM → destination */}
        {plannedRoute?.coords?.length > 1 && (
          <Polyline
            positions={plannedRoute.coords}
            pathOptions={{ color: '#10b981', weight: 6, opacity: 0.85 }}
          />
        )}

        {/* ── Vehicles — always rendered using last known AWS position ── */}
        {vehicles.map(v => {
          const offline = isOffline(v);
          const history = routeHistories[v.deviceId] || [];
          const icon = makeIcon(
            offline ? shuttleSvgOffline : shuttleSvgOnline,
            [46, 46], [23, 23],
          );

          return (
            <React.Fragment key={v.deviceId}>
              {/* Breadcrumb trail — greyed out when offline */}
              {history.length > 1 && (
                <Polyline
                  positions={history}
                  pathOptions={{
                    color: offline ? '#94a3b8' : '#4f7ef8',
                    weight: 5,
                    opacity: offline ? 0.35 : 0.9,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              )}
              {history
                .filter((_, i) => i % 3 === 0 && i > 0 && i < history.length - 1)
                .map(([lat, lng], i) => (
                  <CircleMarker
                    key={`bc-${i}`}
                    center={[lat, lng]}
                    radius={3}
                    pathOptions={{
                      color: offline ? '#94a3b8' : '#4f7ef8',
                      fillColor: '#fff',
                      fillOpacity: 1,
                      weight: 1.5,
                    }}
                  />
                ))}

              {/* Shuttle marker at last known position */}
              <Marker
                position={[v.lat, v.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    setSelectedDeviceId(v.deviceId);
                    setFlyTo({ lat: v.lat, lng: v.lng });
                  },
                }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;