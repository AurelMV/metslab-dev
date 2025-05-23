import React, { useState, useEffect } from "react";

function ProductImageViewer({ productId }) {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Función para obtener la imagen del producto desde la API
  useEffect(() => {
    const fetchImageData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Llamada a la API para obtener la imagen
        const response = await fetch(
          `http://127.0.0.1:8000/api/modelos/imagenes/${productId}`
        );

        if (!response.ok) {
          throw new Error("No se pudo obtener la imagen del producto");
        }

        const result = await response.json();

        if (result.success && result.data) {
          setImageData(result.data);
        } else {
          throw new Error("Formato de respuesta inválido");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error al cargar imagen:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchImageData();
    }
  }, [productId]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageRetry = () => {
    setImageError(false);
    // Forzar recarga de la imagen
    const img = document.querySelector(".product-main-image");
    if (img) {
      img.src = img.src + "?retry=" + Date.now();
    }
  };

  if (loading) {
    return (
      <div className="image-viewer-loading">
        <div className="image-placeholder">
          <div className="spinner"></div>
          <p>Cargando imagen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="image-viewer-error">
        <div className="error-placeholder">
          <p>⚠️ Error al cargar la imagen</p>
          <p className="error-message">{error}</p>
          <button
            className="btn btn-small"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-image-viewer">
      <div className="image-container">
        {imageError ? (
          <div className="image-error-placeholder">
            <div className="placeholder-content">
              <p>🖼️ Imagen no disponible</p>
              <button className="btn btn-small" onClick={handleImageRetry}>
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <img
            src={imageData?.imagen_url || "/placeholder.png"}
            alt="Imagen del producto"
            className="product-main-image"
            onError={handleImageError}
          />
        )}
      </div>

      <div className="image-info">
        <div className="image-controls">
          <button className="btn btn-outline">🔍 Ver en tamaño completo</button>
        </div>

        <div className="image-note">
          <p>
            <strong>Nota:</strong> Esta es una vista previa del modelo. El
            producto final puede variar según las especificaciones de impresión.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProductImageViewer;
