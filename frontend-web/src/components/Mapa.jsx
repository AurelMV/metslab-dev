import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregimos el icono por defecto de Leaflet que a veces no se muestra bien en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

export default function Mapa() {
  const [position, setPosition] = useState(null);

  const handleMapClick = (latlng) => {
    setPosition(latlng);
    console.log('Coordenadas:', latlng); // Luego esto se puede enviar al backend
  };

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <MapContainer center={[-12.0464, -77.0428]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ClickHandler onClick={handleMapClick} />
        {position && <Marker position={position} />}
      </MapContainer>
      {position && (
        <p>Ubicación seleccionada: Latitud {position.lat.toFixed(5)}, Longitud {position.lng.toFixed(5)}</p>
      )}
    </div>
  );
}
