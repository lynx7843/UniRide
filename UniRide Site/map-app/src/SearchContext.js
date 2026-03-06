import { createContext, useContext, useState, useCallback } from "react";

// ─── Nominatim geocoder (OpenStreetMap, free, no API key) ────────────────────
export async function geocodeQuery(query) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en", "User-Agent": "UniRide-ShuttleApp/1.0" },
  });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data.length) throw new Error("Location not found");
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────
const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  // destination: { lat, lng, displayName } | null
  const [destination, setDestination] = useState(null);
  const [searching, setSearching]     = useState(false);
  const [searchError, setSearchError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const result = await geocodeQuery(query);
      setDestination(result);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  }, []);

  const clearDestination = useCallback(() => {
    setDestination(null);
    setSearchError(null);
  }, []);

  return (
    <SearchContext.Provider value={{ destination, searching, searchError, search, clearDestination }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}
