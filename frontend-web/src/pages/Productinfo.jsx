import React from "react";
import { useCarrito } from "../context/CarritoContext";

function ProductInfo({ product }) {
  const { addToCart } = useCarrito();  if (!product) {
    return (
      <div className="product-info-loading">
        <p>Cargando información del producto...</p>
      </div>
    );
  }


  return (
    <div className="product-info">
      <div className="product-header">
        <h1 className="product-title">{product.nombre}</h1>
        <p className="product-category">
          <strong>Categoría:</strong> {product.nombreCategoria}
        </p>
      </div>

      <div className="product-details">
        <div className="detail-item">
          <h3>Descripción</h3>
          <p>{product.descripcion}</p>
        </div>

        <div className="detail-item">
          <h3>Dimensiones</h3>
          <p>{product.dimensiones}</p>
        </div>
        <div className="detail-item">
          <h3>Precio</h3>
          <p className="product-price">${product.precio}</p>
        </div>
        
        <div className="detail-item">
          <h3>ID del Modelo</h3>
          <p>{product.idModelo}</p>
        </div>
      </div>      <div className="product-actions">
        <button className="btn btn-primary" onClick={() => {
          console.log('Click en Agregar al Carrito con producto:', product);
          addToCart(product);
        }}>
          Agregar al Carrito
        </button>
        <button className="btn btn-secondary">Solicitar Cotización</button>
      </div>

      <div className="product-notes">
        <h4>Información Adicional</h4>
        <ul>
          <li>Disponible para impresión 3D</li>
          <li>Múltiples opciones de color disponibles</li>
          <li>Envío disponible a nivel nacional</li>
        </ul>
      </div>
    </div>
  );
}

export default ProductInfo;
