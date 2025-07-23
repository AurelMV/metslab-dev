import React from "react";
import StaticMap from "./StaticMap";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-col">
          <h3 className="footer-title">MetsLab</h3>
          <p>
            Especialistas en modelos 3D de alta calidad para impresión y diseño.
            <br />
            Ofrecemos una amplia gama de productos únicos en Cusco, Perú.
          </p>
        </div>
        <div className="footer-col">
          <h4 className="footer-subtitle">Contacto</h4>
          <div>✉️ info@metslab.com</div>
          <div>🕒 Lun - Sáb: 9:00 - 18:00</div>
        </div>
        <div className="footer-col footer-map-box">
          <h4 className="footer-subtitle">Ubicación</h4>
          <div className="footer-map-frame">
            <StaticMap />
          </div>
          <div className="footer-map-address">
            San Borja-Alta Lote-C-4, Wanchaq-Cusco
            <br />
            Jr. Iquitos
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 MetsLab. Todos los derechos reservados.
      </div>
    </footer>
  );
}
