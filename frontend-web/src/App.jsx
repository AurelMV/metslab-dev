import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CatalogPage from "./pages/CatalogPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import FilterPanel from "./pages/Categoriasobre.jsx";
import Login from "./pages/auth/login.jsx";
import Register from "./pages/auth/Register.jsx";
import VerifyCode from "./pages/auth/VerifyCode.jsx";
import AuthCallback from "./pages/auth/AuthCallback.jsx";
import "./estiloscatalogo/DiseñoApp.css";
import "./estiloscatalogo/auth.css";
import Carrito from "./components/Carrito.jsx";

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed-header">
      <div className="header-content">
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <div className="logo-icon">🔬</div>
            <h1>METSLAB</h1>
            <span className="logo-subtitle">by Scientific Solutions</span>
          </Link>
        </div>

        <nav className="header-nav">
          <div className="dropdown">
            <span>MODELOS EN 3D <span className="dropdown-arrow">▼</span></span>
          </div>
          <div className="nav-item">
            <span>PAQUETES</span>
            <span className="badge">NUEVO</span>
          </div>
        </nav>

        <div className="header-actions">
          <button className="cart-button">
            🛒 <span className="cart-count">0</span>
          </button>
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">{user?.name}</span>
              <button onClick={handleLogout} className="logout-button">
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">Iniciar sesión</Link>
              <Link to="/register" className="register-button">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-code" element={<VerifyCode />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/producto/:id" element={<ProductDetailPage />} />
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

function HomePage() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const handleCategoriaClick = (categoria) => {
    setCategoriaSeleccionada(categoria);
  };

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Modelos en 3D para profesionales</h1>
          <p className="hero-description">
            Descubre nuestra extensa colección de modelos 3D
          </p>
        </div>
      </section>
      <section id="catalog-section">
        <FilterPanel onCategoriaClick={handleCategoriaClick} />
        <CatalogPage categoriaSeleccionada={categoriaSeleccionada} />
      </section>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <AppRoutes />
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}
