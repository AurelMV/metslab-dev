import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Corrige el ícono por defecto (por si no se muestra)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const ClickHandler = ({ onClick }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onClick(lat, lng);
    },
  });
  return null;
};

const MapaPage = () => {
  const [position, setPosition] = useState(null);

  const handleMapClick = async (lat, lng) => {
    setPosition([lat, lng]);

    // Enviar al backend con axios
    try {
      const response = await axios.post('http://localhost:8000/api/ubicaciones', {
        nombre: 'Ubicación desde mapa',
        latitud: lat,
        longitud: lng
      });

      console.log('Ubicación guardada:', response.data);
      alert('Ubicación guardada correctamente ✅');
    } catch (error) {
      console.error('Error al guardar ubicación', error);
      alert('Error al guardar ubicación ❌');
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <MapContainer center={[-12.0464, -77.0428]} zoom={13} style={{ height: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <ClickHandler onClick={handleMapClick} />
        {position && (
          <Marker position={position}>
            <Popup>
              Ubicación seleccionada: <br />
              Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapaPage;
