import React, { createContext, useContext, useState, useEffect } from "react";

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

  const login = async (email, password) => {
    // Mock authentication - in real app, this would call an API
    const mockUsers = [
      {
        id: "1",
        name: "Admin MetsLab",
        email: "admin@metslab.com",
        password: "admin123",
        role: "admin",
        phone: "+51 984 123 456",
        address: "Av. El Sol 123, Cusco",
      },
      {
        id: "2",
        name: "Cliente Ejemplo",
        email: "cliente@example.com",
        password: "cliente123",
        role: "customer",
        phone: "+51 987 654 321",
        address: "Jr. Comercio 456, Cusco",
      },
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

  const logout = () => {
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
