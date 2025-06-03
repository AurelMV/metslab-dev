import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import env from '../config/env';

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
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (userData, token) => {
    try {
      // Si se reciben datos de usuario y token directamente (login social)
      if (userData && token) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Login exitoso:', { userData });
        return { success: true };
      }

      // Login tradicional
      const response = await axios.post(`${env.BASE_URL_API}/api/login`, {
        email: userData,
        password: token
      });

      const { access_token, user: responseUser } = response.data;
      
      setUser(responseUser);
      localStorage.setItem('user', JSON.stringify(responseUser));
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
