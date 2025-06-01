import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import FilterPanel from "./pages/Categoriasobre.jsx";
import "./estiloscatalogo/DiseñoApp.css";
import Carrito from "./components/Carrito.jsx";

function App() {
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
        {/* Header fijo */}
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
            </nav>

            <div className="header-actions">
              <button className="cart-button">
                🛒 <span className="cart-count">0</span>
              </button>
              <button className="user-button">👤</button>
              <button className="register-button">Inscribirse</button>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route
            path="/"
            element={
              <>
                {/* Hero Section */}
                <section className="hero-section">
                  <div className="hero-background">
                    <div className="wireframe-overlay"></div>
                  </div>
                  <div className="hero-content">
                    <h1 className="hero-title">
                      Modelos en 3D para profesionales
                    </h1>
                    <p className="hero-description">
                      Descubre nuestra extensa colección de modelos 3D de alta
                      calidad para laboratorios científicos.
                      <br />
                      Desde equipos de análisis hasta instrumentación
                      especializada.
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
            }
          />
        </Routes>

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
    </Router>
  );
}

export default App;
