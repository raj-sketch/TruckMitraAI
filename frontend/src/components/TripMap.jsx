import React from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

export default function TripMap({ origin, destination }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // Replace with your API key
  });

  if (!isLoaded) return <div>Loading Map...</div>;

  const center = {
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  };

  const path = [
    { lat: origin.lat, lng: origin.lng },
    { lat: destination.lat, lng: destination.lng },
  ];

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={7}>
      <Marker position={origin} label="Origin" />
      <Marker position={destination} label="Destination" />
      <Polyline path={path} options={{ strokeColor: "#34d399", strokeWeight: 4 }} />
    </GoogleMap>
  );
}

