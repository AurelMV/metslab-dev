import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
//import Crear from "./CrearModelo.jsx";
import env from "../config/env.jsx"; // Asegúrate de que la ruta sea correcta
function CatalogPage({ categoriaSeleccionada, onLimpiarFiltro }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos según la categoría seleccionada
  useEffect(() => {
    const fetchProductos = async () => {
      setCargando(true);
      setError(null);

      try {
        let response;

        if (categoriaSeleccionada) {
          // Si hay una categoría seleccionada, usar el endpoint específico
          response = await axios.get(
            `${env.BASE_URL_API}/api/modelos/categoria/${categoriaSeleccionada.idCategoria}`
          );
        } else {
          // Si no hay categoría seleccionada, mostrar todos los productos
          response = await axios.get(
            `${env.BASE_URL_API}/api/modelos/recursocatalogo`
          );
        }

        if (response.data.success) {
          setProductos(response.data.data);
        } else {
          setError("Error al obtener los datos");
        }
      } catch (error) {
        setError("Error de conexión: " + error.message);
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, [categoriaSeleccionada]); // Se ejecuta cada vez que cambia la categoría

  if (cargando) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="catalog-container">
      {categoriaSeleccionada && (
        <div className="filter-info">
          <h3>Mostrando productos de: {categoriaSeleccionada.nombre}</h3>
        </div>
      )}

      <div className="products-grid">
        {productos.length > 0 ? (
          productos.map((producto, index) => (
            <ProductCard key={index} producto={producto} />
          ))
        ) : (
          <div className="no-products">
            <p>
              {categoriaSeleccionada
                ? `No se encontraron productos en la categoría "${categoriaSeleccionada.nombre}".`
                : "No se encontraron productos."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CatalogPage;
