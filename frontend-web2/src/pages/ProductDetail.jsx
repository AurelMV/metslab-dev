import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Ruler, Package, Loader } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import ModelViewer from "./ModelViewer";
import { getColoresDisponibles } from "../services/colores-service";
import { getModelo3D, getModeloById } from "../services/modelo-service";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [model3DUrl, setModel3DUrl] = useState(null);
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colors, setColors] = useState([]);
  const [colorsLoading, setColorsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const fetchModel3DUrl = async (idModelo) => {
    try {
      const modeloUrl = await getModelo3D(idModelo);
      setModel3DUrl(modeloUrl);
    } catch (err) {
      setModel3DUrl(null);
    }
  };

  const fetchColors = async () => {
    try {
      setColorsLoading(true);
      const result = await getColoresDisponibles();
      if (Array.isArray(result)) {
        const mappedColors = result.map((color) => ({
          id: color.id,
          name: color.nombre,
          hex: `${color.codigo_hex}`,
        }));
        setColors(mappedColors);
        if (mappedColors.length > 0) setSelectedColor(mappedColors[0]);
      } else {
        setColors([
          { id: 1, name: "Blanco", hex: "#ffffff" },
          { id: 2, name: "Negro", hex: "#000000" },
        ]);
        setSelectedColor({ id: 1, name: "Blanco", hex: "#ffffff" });
      }
    } catch (err) {
      setColors([
        { id: 1, name: "Blanco", hex: "#ffffff" },
        { id: 2, name: "Negro", hex: "#000000" },
      ]);
      setSelectedColor({ id: 1, name: "Blanco", hex: "#ffffff" });
    } finally {
      setColorsLoading(false);
    }
  };

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
        dimensions: { width, height, depth },
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
      fetchModel3DUrl(id);
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
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      alert(
        "Ocurrió un error al agregar al carrito. Por favor, inténtalo de nuevo."
      );
    }
  };

  if (loading || colorsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <Loader className="animate-spin text-orange-500" size={32} />
          <span className="text-lg text-gray-700">
            {loading ? "Cargando modelo..." : "Cargando colores..."}
          </span>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Modelo no encontrado"}
          </h2>
          <div className="flex gap-4 justify-center">
            <Link
              to="/catalog"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Volver al Catálogo
            </Link>
            <button
              onClick={fetchModel}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/catalog" className="hover:text-orange-600 transition">
            Catálogo
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{model.name}</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-orange-600 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image & 3D Viewer */}
          <div className="flex flex-col gap-4 order-1 md:order-1">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              {model3DUrl ? (
                <ModelViewer
                  url={model3DUrl}
                  color={selectedColor?.hex || "#ffffff"}
                />
              ) : (
                <div className="text-gray-400 italic">
                  No hay modelo 3D disponible
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-block text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-2">
                {model.category?.name || "Modelo 3D"}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {model.name}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {model.description ||
                  "Modelo 3D de alta calidad para impresión"}
              </p>
            </div>

            {/* Price */}
            <div className="bg-orange-50 rounded-lg p-4">
              <span className="text-3xl font-bold text-orange-600">
                S/ {model.price.toFixed(2)}
              </span>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Ruler className="w-5 h-5 text-orange-600 mr-2" />
                Especificaciones
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Ancho:</span>
                  <span className="ml-2 text-gray-600">
                    {model.dimensions.width} cm
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Alto:</span>
                  <span className="ml-2 text-gray-600">
                    {model.dimensions.height} cm
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Profundidad:
                  </span>
                  <span className="ml-2 text-gray-600">
                    {model.dimensions.depth} cm
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Formato:</span>
                  <span className="ml-2 text-gray-600">
                    {model.modelo_url?.toLowerCase().endsWith(".glb")
                      ? ".GLB"
                      : ".OBJ"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                Cantidad
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-xl flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-xl font-semibold text-gray-900 w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-xl flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                  addedToCart ? "bg-green-500 cursor-default" : ""
                }`}
                disabled={addedToCart}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{addedToCart ? "Agregado" : "Agregar al Carrito"}</span>
              </button>
              {addedToCart && (
                <div className="text-green-600 text-sm text-center font-medium">
                  Producto agregado al carrito correctamente
                </div>
              )}
              <div className="text-sm text-gray-600 flex flex-col gap-1">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Inicia Sesión para Continuar
              </h3>
              <p className="text-gray-600 mb-6">
                Para agregar productos al carrito necesitas iniciar sesión o
                crear una cuenta.
              </p>
              <div className="flex gap-3">
                <Link
                  to="/auth/login"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-center font-semibold transition"
                >
                  Iniciar Sesión
                </Link>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
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
