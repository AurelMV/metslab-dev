import React, { useState } from "react";
import { Link } from "react-router-dom";

function ProductCard({ producto }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="product-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="product-image">
        <img src={producto.imagen_url} alt={producto.nombre} />

        {hover && (
          <div className="product-overlay">
            <div className="product-info">
              <h3>{producto.nombre}</h3>
              <p className="price">${producto.precio}</p>
            </div>
            {/* Actualizado para usar el ID del producto en lugar del nombre */}
            <Link
              to={`/producto/${producto.idModelo}`}
              className="details-button"
            >
              DETALLES
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
