import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Star,
  Truck,
  Shield,
  Clock,
  ChevronRight,
  Download,
  Award,
  Tools,
} from "lucide-react";
import { modelsWithCategories } from "../data/mockData";

// Componente de Carrusel SEO
const SeoCarousel = () => {
  const seoContent = [
    {
      title: "Modelos 3D Premium en Cusco",
      description:
        "Descubre nuestra colección exclusiva de modelos 3D de alta calidad para impresión y diseño profesional.",
      image:
        "https://images.pexels.com/photos/7275394/pexels-photo-7275394.jpeg",
    },
    {
      title: "Diseños 3D para Arquitectura",
      description:
        "Modelos arquitectónicos detallados y precisos para tus proyectos de construcción y diseño.",
      image: "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg",
    },
    {
      title: "Impresión 3D en Cusco",
      description:
        "Servicios profesionales de impresión 3D con los mejores materiales y acabados del mercado.",
      image:
        "https://images.pexels.com/photos/8728560/pexels-photo-8728560.jpeg",
    },
  ];

  const [currentSlide, setCurrentSlide] = React.useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % seoContent.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-xl">
      {seoContent.map((content, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-all duration-500 ease-in-out ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={content.image}
            alt={content.title}
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">{content.title}</h3>
              <p className="text-sm max-w-md">{content.description}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {seoContent.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-4" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  useEffect(() => {
    document.title =
      "MetsLab | Modelos 3D de Alta Calidad para Impresión y Diseño en Cusco";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Descubre la mejor colección de modelos 3D en Cusco. Diseños premium para arquitectura, educación y decoración. Impresión 3D de alta calidad garantizada."
      );
    }
  }, []);

  const modelCategories = [
    { id: 1, name: "Arquitectura", icon: "🏛️", count: 45 },
    { id: 2, name: "Personajes", icon: "🧙", count: 37 },
    { id: 3, name: "Educativos", icon: "📚", count: 28 },
    { id: 4, name: "Arte y Decoración", icon: "🖼️", count: 52 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                Los mejores modelos 3D en Cusco
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Descubre Nuestros{" "}
                <span className="text-blue-600">Modelos 3D</span> de Alta
                Precisión
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                En MetsLab, diseñamos y comercializamos modelos 3D premium para
                impresión, diseño arquitectónico, educación, coleccionismo y
                decoración. Cada modelo está optimizado para imprimirse
                perfectamente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/catalog"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explorar Catálogo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <a
                  href="#about"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Conocer MetsLab
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="block text-3xl font-bold text-gray-900">
                    500+
                  </span>
                  <span className="text-gray-600">Modelos 3D</span>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="block text-3xl font-bold text-gray-900">
                    98%
                  </span>
                  <span className="text-gray-600">Clientes Satisfechos</span>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <span className="block text-3xl font-bold text-gray-900">
                    24h
                  </span>
                  <span className="text-gray-600">Entrega Rápida</span>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <SeoCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Características Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Calidad Premium</h3>
              <p className="text-gray-600">
                Modelos optimizados para una impresión perfecta
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Entrega Inmediata</h3>
              <p className="text-gray-600">
                Descarga instantánea después de la compra
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Garantía Total</h3>
              <p className="text-gray-600">
                Satisfacción garantizada en cada modelo
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Tools className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Soporte Técnico</h3>
              <p className="text-gray-600">Asistencia profesional 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Categorías de Modelos 3D
            </h2>
            <p className="text-xl text-gray-600">
              Explora nuestra amplia selección de modelos 3D organizados por
              categorías
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modelCategories.map((category) => (
              <Link
                key={category.id}
                to={`/catalog?category=${category.name.toLowerCase()}`}
                className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600">{category.count} modelos</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
