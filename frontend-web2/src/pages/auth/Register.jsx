import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail } from "lucide-react";
import { register as registerService } from "../../services/register-service";
import "../../stayle/Auth.css";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (formData.password !== formData.password_confirmation) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }
    try {
      await registerService(formData);
      navigate("/auth/verify-code", { state: { email: formData.email } });
    } catch (err) {
      setError(err?.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-wrapper">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <div className="auth-logo-icon-bg">
              <User className="auth-logo-icon" />
            </div>
            <span className="auth-logo-text">MetsLab</span>
          </Link>
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">
            Únete a MetsLab y descubre modelos únicos
          </p>
        </div>
        <div className="auth-form-container">
          <form onSubmit={handleSubmit} className="auth-form">
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
                  required
                  className="auth-input-field"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>
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
            <div className="auth-input-group">
              <label htmlFor="password_confirmation" className="auth-label">
                Confirmar Contraseña
              </label>
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password_confirmation"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  required
                  className="auth-input-field auth-password-input auth-input-field-password"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>
            {error && <div className="auth-error-message">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className={`auth-submit-button ${loading ? "loading" : ""}`}
            >
              {loading ? "Procesando..." : "Crear Cuenta"}
            </button>
          </form>
          <div className="auth-toggle-mode">
            <p>¿Ya tienes cuenta?</p>
            <Link to="/auth/login" className="auth-toggle-mode-button">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
