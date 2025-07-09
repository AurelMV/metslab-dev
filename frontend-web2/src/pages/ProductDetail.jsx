// ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Ruler,
  Package,
  Tag,
  Loader,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
//import env from "../config/env";
// *** ASEGÚRATE DE QUE ESTE ES TU ARCHIVO ModelViewer AJUSTADO CON LUCES, CÁMARA Y POST-PROCESADO ***
import ModelViewer from "./ModelViewer";
// Import the pure CSS file
import "../stayle/ProductDetail.css"; // Adjust the path as per your file structure
import { getColoresDisponibles } from "../services/colores-service";
import { getModelo3D, getModeloById } from "../services/modelo-service";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [model3DUrl, setModel3DUrl] = useState(null);
  // Estados para el producto
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para colores
  const [colors, setColors] = useState([]);
  const [colorsLoading, setColorsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  // Estados originales
  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [addedToCart, setAddedToCart] = useState(false);

  // Nueva función para obtener la URL del modelo 3D con CORS
  const fetchModel3DUrl = async (idModelo) => {
    try {
      const modeloUrl = await getModelo3D(idModelo);
      setModel3DUrl(modeloUrl);
    } catch (err) {
      setModel3DUrl(null);
    }
  };
  // Función para obtener colores desde la API
  const fetchColors = async () => {
    try {
      setColorsLoading(true);
      const result = await getColoresDisponibles();

      if (Array.isArray(result)) {
        // Mapear la estructura de tu API a la estructura esperada
        const mappedColors = result.map((color) => ({
          id: color.id,
          name: color.nombre,
          hex: `${color.codigo_hex}`, // Agregar # si no lo tiene
        }));
        setColors(mappedColors);

        // Seleccionar el primer color por defecto
        if (mappedColors.length > 0) {
          setSelectedColor(mappedColors[0]);
        }
      } else {
        console.error("Error: Expected array of colors");
        // Fallback a colores por defecto
        const defaultColors = [
          { id: 1, name: "Blanco", hex: "#ffffff" },
          { id: 2, name: "Negro", hex: "#000000" },
        ];
        setColors(defaultColors);
        setSelectedColor(defaultColors[0]);
      }
    } catch (err) {
      console.error("Error fetching colors:", err);
      // Fallback a colores por defecto en caso de error
      const defaultColors = [
        { id: 1, name: "Blanco", hex: "#ffffff" },
        { id: 2, name: "Negro", hex: "#000000" },
      ];
      setColors(defaultColors);
      setSelectedColor(defaultColors[0]);
    } finally {
      setColorsLoading(false);
    }
  };

  // Función para obtener el modelo desde la API
  const fetchModel = async () => {
    try {
      if (!id) {
        setError("ID del modelo no especificado");
        return;
      }

      setLoading(true);
      const data = await getModeloById(id);

      const [width = "0", height = "0", depth = "0"] = (
        data.dimensiones || ""
      ).split("*");

      const processedModel = {
        ...data,
        id: data.idModelo,
        name: data.nombre,
        description: data.descripcion,
        price: data.precio,
        image: data.imagen_url,
        category: {
          id: data.idCategoria,
          name: data.nombreCategoria,
        },
        dimensions: {
          width,
          height,
          depth,
        },
        modelo_url: data.modelo_url,
      };

      setModel(processedModel);
    } catch (err) {
      setError(err.message || "Error al obtener el modelo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
    if (id) {
      fetchModel();
      fetchModel3DUrl(id); // Llama a esta función para obtener la URL del modelo 3D
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      await addToCart(model, selectedColor, quantity);

      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert(
        "Ocurrió un error al agregar al carrito. Por favor, inténtalo de nuevo."
      );
    }
  };

  // Loading state
  if (loading || colorsLoading) {
    return (
      <div className="product-detail-container">
        <div className="content-wrapper">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              minHeight: "50vh",
            }}
          >
            <Loader className="animate-spin" size={32} />
            <span style={{ marginLeft: "1rem" }}>
              {loading ? "Cargando modelo..." : "Cargando colores..."}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !model) {
    return (
      <div className="product-not-found">
        <div className="product-not-found-content">
          <h2 className="product-not-found-title">
            {error || "Modelo no encontrado"}
          </h2>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <Link to="/catalog" className="product-not-found-button">
              Volver al Catálogo
            </Link>
            <button
              onClick={fetchModel}
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
    <div className="product-detail-container">
      <div className="content-wrapper">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/catalog" className="breadcrumb-link">
            Catálogo
          </Link>
          <span>/</span>
          <span className="breadcrumb-current-item">{model.name}</span>
        </div>

        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft className="back-button-icon" />
          <span>Volver</span>
        </button>

        {/* Product Details */}
        <div className="product-details-grid">
          {/* Image */}
          <div className="image-viewer-section">
            <div className="main-product-image-wrapper">
              <img
                src={model.image}
                alt={model.name}
                className="main-product-image"
                onError={(e) => {
                  e.target.src = "/placeholder-image.jpg";
                }}
              />
            </div>

            {/* 3D Model Viewer Placeholder - Ahora con enlace real */}
            <div className="viewer-placeholder-card">
              <Package className="viewer-icon" />

              {model3DUrl ? (
                // *** AQUÍ ESTÁS USANDO EL MODELVIEWER CON LA URL DEL GLB ***
                <ModelViewer
                  url={model3DUrl}
                  color={selectedColor?.hex || "#ffffff"} // Este prop 'color' ahora cambiará el color del material principal
                />
              ) : (
                <div style={{ color: "#888", fontStyle: "italic" }}>
                  No hay modelo 3D disponible
                </div>
              )}
              {model3DUrl && (
                <a
                  href={model3DUrl}
                  download
                  style={{
                    display: "inline-block",
                    marginTop: "0.5rem",
                    padding: "0.5rem 1rem",
                    backgroundColor: "#10b981",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  Descargar Modelo 3D
                </a>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div>
              <div className="product-category-wrapper">
                <span className="product-category-tag">
                  {model.category?.name || "Modelo 3D"}
                </span>
              </div>
              <h1 className="product-name">{model.name}</h1>
              <p className="product-description-full">
                {model.description ||
                  "Modelo 3D de alta calidad para impresión"}
              </p>
            </div>

            {/* Price */}
            <div className="product-price-display">
              <span className="product-price-value">
                S/ {model.price.toFixed(2)}
              </span>
            </div>

            {/* Specifications */}
            <div className="specifications-card">
              <h3 className="specifications-title">
                <Ruler className="specifications-icon" />
                Especificaciones
              </h3>
              <div className="specifications-grid">
                <div>
                  <span className="spec-label">Ancho:</span>
                  <span className="spec-value">
                    {model.dimensions.width} cm
                  </span>
                </div>
                <div>
                  <span className="spec-label">Alto:</span>
                  <span className="spec-value">
                    {model.dimensions.height} cm
                  </span>
                </div>
                <div>
                  <span className="spec-label">Profundidad:</span>
                  <span className="spec-value">
                    {model.dimensions.depth} cm
                  </span>
                </div>
                <div>
                  <span className="spec-label">Formato:</span>
                  <span className="spec-value">
                    {model.modelo_url?.toLowerCase().endsWith(".glb")
                      ? ".GLB"
                      : ".OBJ"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="quantity-label">Cantidad</label>
              <div className="quantity-control">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-button"
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-button"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="add-to-cart-section">
              {" "}
              <button
                onClick={handleAddToCart}
                className={`add-to-cart-button ${addedToCart ? "added" : ""}`}
                disabled={addedToCart}
              >
                <ShoppingCart className="add-to-cart-icon" />
                <span>{addedToCart ? "Agregado" : "Agregar al Carrito"}</span>
              </button>
              {addedToCart && (
                <div className="added-to-cart-message">
                  Producto agregado al carrito correctamente
                </div>
              )}
              <div className="shipping-info-list">
                <p>• Entrega gratuita con recojo en tienda</p>
                <p>• Delivery disponible en Cusco (+S/ 10.00)</p>
                <p>• Garantía de calidad en todos nuestros productos</p>
                <p>• Archivo 3D incluido para impresión personal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="auth-modal-overlay">
            <div className="auth-modal-content">
              <h3 className="auth-modal-title">Inicia Sesión para Continuar</h3>
              <p className="auth-modal-description">
                Para agregar productos al carrito necesitas iniciar sesión o
                crear una cuenta.
              </p>
              <div className="auth-modal-actions">
                <Link to="/auth/login" className="auth-modal-button-login">
                  Iniciar Sesión
                </Link>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="auth-modal-button-cancel"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
