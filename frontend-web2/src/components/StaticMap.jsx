import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function StaticMap() {
  const position = [-13.52763798, -71.96567414]; // [lat, lng]

  return (
    <div style={{ borderRadius: "10px", overflow: "hidden", border: "2px solid #ff8000", width: "100%", height: "250px" }}>
      <MapContainer
        center={position}
        zoom={16}
        style={{ width: "100%", height: "100%" }}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        keyboard={false}
        touchZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution=""
        />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
}