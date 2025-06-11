import React from 'react';

const PerfilUsuarioCard = ({ usuario }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-xl w-full text-gray-900 border border-gray-200">
      <div className="flex flex-col items-center mb-4">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl font-bold text-white mb-2 shadow">
          {usuario.nombre[0]}
        </div>
        <h2 className="text-2xl font-bold">{usuario.nombre}</h2>
        <span className="text-gray-500">{usuario.distrito}</span>
      </div>
      <div className="space-y-2">
        <p><span className="font-semibold">Email:</span> {usuario.email}</p>
        <p><span className="font-semibold">Celular:</span> {usuario.celular}</p>
      </div>
    </div>
  );
};

export default PerfilUsuarioCard;
