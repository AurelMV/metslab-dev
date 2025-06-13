import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const PerfilPage = () => {
  const { token } = useAuth();
  const [perfil, setPerfil] = useState(null);

const obtenerPerfil = async () => {
  try {
    const token = localStorage.getItem('token'); // O desde tu contexto de autenticación
    const response = await axios.get('http://localhost:8000/api/perfil', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    setPerfil(response.data);
    setCargando(false);
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    setCargando(false);
  }
};

  useEffect(() => {
    if (token) {
      obtenerPerfil();
    }
  }, [token]);

  return (
    <div>
      <h1>Perfil</h1>
      {perfil ? (
        <pre>{JSON.stringify(perfil, null, 2)}</pre>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default PerfilPage;
