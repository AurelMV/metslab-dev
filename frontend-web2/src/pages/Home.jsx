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
  Wrench,
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
        "https://p.turbosquid.com/ts-thumb/DZ/KmrU5d/mizmn6Pe/anime_female_sign_01/jpg/1567277449/600x600/fit_q87/5fb841a415fd92bd9dc096538ffcbd7722f7177e/anime_female_sign_01.jpg",
    },
    {
      title: "Diseños 3D para Arquitectura",
      description:
        "Modelos arquitectónicos detallados y precisos para tus proyectos de construcción y diseño.",
      image:
        "https://images.cults3d.com/zZ5n1Wt_oP542sUfiJGSsL8_UZ8=/516x516/filters:no_upscale()/https://fbi.cults3d.com/uploaders/30981915/illustration-file/a0bc65a9-175f-468a-98ea-a4a77cc293b4/4.jpg",
    },
    {
      title: "Impresión 3D en Cusco",
      description:
        "Servicios profesionales de impresión 3D con los mejores materiales y acabados del mercado.",
      image:
        "https://media.cgtrader.com/variants/pyrvhlcwo9vxvgjv53byo8sy627e/a26e47dab5f2d22c43d6c5ce4b4b46ecc30c70918878397cba1a10c1e35d7bfc/adultelderdragon0.jpg",
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
              <div className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                Los mejores modelos 3D en Cusco
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Descubre Nuestros{" "}
                <span className="text-orange-600">Modelos 3D</span> de Alta
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
                  className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors"
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
            </div>
            <div className="w-full lg:w-1/2">
              <SeoCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Características y Categorías Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Características */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Características Principales
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg flex items-start">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Star className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Calidad Premium</h3>
                    <p className="text-sm text-gray-600">
                      Modelos optimizados para impresión perfecta
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg flex items-start">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Truck className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Entrega Inmediata</h3>
                    <p className="text-sm text-gray-600">
                      Descarga instantánea tras la compra
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg flex items-start">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Garantía Total</h3>
                    <p className="text-sm text-gray-600">
                      Satisfacción garantizada
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg flex items-start">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Wrench className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Soporte Técnico</h3>
                    <p className="text-sm text-gray-600">Asistencia 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Categorías de Modelos 3D
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {modelCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/catalog?category=${category.name.toLowerCase()}`}
                    className="group p-4 bg-white rounded-lg flex items-center hover:bg-orange-50 transition-colors shadow-sm"
                  >
                    <div className="text-3xl mr-4">{category.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.count} modelos
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
