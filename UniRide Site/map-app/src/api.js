// ─── NSBM University — fixed starting point ──────────────────────────────────
export const NSBM_ORIGIN = { lat: 6.821531498028471, lng: 80.0415943541182 };

// ─── Route history — persisted per device per calendar day ───────────────────
function todayKey(deviceId) {
  return `uniride_route_${deviceId}_${new Date().toISOString().split("T")[0]}`;
}
export function saveRouteHistory(deviceId, coords) {
  try { sessionStorage.setItem(todayKey(deviceId), JSON.stringify(coords)); } catch (_) {}
}
export function loadRouteHistory(deviceId) {
  try {
    const raw = sessionStorage.getItem(todayKey(deviceId));
    return raw ? JSON.parse(raw) : [];
  } catch (_) { return []; }
}

// ─── AWS API endpoints ────────────────────────────────────────────────────────
const LOCATION_API = 'https://123.amazonaws.com/dev/locations';
const SHUTTLE_API  = 'https://123.amazonaws.com/dev/GetShuttles';
const DRIVER_API   = 'https://123.amazonaws.com/dev/GetDrivers';

// ─── GPSTrackerData: { deviceId (String), timestamp (Number/ms), lat, lng } ──
// Returns array of latest-per-device records. Never throws.
export const fetchLocationData = async () => {
  try {
    const res = await fetch(LOCATION_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.json();
    if (!Array.isArray(raw)) throw new Error('Non-array response');

    // DynamoDB schema: deviceId (String), timestamp (Number/ms), lat (Number), lng (Number)
    const parsed = raw
      .map(item => ({
        deviceId:  item.deviceId,
        lat:       item.lat,
        lng:       item.lng,
        timestamp: item.timestamp,  // already a Number — Unix ms epoch
      }))
      .filter(v => v.deviceId && v.lat != null && v.lng != null);

    // Lambda sorts newest-first — first occurrence per deviceId is the latest
    const latest = {};
    parsed.forEach(v => { if (!latest[v.deviceId]) latest[v.deviceId] = v; });
    return Object.values(latest);
  } catch (err) {
    console.warn('fetchLocationData:', err.message);
    return [];
  }
};

// ─── ShuttleDetails: { shuttleId, capacity, deviceId, driverId, vehicleNumber } ─
export const fetchShuttleData = async () => {
  try {
    const res = await fetch(SHUTTLE_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('fetchShuttleData:', err.message);
    return [];
  }
};

// ─── DriverDetails: { driverId, driverName, licenseNumber, nic, phoneNumber } ─
export const fetchDriverData = async () => {
  try {
    const res = await fetch(DRIVER_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('fetchDriverData:', err.message);
    return [];
  }
};

// ─── Road-snapped route via OSRM (free, no key, real roads) ─────────────────
export const fetchPlannedRoute = async (startLat, startLng, destLat, destLng) => {
  try {
    const coords = `${startLng},${startLat};${destLng},${destLat}`;
    const url =
      `https://router.project-osrm.org/route/v1/driving/${coords}` +
      `?overview=full&geometries=geojson&steps=false`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error(`OSRM: ${data.code}`);

    // GeoJSON is [lng, lat] — flip to [lat, lng] for Leaflet
    return {
      coords: data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    };
  } catch (err) {
    console.warn('fetchPlannedRoute:', err.message);
    return null;
  }
};