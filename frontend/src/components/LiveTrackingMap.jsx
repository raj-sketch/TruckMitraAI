import React from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

// Custom truck icon for the marker
const truckIcon = {
  url: "https://maps.google.com/mapfiles/kml/shapes/truck.png",
  scaledSize: new window.google.maps.Size(40, 40),
  anchor: new window.google.maps.Point(20, 20),
};

export default function LiveTrackingMap({ origin, destination, truckPosition }) {
  const { isLoaded, loadError } = useJsApiLoader({
    // It's highly recommended to store your API key in an environment variable
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY",
  });

  if (loadError) {
    return <div>Error loading map. Please check your API key and network connection.</div>;
  }

  if (!isLoaded) {
    return <div>Loading Map...</div>;
  }

  // Calculate the center of the map to fit origin and destination
  const center = {
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  };

  // Define the path for the route polyline
  const path = [
    { lat: origin.lat, lng: origin.lng },
    { lat: destination.lat, lng: destination.lng },
  ];

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={6} // Adjust zoom level as needed
    >
      {/* Origin Marker */}
      <Marker position={origin} label="O" title="Origin" />

      {/* Destination Marker */}
      <Marker position={destination} label="D" title="Destination" />

      {/* Truck's Live Position Marker */}
      {truckPosition && (
        <Marker position={truckPosition} icon={truckIcon} title={`Truck Location: ${truckPosition.lat}, ${truckPosition.lng}`} />
      )}

      {/* Route Polyline */}
      <Polyline path={path} options={{ strokeColor: "#10B981", strokeWeight: 4, strokeOpacity: 0.8 }} />
    </GoogleMap>
  );
}