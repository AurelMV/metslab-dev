import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import env from '../config/env';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error('Error al recuperar usuario:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user && !!localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && !axios.defaults.headers.common['Authorization']) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Validar el token con el backend
          const response = await axios.get(`${env.BASE_URL_API}/api/user`);
          if (response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          } else {
            throw new Error('No user data');
          }
        }
      } catch (error) {
        console.error('Error al validar sesión:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (userData, token) => {
    try {
      // Si se reciben datos de usuario y token directamente (login social)
      if (userData && token) {
        // Asegurar que el token se configura antes de cualquier operación
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Guardar datos
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('Login social exitoso:', { userData });
        return { success: true };
      }

      // Login tradicional
      const response = await axios.post(`${env.BASE_URL_API}/api/login`, {
        email: userData,
        password: token
      });

      const { access_token, user: responseUser } = response.data;
      
      // Configurar token antes de cualquier operación
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Guardar datos
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(responseUser));
      setUser(responseUser);
      setIsAuthenticated(true);
      
      console.log('Login tradicional exitoso:', { responseUser });
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        errors: error.response?.data?.errors || { general: 'Error al iniciar sesión' }
      };
    }
  };

  const logout = async () => {
    try {
      // Intentar hacer logout en el backend
      await axios.post(`${env.BASE_URL_API}/api/logout`);
    } catch (error) {
      console.error('Error al cerrar sesión en el backend:', error);
    } finally {
      // Limpiar datos locales independientemente de la respuesta del backend
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      navigate('/');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout
  };

  if (loading) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: '#666'
    }}>Cargando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
