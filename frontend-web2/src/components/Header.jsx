import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { User, Menu, X, Cuboid as Cube } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import MiniCart from "../components/MiniCart";
// Importa tu archivo CSS. Asegúrate de que la ruta sea correcta.
import "../stayle/Header.css";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper para determinar si un enlace está activo.
  // Ahora solo añade la clase 'active' o 'inactive'
  const getNavLinkClass = (path) => {
    return `desktop-nav-link ${isActive(path) ? "active" : "inactive"}`;
  };

  const getMobileNavLinkClass = (path) => {
    return `mobile-nav-link ${isActive(path) ? "active" : "inactive"}`;
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="header-container">
      <div className="header-wrapper">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="header-logo-link">
            <div className="header-logo-icon-bg">
              <Cube className="header-logo-icon" />
            </div>
            <span className="header-logo-text">MetsLab</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link to="/" className={getNavLinkClass("/")}>
              Inicio
            </Link>
            <Link to="/catalog" className={getNavLinkClass("/catalog")}>
              Catálogo
            </Link>
            {isAdmin && (
              <Link to="/admin" className={getNavLinkClass("/admin")}>
                Admin Panel
              </Link>
            )}
          </nav>          {/* Desktop User Actions */}
          <div className="desktop-user-actions">
            <div className="cart-container">
              <MiniCart />
            </div>

            {user ? (
              <div className="user-profile-actions">
                <Link to="/profile" className="profile-link">
                  <User className="profile-icon" />
                  <span className="profile-name">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="logout-button">
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link to="/auth/login" className="login-button">
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="menu-icon" />
            ) : (
              <Menu className="menu-icon" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav-panel open">
            {" "}
            {/* Añade la clase 'open' para controlar la visibilidad y animación */}
            <div className="mobile-nav-links">
              <Link
                to="/"
                className={getMobileNavLinkClass("/")}
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/catalog"
                className={getMobileNavLinkClass("/catalog")}
                onClick={() => setIsMenuOpen(false)}
              >
                Catálogo
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={getMobileNavLinkClass("/admin")}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              <div className="mobile-actions-section">
                <Link
                  to="/cart"
                  className="mobile-cart-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="mobile-cart-icon" />
                  <span className="mobile-cart-text">
                    Carrito ({itemCount})
                  </span>
                </Link>

                {user ? (
                  <div className="mobile-user-auth-section">
                    <Link
                      to="/profile"
                      className="mobile-profile-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="mobile-profile-icon" />
                      <span className="mobile-profile-name">{user.name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="mobile-logout-button"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth/login"
                    className="mobile-login-button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
