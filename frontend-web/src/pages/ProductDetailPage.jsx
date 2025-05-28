import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import ProductInfo from "./Productinfo";
import ProductImageViewer from "./Productvista";
import "./Diseñosproduct.css";
import env from "../config/env.jsx"; // Asegúrate de que la ruta sea correcta

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener los datos del producto desde la API
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Usar el ID dinámico de la URL
        const response = await fetch(`${env.BASE_URL_API}/api/modelos/${id}`);

        if (!response.ok) {
          throw new Error("No se pudo obtener la información del producto");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          throw new Error("Formato de respuesta inválido");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail loading">
        <div className="container">
          <div className="spinner"></div>
          <p>Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail error">
        <div className="container">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="product-layout">
        {/* Componente para mostrar la modelo del producto */}
        <div className="product-image-section">
          <ProductImageViewer productId={id} />
        </div>

        {/* Componente para mostrar la información del producto */}
        <div className="product-info-section">
          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
