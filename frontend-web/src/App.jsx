import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import FilterPanel from "./pages/Categoriasobre.jsx";
import "./estiloscatalogo/DiseñoApp.css";

function App() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const handleCategoriaClick = (categoria) => {
    setCategoriaSeleccionada(categoria);
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

        <footer>
          <p>© 2025 Mi Catálogo 3D. Todos los derechos reservados.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
