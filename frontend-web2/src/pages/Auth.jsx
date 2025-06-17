import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
// Importa tu archivo CSS aquí
import "../stayle/Auth.css"; // Ajusta la ruta según donde guardes Auth.css

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let success = false;

      if (isLogin) {
        success = await login(formData.email, formData.password);
        if (!success) {
          setError(
            "Credenciales incorrectas. Prueba con admin@metslab.com / admin123"
          );
        }
      } else {
        success = await register(formData);
        if (!success) {
          setError("Error al registrar usuario");
        }
      }

      if (success) {
        navigate("/");
      }
    } catch (err) {
      console.error("Authentication error:", err); // Para depuración
      setError("Ha ocurrido un error. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-wrapper">
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <div className="auth-logo-icon-bg">
              <User className="auth-logo-icon" />
            </div>
            <span className="auth-logo-text">MetsLab</span>
          </Link>
          <h1 className="auth-title">
            {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
          </h1>
          <p className="auth-subtitle">
            {isLogin
              ? "Ingresa a tu cuenta para continuar"
              : "Únete a MetsLab y descubre modelos únicos"}
          </p>
        </div>

        {/* Form */}
        <div className="auth-form-container">
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Name - Register only */}
            {!isLogin && (
              <div className="auth-input-group">
                <label htmlFor="name" className="auth-label">
                  Nombre Completo
                </label>
                <div className="auth-input-wrapper">
                  <User className="auth-input-icon" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="auth-input-field"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="auth-input-group">
              <label htmlFor="email" className="auth-label">
                Correo Electrónico
              </label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="auth-input-field"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-input-group">
              <label htmlFor="password" className="auth-label">
                Contraseña
              </label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="auth-input-field auth-password-input auth-input-field-password"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Phone - Register only */}
            {!isLogin && (
              <div className="auth-input-group">
                <label htmlFor="phone" className="auth-label">
                  Teléfono (Opcional)
                </label>
                <div className="auth-input-wrapper">
                  <Phone className="auth-input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="auth-input-field"
                    placeholder="+51 987 654 321"
                  />
                </div>
              </div>
            )}

            {/* Address - Register only */}
            {!isLogin && (
              <div className="auth-input-group">
                <label htmlFor="address" className="auth-label">
                  Dirección (Opcional)
                </label>
                <div className="auth-input-wrapper">
                  <MapPin className="auth-input-icon textarea-icon" />{" "}
                  {/* Añadida clase para icono de textarea */}
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="auth-input-field auth-textarea-field"
                    placeholder="Tu dirección en Cusco"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && <div className="auth-error-message">{error}</div>}

            {/* Demo Credentials */}
            {isLogin && (
              <div className="auth-demo-credentials">
                <p>Credenciales de prueba:</p>
                <p>Admin: admin@metslab.com / admin123</p>
                <p>Cliente: cliente@example.com / cliente123</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`auth-submit-button ${loading ? "loading" : ""}`}
            >
              {loading
                ? "Procesando..."
                : isLogin
                ? "Iniciar Sesión"
                : "Crear Cuenta"}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="auth-toggle-mode">
            <p>{isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}</p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  phone: "",
                  address: "",
                });
              }}
              className="auth-toggle-mode-button"
            >
              {isLogin ? "Crear cuenta nueva" : "Iniciar sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
