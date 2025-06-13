import React from 'react';
import { User, Mail, MapPin, Phone, Calendar } from 'lucide-react';

const PerfilCard = ({ perfil }) => {
  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-blue-100 text-blue-600 rounded-full p-3">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{perfil?.nombre_completo || 'Usuario'}</h2>
          <p className="text-gray-500">{perfil?.rol || 'Cliente'}</p>
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex items-center space-x-2">
          <Mail className="text-blue-500" size={20} />
          <span>{perfil?.email || 'Sin correo'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="text-green-500" size={20} />
          <span>{perfil?.telefono || 'Sin número'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="text-red-500" size={20} />
          <span>{perfil?.direccion || 'Sin dirección'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="text-purple-500" size={20} />
          <span>Miembro desde: {perfil?.fecha_creacion || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default PerfilCard;
