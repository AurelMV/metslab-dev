import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      try {
        const error = searchParams.get('error');
        const provider = searchParams.get('provider');
        
        if (error) {
          console.error('Error recibido del backend:', error);
          setError(error);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        const token = searchParams.get('token');
        const encodedUser = searchParams.get('user');
        const status = searchParams.get('status');

        console.log('Datos recibidos:', { token: token?.substring(0, 10) + '...', encodedUser: encodedUser?.substring(0, 10) + '...', status });

        if (!token || !encodedUser) {
          throw new Error('Faltan datos de autenticación');
        }

        try {
          let userData;
          try {
            const decodedUserStr = decodeURIComponent(encodedUser);
            userData = JSON.parse(decodedUserStr);
          } catch (e) {
            console.log('Error en primer intento de decodificación, intentando alternativa:', e);
            // Si falla, intentamos con base64
            try {
              const decodedStr = atob(encodedUser);
              userData = JSON.parse(decodedStr);
            } catch (e2) {
              console.error('Error en segundo intento de decodificación:', e2);
              throw new Error('No se pudo decodificar la información del usuario');
            }
          }

          console.log('Usuario decodificado:', userData);

          if (!userData.id || !userData.email) {
            throw new Error('Datos de usuario incompletos');
          }

          // Iniciar sesión usando el contexto de autenticación
          const loginResult = await login(userData, token);

          if (!loginResult.success) {
            throw new Error('Error al iniciar sesión');
          }

          // Esperar a que el estado se actualice
          let attempts = 0;
          const maxAttempts = 10;
          const checkInterval = 100; // 100ms

          while (!isAuthenticated && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            attempts++;
            console.log(`Esperando autenticación... Intento ${attempts}`);
          }

          if (!isAuthenticated) {
            throw new Error('No se pudo verificar la autenticación');
          }

          // Forzar una actualización del DOM antes de redirigir
          await new Promise(resolve => setTimeout(resolve, 100));

          console.log('Estado de autenticación verificado, redirigiendo...');
          window.location.href = '/';

        } catch (decodeError) {
          console.error('Error al procesar datos:', decodeError);
          throw new Error('Error al procesar los datos del usuario');
        }
      } catch (error) {
        console.error('Error en el callback de autenticación:', error);
        setError(error.message || 'Error al procesar la autenticación');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    processAuth();
  }, [navigate, searchParams, login, isAuthenticated]);

  // Componente de carga
  if (loading) {
    return (
      <div className="auth-callback-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea, #764ba2)'
      }}>
        <div className="loading-spinner" style={{
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '50%',
          borderTop: '4px solid #fff',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }}/>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{
          color: '#fff',
          marginTop: '20px',
          fontSize: '16px'
        }}>Procesando autenticación...</p>
      </div>
    );
  }

  // Componente de error
  if (error) {
    return (
      <div className="auth-callback-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff8000, #764ba2)'
      }}>
        <div className="error-message" style={{
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <p style={{ color: '#e53e3e', marginBottom: '10px' }}>{error}</p>
          <p style={{ color: '#666' }}>Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return null;
}
