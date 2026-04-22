import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, Marker, Polyline, CircleMarker, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  fetchShuttleData, fetchDriverData,
  fetchPlannedRoute, saveRouteHistory, loadRouteHistory, NSBM_ORIGIN,
} from './api';
import { useSearch } from './SearchContext';
import RideCard from './RideCard';
import DriverList from './DriverList';

// ─── Direct API call — bypass api.js fetchLocationData so we can debug ────────
const LOCATION_API = process.env.REACT_APP_LOCATION_API;

// Offline if last ping > 10 minutes ago (generous — tracker was 1.4h old in example)
const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000;

function isOffline(vehicle) {
  if (!vehicle?.timestamp) return true;
  // timestamp is a plain Number (Unix ms epoch e.g. 1772812530997)
  return Date.now() - vehicle.timestamp > OFFLINE_THRESHOLD_MS;
}

// ─── Map Icons ────────────────────────────────────────────────────────────────
const shuttleSvgOnline = `
  <div style="position:relative;width:46px;height:46px;cursor:pointer;">
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
      <circle cx="23" cy="23" r="21" fill="#4f7ef8" stroke="white" stroke-width="3" opacity="0.97"/>
      <g transform="rotate(90,23,23)">
        <path d="M23 11 L31 33 L23 28 L15 33 Z" fill="white"/>
      </g>
    </svg>
    <div style="position:absolute;bottom:0;right:0;width:13px;height:13px;border-radius:50%;background:#22c55e;border:2px solid white;"></div>
  </div>`;

const shuttleSvgOffline = `
  <div style="position:relative;width:46px;height:46px;cursor:pointer;opacity:0.75;">
    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
      <circle cx="23" cy="23" r="21" fill="#94a3b8" stroke="white" stroke-width="3" opacity="0.97"/>
      <g transform="rotate(90,23,23)">
        <path d="M23 11 L31 33 L23 28 L15 33 Z" fill="white"/>
      </g>
    </svg>
    <div style="position:absolute;bottom:0;right:0;width:13px;height:13px;border-radius:50%;background:#94a3b8;border:2px solid white;"></div>
  </div>`;

const nsbmSvg = `
  <div style="display:flex;flex-direction:column;align-items:center;">
    <div style="background:#4f7ef8;color:#fff;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:700;padding:4px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 8px rgba(79,126,248,0.4);">NSBM</div>
    <div style="width:2px;height:6px;background:#4f7ef8;margin:0 auto;"></div>
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
      <circle cx="11" cy="11" r="9" fill="#4f7ef8" stroke="white" stroke-width="2.5"/>
      <circle cx="11" cy="11" r="4" fill="white"/>
    </svg>
  </div>`;

const destSvg = (label = 'Home') => `
  <div style="display:flex;flex-direction:column;align-items:center;">
    <div style="background:#ef4444;color:#fff;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:700;padding:4px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 8px rgba(239,68,68,0.4);max-width:140px;overflow:hidden;text-overflow:ellipsis;">${label.split(',')[0]}</div>
    <div style="width:2px;height:6px;background:#ef4444;margin:0 auto;"></div>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="30" viewBox="0 0 24 30">
      <path d="M12 1C6.477 1 2 5.477 2 11c0 7.5 10 19 10 19S22 18.5 22 11C22 5.477 17.523 1 12 1z" fill="#ef4444" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="11" r="4" fill="white"/>
    </svg>
  </div>`;

const makeIcon = (html, size, anchor) =>
  L.divIcon({ html, className: '', iconSize: size, iconAnchor: anchor });

