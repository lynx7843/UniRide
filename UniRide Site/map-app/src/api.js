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

// ─── AWS APIs ─────────────────────────────────────────────────────────────────
const LOCATION_API = '';
const SHUTTLE_API  = 'YOUR_API_GATEWAY_URL/GetShuttles'; // Replace with your API URL
const DRIVER_API   = 'YOUR_API_GATEWAY_URL/GetDrivers';  // Replace with your API URL

// Fetches the latest known location for every device.
// Never throws — always returns an array (empty on failure) so the map
// continues to display whatever was previously loaded.
export const fetchLocationData = async () => {
  try {
    const response = await fetch(LOCATION_API);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Unexpected payload');

    // Keep only the newest record per deviceId.
    // Lambda already sorts newest-first, so first occurrence wins.
    const latestPerDevice = {};
    data.forEach(item => {
      if (item.deviceId && !latestPerDevice[item.deviceId]) {
        latestPerDevice[item.deviceId] = item;
      }
    });

    return Object.values(latestPerDevice);
  } catch (err) {
    console.warn('fetchLocationData failed:', err.message);
    return []; // caller keeps previous state; nothing breaks
  }
};

export const fetchShuttleData = async () => {
  try {
    const response = await fetch(SHUTTLE_API);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('fetchShuttleData failed:', err.message);
    return [];
  }
};

export const fetchDriverData = async () => {
  try {
    const response = await fetch(DRIVER_API);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn('fetchDriverData failed:', err.message);
    return [];
  }
};

// ─── Road-snapped route via OSRM (free, no API key, real roads) ──────────────
// Uses the public OSRM demo server with the "driving" profile and full geometry.
// Coordinates are lng,lat for OSRM but we convert back to [lat,lng] for Leaflet.
export const fetchPlannedRoute = async (startLat, startLng, destLat, destLng) => {
  try {
    // OSRM expects coordinates as "lng,lat" pairs separated by semicolons
    const coords = `${startLng},${startLat};${destLng},${destLat}`;
    const url =
      `https://router.project-osrm.org/route/v1/driving/${coords}` +
      `?overview=full&geometries=geojson&steps=false`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);

    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error(`OSRM: ${data.code}`);
    }

    // GeoJSON geometry coordinates are [lng, lat] — flip to [lat, lng] for Leaflet
    const leafletCoords = data.routes[0].geometry.coordinates.map(
      ([lng, lat]) => [lat, lng]
    );

    return { coords: leafletCoords };
  } catch (err) {
    console.warn('fetchPlannedRoute failed:', err.message);
    return null; // MapComponent falls back to straight line
  }
};