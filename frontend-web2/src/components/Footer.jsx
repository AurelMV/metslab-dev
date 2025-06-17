import React from "react";
import { MapPin, Phone, Mail, Clock, Cuboid as Cube } from "lucide-react";
// Importa tu archivo CSS. Asegúrate de que la ruta sea correcta.
import "../stayle/Footer.css";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-wrapper">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand-col">
            <div className="footer-logo-wrapper">
              <div className="footer-logo-icon-bg">
                <Cube className="h-6 w-6 text-white" />
              </div>
              <span className="footer-brand-name">MetsLab</span>
            </div>
            <p className="footer-description">
              Especialistas en modelos 3D de alta calidad para impresión y
              diseño. Ofrecemos una amplia gama de productos únicos en Cusco,
              Perú.
            </p>
            <div className="footer-location">
              <MapPin className="footer-icon" />
              <span>Cusco, Perú</span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="footer-heading">Contacto</h3>
            <div className="footer-contact-info">
              <div className="footer-contact-item">
                <Phone className="footer-icon" />
                <span>+51 984 123 456</span>
              </div>
              <div className="footer-contact-item">
                <Mail className="footer-icon" />
                <span>info@metslab.com</span>
              </div>
              <div className="footer-contact-item">
                <Clock className="footer-icon" />
                <span>Lun - Sáb: 9:00 - 18:00</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="footer-heading">Enlaces Rápidos</h3>
            <div className="footer-quick-links">
              <a href="#" className="footer-nav-link">
                Sobre Nosotros
              </a>
              <a href="#" className="footer-nav-link">
                Términos y Condiciones
              </a>
              <a href="#" className="footer-nav-link">
                Política de Privacidad
              </a>
              <a href="#" className="footer-nav-link">
                Soporte
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom-section">
          <p>&copy; 2024 MetsLab. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
