import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCurrentUser,
  logout as logoutService,
} from "../services/auth-service";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem("metslab_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Cargar usuario al montar
  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const login = async (email, password) => {
    // Mock authentication - in real app, this would call an API
    const mockUsers = [

    ];

    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem("metslab_user", JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (userData) => {
    // Mock registration - in real app, this would call an API
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      role: "customer",
    };

    setUser(newUser);
    localStorage.setItem("metslab_user", JSON.stringify(newUser));
    return true;
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
    localStorage.removeItem("metslab_user");
  };

  const updateUser = (userData) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("metslab_user", JSON.stringify(updatedUser));
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
