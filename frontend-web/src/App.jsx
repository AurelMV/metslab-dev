import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import FilterPanel from "./pages/Categoriasobre.jsx";
import "./estiloscatalogo/DiseñoApp.css"; // Asegúrate de tener este archivo CSS para los estilos

function App() {
  return (
    <Router>
      <div className="app-container">
        <header>
          <div className="logo-container">
            <h1>Metslab</h1>
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
          <FilterPanel />
        </div>

        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
        </Routes>

        <footer>
          <p>© 2025 Mi Catálogo 3D. Todos los derechos reservados.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
