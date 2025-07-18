import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import CatalogPage from "./CatalogPage.jsx";
import ProductDetailPage from "./ProductDetailPage.jsx";
import FilterPanel from "./Categoriasobre.jsx";
import Login from "./auth/login.jsx";
import Register from "./auth/Register.jsx";
import VerifyCode from "./auth/VerifyCode.jsx";
import AuthCallback from "./auth/AuthCallback.jsx";
import MapaPage from "./MapaPage.jsx"; // ✅ Importa el mapa
import "../estiloscatalogo/DiseñoApp.css";
import Carrito from "../components/Carrito.jsx";
import Pageadmi from "./Dashboard.jsx"; // ✅ Importa la página de administración
import { CarritoProvider } from "../context/CarritoContext.jsx";

// Componente Header con autenticación
function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Eliminamos window.location.reload() ya que no es necesario
    // El estado se actualiza correctamente a través del contexto
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
            <span>
              MODELOS EN 3D <span className="dropdown-arrow">▼</span>
            </span>
          </div>
          <div className="nav-item">
            <span>PAQUETES</span>
            <span className="badge">NUEVO</span>
          </div>
          <Link to="/mapa" className="nav-item">
            Mapa
          </Link>{" "}
          {/* ✅ Nuevo enlace */}
        </nav>

        <div className="header-actions">
          <button className="cart-button">
            🛒 <span className="cart-count">0</span>
          </button>
          {isAuthenticated && user ? (
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <button
                onClick={handleLogout}
                className="logout-button"
                style={{
                  backgroundColor: "#ff4757",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  "&:hover": {
                    backgroundColor: "#ff6b81",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <span>🚪</span> Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">
                Iniciar sesión
              </Link>
              <Link to="/register" className="register-button">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Componente principal de la página de inicio
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
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="wireframe-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Modelos en 3D para profesionales</h1>
          <p className="hero-description">
            Descubre nuestra extensa colección de modelos 3D de alta calidad
            para laboratorios científicos.
            <br />
            Desde equipos de análisis hasta instrumentación especializada.
          </p>
          <button className="cta-button" onClick={scrollToCatalog}>
            Explorar Catálogo
          </button>
        </div>
      </section>

      {/* Barra de categorías dinámicas */}
      <section className="categories-bar">
        <div className="categories-container">
          <FilterPanel onCategoriaClick={handleCategoriaClick} />
        </div>
      </section>

      {/* Sección del catálogo */}
      <section id="catalog-section" className="catalog-section">
        <CatalogPage
          categoriaSeleccionada={categoriaSeleccionada}
          onLimpiarFiltro={() => setCategoriaSeleccionada(null)}
        />
      </section>
    </>
  );
}

// Componente principal App
function App() {
  return (
    <Router>
      <AuthProvider>
        <CarritoProvider>
          <div className="app-container">
            <Header />

            <div className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/producto/:id" element={<ProductDetailPage />} />
                <Route path="/mapa" element={<MapaPage />} />
                <Route path="/admin" element={<Pageadmi />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/perfil" element={<HomePage />} />
              </Routes>
            </div>

            <Carrito />

            <footer className="modern-footer">
              <div className="footer-content">
                <div className="footer-section">
                  <h3>METSLAB</h3>
                  <p>Modelos 3D profesionales para laboratorios científicos</p>
                </div>
                <div className="footer-section">
                  <h4>Productos</h4>
                  <ul>
                    <li>
                      <a href="#">Equipos de laboratorio</a>
                    </li>
                    <li>
                      <a href="#">Instrumentos científicos</a>
                    </li>
                    <li>
                      <a href="#">Modelos anatómicos</a>
                    </li>
                  </ul>
                </div>
                <div className="footer-section">
                  <h4>Soporte</h4>
                  <ul>
                    <li>
                      <a href="#">Centro de ayuda</a>
                    </li>
                    <li>
                      <a href="#">Contacto</a>
                    </li>
                    <li>
                      <a href="#">Términos de uso</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="footer-bottom">
                <p>© 2025 Metslab - Todos los derechos reservados.</p>
              </div>
            </footer>
          </div>
        </CarritoProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
