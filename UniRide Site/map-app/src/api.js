export const fetchLocationData = async () => {
  // Replace with your active AWS API Gateway endpoint URL
  const response = await fetch('');
  if (!response.ok) throw new Error('Failed to fetch location data');
  return response.json(); 
  // Expected JSON format: [{ id: "shuttle-1", lat: 6.8211, lng: 80.0409, name: "Shuttle A", status: "En Route" }]
};