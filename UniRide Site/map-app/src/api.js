// Journey data storage — tracks full path history for today
const STORAGE_KEY_PREFIX = "uniride_journey_";

function getTodayKey(id) {
  const today = new Date().toISOString().split("T")[0]; // e.g. "2025-03-05"
  return `${STORAGE_KEY_PREFIX}${id}_${today}`;
}

// Persist route history to sessionStorage (resets each tab/day)
export function saveRouteHistory(id, coords) {
  try {
    sessionStorage.setItem(getTodayKey(id), JSON.stringify(coords));
  } catch (_) {}
}

export function loadRouteHistory(id) {
  try {
    const raw = sessionStorage.getItem(getTodayKey(id));
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

// Fetch current live locations from your AWS API Gateway endpoint
export const fetchLocationData = async () => {
  // Replace with your active AWS API Gateway endpoint URL
  const response = await fetch('');
  if (!response.ok) throw new Error('Failed to fetch location data');
  return response.json();
  // Expected JSON format:
  // [{ 
  //   id: "shuttle-1", 
  //   lat: 6.8211, 
  //   lng: 80.0409, 
  //   name: "Shuttle A", 
  //   status: "En Route",
  //   startLat: 6.8100,   // optional: journey start point
  //   startLng: 80.0300,
  //   destLat: 6.8350,    // optional: final destination
  //   destLng: 80.0550,
  //   speed: 25,          // optional: km/h
  //   heading: 90         // optional: degrees
  // }]
};

// Fetch the planned route between two points using OSRM (free, no API key needed)
export const fetchPlannedRoute = async (startLat, startLng, destLat, destLng) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Route fetch failed');
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const durationSeconds = data.routes[0].duration;
      const distanceMeters = data.routes[0].distance;
      return { coords, durationSeconds, distanceMeters };
    }
  } catch (err) {
    console.warn("OSRM route fetch failed:", err);
  }
  return null;
};

