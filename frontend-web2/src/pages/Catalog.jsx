import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Grid, List, Loader } from "lucide-react";

// Import the pure CSS file
import { getCategorias } from "../services/categoria-service";

import "../stayle/Catalog.css"; // Adjust the path as per your file structure

import { getModelosCatalogo } from "../services/modelo-service"; // Import your environment variables
export default function Catalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");

  // Estados para la API
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener categorías desde la API
  const fetchCategories = async () => {
    try {
      const response = await getCategorias();
      if (Array.isArray(response)) {
        setCategories(
          response.map((cat) => ({
            id: cat.idCategoria,
            name: cat.nombre,
          }))
        );
      } else if (response.data) {
        setCategories(
          response.data.map((cat) => ({
            id: cat.idCategoria,
            name: cat.nombre,
          }))
        );
      }
    } catch (err) {
      setCategories([]);
    }
  };

  // Función para obtener modelos desde la API
  const fetchModels = async (categoryId = "") => {
    try {
      setLoading(true);
      const modelos = await getModelosCatalogo(categoryId);
      setModels(modelos);
    } catch (err) {
      setError("Error al cargar los modelos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchCategories();
    // Solo recargar modelos si cambia la categoría seleccionada
    fetchModels(selectedCategory);
  }, [selectedCategory]);
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models.filter((model) => {
      const matchesSearch = model.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.precio - b.precio;
        case "price-high":
          return b.precio - a.precio;
        case "name":
        default:
          return a.nombre.localeCompare(b.nombre);
      }
    });

    return filtered;
  }, [searchTerm, sortBy, models]);

  // Loading state
  if (loading) {
    return (
      <div className="catalog-page-container">
        <div className="catalog-content-wrapper">
          <div className="catalog-header">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              <Loader className="animate-spin" size={32} />
              <span style={{ marginLeft: "1rem" }}>Cargando modelos...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="catalog-page-container">
        <div className="catalog-content-wrapper">
          <div className="catalog-header">
            <h1 className="catalog-title">Error</h1>
            <p className="catalog-description" style={{ color: "red" }}>
              {error}
            </p>
            <button
              onClick={() => fetchModels(selectedCategory)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page-container">
      <div className="catalog-content-wrapper">
        {/* Header */}
        <div className="catalog-header">
          <h1 className="catalog-title">Catálogo de Modelos 3D</h1>
          <p className="catalog-description">
            Explora nuestra colección completa de {models.length} modelos únicos
          </p>
        </div>

        {/* Filters */}
        <div className="catalog-filters-card">
          <div className="catalog-filter-grid">
            {/* Search */}
            <div className="filter-group">
              <label htmlFor="search-input" className="filter-label">
                Buscar
              </label>
              <div className="filter-input-wrapper">
                <Search className="filter-icon" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Buscar modelos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input-text"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label htmlFor="category-select" className="filter-label">
                Categoría
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="filter-group">
              <label htmlFor="sort-select" className="filter-label">
                Ordenar por
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Nombre</option>
                <option value="price-low">Precio: Menor a Mayor</option>
                <option value="price-high">Precio: Mayor a Menor</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="filter-group">
              <label className="filter-label">Vista</label>
              <div className="view-mode-buttons-group">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`view-mode-button ${
                    viewMode === "grid" ? "active" : ""
                  }`}
                >
                  <Grid className="view-mode-icon" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`view-mode-button ${
                    viewMode === "list" ? "active" : ""
                  }`}
                >
                  <List className="view-mode-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-count">
          <p>
            Mostrando {filteredAndSortedModels.length} de {models.length}{" "}
            modelos
          </p>
        </div>

        {/* Products Grid/List */}
        {filteredAndSortedModels.length > 0 ? (
          viewMode === "grid" ? (
            <div className="products-grid">
              {filteredAndSortedModels.map((model) => (
                <div key={model.idModelo} className="product-card-grid">
                  <div className="product-image-wrapper-grid">
                    <img
                      src={model.imagen_url}
                      alt={model.nombre}
                      className="product-image-grid"
                      onError={(e) => {
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                    <div className="product-overlay-grid">
                      <Link
                        to={`/product/${model.idModelo}`}
                        className="product-details-button-grid"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                  <div className="product-info-grid">
                    <span className="product-category-tag-grid">Modelo 3D</span>
                    <h3 className="product-name-grid">{model.nombre}</h3>
                    <p className="product-description-grid">
                      Modelo 3D de alta calidad para impresión
                    </p>
                    <div className="product-price-dimensions-grid">
                      <span className="product-price-grid">
                        S/ {model.precio.toFixed(2)}
                      </span>
                      <span className="product-dimensions-grid">
                        Disponible
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-list">
              {filteredAndSortedModels.map((model) => (
                <div key={model.idModelo} className="product-card-list">
                  <div className="product-content-list">
                    <div className="product-image-wrapper-list">
                      <img
                        src={model.imagen_url}
                        alt={model.nombre}
                        className="product-image-list"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.jpg";
                        }}
                      />
                    </div>
                    <div className="product-info-list">
                      <div className="product-details-left-list">
                        <span className="product-category-tag-list">
                          Modelo 3D
                        </span>
                        <h3 className="product-name-list">{model.nombre}</h3>
                        <p className="product-description-list">
                          Modelo 3D de alta calidad para impresión
                        </p>
                        <div className="product-dimensions-list">
                          Archivo disponible para descarga
                        </div>
                      </div>
                      <div className="product-details-right-list">
                        <div className="product-price-list">
                          S/ {model.precio.toFixed(2)}
                        </div>
                        <Link
                          to={`/product/${model.idModelo}`}
                          className="product-details-button-list"
                        >
                          Ver Detalles
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="no-results">
            <Filter className="no-results-icon" />
            <h3 className="no-results-title">No se encontraron modelos</h3>
            <p className="no-results-message">
              Intenta ajustar tus filtros de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
