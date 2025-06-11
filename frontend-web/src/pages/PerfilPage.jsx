import React from 'react';
import PerfilUsuarioCard from '../components/PerfilUsuarioCard';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const usuarioMock = {
  nombre: "Juan Pérez",
  email: "juan.perez@email.com",
  celular: "987654321",
  distrito: "Miraflores",
  latitud: -12.1208,
  longitud: -77.0305
};

const PerfilPage = () => {
  const usuario = usuarioMock;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold mb-10 text-white tracking-wide drop-shadow-lg">
        Perfil de Usuario
      </h1>
      <div className="flex flex-col md:flex-row gap-10 w-full max-w-5xl">
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="w-full">
            <PerfilUsuarioCard usuario={usuario} />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="w-full h-[400px] rounded-xl shadow-lg overflow-hidden border-2 border-white/10">
            <MapContainer
              center={[usuario.latitud, usuario.longitud]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="rounded-xl"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />
              <Marker position={[usuario.latitud, usuario.longitud]}>
                <Popup>
                  <span className="font-semibold">{usuario.nombre}</span>
                  <br />
                  <span className="text-sm">{usuario.distrito}</span>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;
