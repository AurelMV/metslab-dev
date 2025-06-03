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
import { CarritoProvider } from "./context/CarritoContext.jsx";

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

  const scrollToCatalog = () => {
    const catalogSection = document.getElementById("catalog-section");
    catalogSection?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <Router>
      <div className="app-container">
        <header>
          <div className="logo-container">
            <Link to="/" className="logo-link">
              <h1>Metslab</h1>
            </Link>
          </div>
          <div className="search-container">
            <input type="text" placeholder="Buscar..." />
            <button className="search-button">🔍</button>
          </div>
          <div className="nav-buttons">
            <button className="user-button">👤</button>
            <button className="register-button">Inscribirse</button>
          </div>
        </header>

        <nav className="main-nav">
          <ul>
            <li>
              <Link to="/">MODELOS EN 3D</Link>
            </li>
          </ul>
        </nav>

        <div className="page-title">
          <h2>Modelos de 3D</h2>
        </div>

        <div className="filters">
          <FilterPanel onCategoriaClick={handleCategoriaClick} />
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <CatalogPage
                categoriaSeleccionada={categoriaSeleccionada}
                onLimpiarFiltro={() => setCategoriaSeleccionada(null)}
              />
            }
          />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
        </Routes>
        <Carrito />
        <footer>
          <p>© 2025 Mi Catálogo 3D. Todos los derechos reservados.</p>
        </footer>
      </div>
    </Router>
  );
}
