import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Truck, Shield, Clock } from "lucide-react";
import { modelsWithCategories } from "../data/mockData";

// Import the pure CSS file
import "../stayle/Home.css"; // Adjust the path as per your file structure

export default function Home() {
  const featuredModels = modelsWithCategories.slice(0, 3);

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="content-wrapper">
          <div className="hero-content">
            <h1 className="hero-title">
              Modelos 3D de
              <span className="hero-title-highlight"> Alta Calidad</span>
            </h1>
            <p className="hero-description">
              En MetsLab, creamos y comercializamos modelos 3D únicos para
              impresión, diseño y colección. Descubre nuestra amplia gama de
              productos especializados en Cusco, Perú.
            </p>
            <div className="hero-actions">
              <Link to="/catalog" className="hero-button-primary">
                Ver Catálogo
                <ArrowRight className="hero-button-icon" />
              </Link>
              <a href="#about" className="hero-button-secondary">
                Conocer Más
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="content-wrapper">
          <div className="features-header">
            <h2 className="features-title">¿Por qué elegir MetsLab?</h2>
            <p className="features-description">
              Nos especializamos en ofrecer la mejor experiencia en modelos 3D
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Star className="feature-icon" />
              </div>
              <h3 className="feature-title">Alta Calidad</h3>
              <p className="feature-description">
                Modelos diseñados con precisión y atención al detalle
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Truck className="feature-icon" />
              </div>
              <h3 className="feature-title">Delivery en Cusco</h3>
              <p className="feature-description">
                Entrega a domicilio en toda la ciudad de Cusco
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Shield className="feature-icon" />
              </div>
              <h3 className="feature-title">Garantía</h3>
              <p className="feature-description">
                Todos nuestros productos cuentan con garantía de calidad
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Clock className="feature-icon" />
              </div>
              <h3 className="feature-title">Entrega Rápida</h3>
              <p className="feature-description">
                Procesamos y enviamos tus pedidos de forma eficiente
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products-section">
        <div className="content-wrapper">
          <div className="featured-products-header">
            <h2 className="featured-products-title">Productos Destacados</h2>
            <p className="featured-products-description">
              Descubre algunos de nuestros modelos más populares
            </p>
          </div>

          <div className="featured-products-grid">
            {featuredModels.map((model) => (
              <div key={model.id} className="product-card">
                <div className="product-image-aspect-wrapper">
                  <img
                    src={model.image}
                    alt={model.name}
                    className="product-image"
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-title">{model.name}</h3>
                  <p className="product-description">{model.description}</p>
                  <div className="product-price-actions">
                    <span className="product-price">
                      S/ {model.price.toFixed(2)}
                    </span>
                    <Link
                      to={`/product/${model.id}`}
                      className="product-details-button"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="view-all-products-button-wrapper">
            <Link to="/catalog" className="view-all-products-button">
              Ver Todos los Productos
              <ArrowRight className="view-all-products-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="content-wrapper">
          <div className="about-content-grid">
            <div className="about-text-content">
              <h2 className="about-title">Sobre MetsLab</h2>
              <div className="about-description-paragraphs">
                <p>
                  MetsLab es una empresa cusqueña especializada en el diseño y
                  comercialización de modelos 3D de alta calidad. Nos dedicamos
                  a crear productos únicos que combinan funcionalidad y
                  estética.
                </p>
                <p>
                  Nuestro equipo de diseñadores expertos trabaja con tecnología
                  de vanguardia para ofrecer modelos 3D listos para impresión,
                  ideales para decoración, coleccionismo y uso práctico.
                </p>
                <p>
                  Ubicados en el corazón de Cusco, ofrecemos servicio de
                  delivery local y recojo en tienda, garantizando la mejor
                  experiencia de compra para nuestros clientes.
                </p>
              </div>
              <div className="about-stats-grid">
                <div className="about-stat-card">
                  <div className="about-stat-number">100+</div>
                  <div className="about-stat-label">Modelos Disponibles</div>
                </div>
                <div className="about-stat-card">
                  <div className="about-stat-number">500+</div>
                  <div className="about-stat-label">Clientes Satisfechos</div>
                </div>
              </div>
            </div>
            <div className="about-image-wrapper">
              <img
                src="https://images.pexels.com/photos/8566507/pexels-photo-8566507.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Proceso de impresión 3D"
                className="about-image"
              />
              <div className="about-image-overlay"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
