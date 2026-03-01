import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLocationData } from './api';

// Fix for default Leaflet marker icons not rendering correctly in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapComponent = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const getLocations = async () => {
      try {
        const data = await fetchLocationData();
        setLocations(data);
      } catch (error) {
        console.error("Error loading locations:", error);
      }
    };
    
    getLocations();
    
    // Poll the AWS API every 5 seconds for live updates
    const interval = setInterval(getLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer center={[6.8211, 80.0409]} zoom={15} className="map-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {locations.map((loc) => (
        <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={defaultIcon}>
          <Popup>
            <strong>{loc.name}</strong> <br />
            Status: {loc.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;