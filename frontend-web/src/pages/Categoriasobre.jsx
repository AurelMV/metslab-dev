import React, { useEffect, useState } from "react";
import axios from "axios";

function FilterPanel({ onCategoriaClick }) {
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/categorias"
        );
        setCategorias(response.data);
      } catch (error) {
        setError("Error al cargar categorías: " + error.message);
      }
    };

    fetchCategorias();
  }, []);

  const handleClick = (categoria) => {
    setCategoriaActiva(categoria.idCategoria);
    if (onCategoriaClick) {
      onCategoriaClick(categoria);
    }
  };

  const handleMostrarTodos = () => {
    setCategoriaActiva(null);
    if (onCategoriaClick) {
      onCategoriaClick(null); // Pasar null para mostrar todos
    }
  };

  return (
    <div className="filters">
      <div className="filter-group-title">Categorías</div>

      {error && <div className="error">{error}</div>}

      {/* Botón para mostrar todos los productos */}
      <button
        className={`filter-button ${categoriaActiva === null ? "active" : ""}`}
        onClick={handleMostrarTodos}
      >
        📋 Todas las categorías
      </button>

      {/* Botones de categorías */}
      {categorias.map((categoria) => (
        <button
          key={categoria.idCategoria}
          className={`filter-button ${
            categoriaActiva === categoria.idCategoria ? "active" : ""
          }`}
          onClick={() => handleClick(categoria)}
        >
          {categoria.nombre}
        </button>
      ))}
    </div>
  );
}

export default FilterPanel;
