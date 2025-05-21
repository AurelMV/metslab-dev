import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

function CatalogPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/modelos/recursocatalogo');
        if (response.data.success) {
          setProductos(response.data.data);
        } else {
          setError('Error al obtener los datos');
        }
      } catch (error) {
        setError('Error de conexión: ' + error.message);
      } finally {
        setCargando(false);
      }
    };

    fetchProductos();
  }, []);

  if (cargando) return <div className="loading">Cargando productos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="catalog-container">
      <div className="products-grid">
        {productos.map((producto, index) => (
          <ProductCard key={index} producto={producto} />
        ))}
      </div>
    </div>
  );
}

export default CatalogPage;
