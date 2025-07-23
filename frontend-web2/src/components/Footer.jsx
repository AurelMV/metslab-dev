import React from "react";
import StaticMap from "./StaticMap";

export default function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1 */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-2xl font-bold text-white">MetsLab</h3>
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            </div>
            <p className="text-gray-400">
              Especialistas en modelos 3D de alta calidad para impresión y
              diseño.
              <br />
              Ofrecemos una amplia gama de productos únicos en Cusco, Perú.
            </p>
          </div>

          {/* Columna 2 */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <span>Contacto</span>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            </h4>
            <div className="space-y-4">
              <a
                href="mailto:info@metslab.com"
                className="flex items-center space-x-3 text-gray-400 hover:text-orange-400 transition-colors"
              >
                <span className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-lg">
                  ✉️
                </span>
                <span>info@metslab.com</span>
              </a>
              <div className="flex items-center space-x-3 text-gray-400">
                <span className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-lg">
                  🕒
                </span>
                <span>Lun - Sáb: 9:00 - 18:00</span>
              </div>
            </div>
          </div>

          {/* Columna 3 */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <span>Ubicación</span>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
            </h4>
            <div className="bg-gray-800 rounded-lg overflow-hidden mb-4 h-40 ring-1 ring-gray-700">
              <StaticMap />
            </div>
            <div className="text-gray-400 flex items-start space-x-3">
              <span className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-lg mt-1">
                📍
              </span>
              <div>
                San Borja-Alta Lote-C-4, Wanchaq-Cusco
                <br />
                Jr. Iquitos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500">
            © 2025 MetsLab. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