function FlyTo({ lat, lng, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.flyTo([lat, lng], zoom, { duration: 1.4 });
  }, [lat, lng, zoom, map]);
  return null;
}

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

  const [vehicles, setVehicles]             = useState([]);
  const [shuttles, setShuttles]             = useState([]);
  const [drivers, setDrivers]               = useState([]);
  const [routeHistories, setRouteHistories] = useState({});
  const [plannedRoute, setPlannedRoute]     = useState(null);
  const [fitCoords, setFitCoords]           = useState(null);
  const [fitKey, setFitKey]                 = useState(0);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [flyTo, setFlyTo]                       = useState(null);
  const [apiError, setApiError]                 = useState(null); // visible debug

  const lastDestRef = useRef(null);

  // ── 1. Shuttle + driver metadata ─────────────────────────────────────────
  useEffect(() => {
    fetchShuttleData().then(setShuttles);
    fetchDriverData().then(setDrivers);
  }, []);

  // ── 2. Route: NSBM → destination ─────────────────────────────────────────
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
      const coords = route?.coords?.length > 1
        ? route.coords
        : [[NSBM_ORIGIN.lat, NSBM_ORIGIN.lng], [destination.lat, destination.lng]];
      setPlannedRoute({ coords });
      setFitCoords(coords);
      setFitKey(k => k + 1);
    });
  }, [destination]);

  // ── 3. GPS polling — direct fetch with known DynamoDB schema ─────────────
  // Schema: { deviceId (String), timestamp (Number/ms), lat (Number), lng (Number) }
  const pollGPS = useCallback(async () => {
    try {
      const res = await fetch(LOCATION_API);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

      const raw = await res.json();
      setApiError(null);

      if (!Array.isArray(raw) || raw.length === 0) return;

      // Schema: deviceId (String), timestamp (Number ms), lat (Number), lng (Number)
      const parsed = raw
        .map(item => ({
          deviceId:  item.deviceId,
          lat:       item.lat,
          lng:       item.lng,
          timestamp: item.timestamp,  // plain Number, Unix ms epoch
        }))
        .filter(v => v.deviceId && v.lat != null && v.lng != null);

      if (parsed.length === 0) return;

      // Keep only newest per deviceId (Lambda already sorts newest-first)
      const latestPerDevice = {};
      parsed.forEach(v => {
        if (!latestPerDevice[v.deviceId]) latestPerDevice[v.deviceId] = v;
      });
      const data = Object.values(latestPerDevice);

      // Merge — never wipe previously seen devices
      setVehicles(prev => {
        const merged = Object.fromEntries(prev.map(v => [v.deviceId, v]));
        data.forEach(v => { merged[v.deviceId] = v; });
        return Object.values(merged);
      });

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

    } catch (err) {
      setApiError(err.message);
      console.error('GPS poll failed:', err.message);
      // Do NOT clear vehicles — last known positions stay on map
    }
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

      {/* ── DriverList overlay ── */}
      <DriverList />

      {/* ── RideCard overlay ── */}
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

      {/* ── API error toast (only shown when fetch fails) ── */}
      {apiError && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: 10, padding: '8px 16px', fontSize: 12, color: '#b91c1c',
          fontFamily: 'monospace', maxWidth: '90vw', textAlign: 'center',
        }}>
          ⚠ GPS fetch failed: {apiError}
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

        {/* NSBM origin */}
        <Marker
          position={[NSBM_ORIGIN.lat, NSBM_ORIGIN.lng]}
          icon={makeIcon(nsbmSvg, [80, 52], [40, 52])}
        />

        {/* Destination */}
        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={makeIcon(destSvg(destination.displayName), [160, 52], [80, 52])}
          />
        )}

        {/* Road route */}
        {plannedRoute?.coords?.length > 1 && (
          <Polyline
            positions={plannedRoute.coords}
            pathOptions={{ color: '#10b981', weight: 6, opacity: 0.85 }}
          />
        )}

        {/* Vehicles — always shown at last known AWS position */}
        {vehicles.map(v => {
          const offline = isOffline(v);
          const history = routeHistories[v.deviceId] || [];

          return (
            <React.Fragment key={v.deviceId}>
              {history.length > 1 && (
                <Polyline
                  positions={history}
                  pathOptions={{
                    color: offline ? '#94a3b8' : '#4f7ef8',
                    weight: 5,
                    opacity: offline ? 0.35 : 0.9,
                    lineCap: 'round', lineJoin: 'round',
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
                      fillColor: '#fff', fillOpacity: 1, weight: 1.5,
                    }}
                  />
                ))}
              <Marker
                position={[v.lat, v.lng]}
                icon={makeIcon(offline ? shuttleSvgOffline : shuttleSvgOnline, [46, 46], [23, 23])}
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