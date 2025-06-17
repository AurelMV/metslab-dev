import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { login as loginService } from "../../services/auth-service";
import "../../stayle/Auth.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginService(formData.email, formData.password);
      setUser(data.user || null);
      navigate("/");
    } catch (err) {
      setError(
        err?.message ||
          "Credenciales incorrectas. Prueba con admin@metslab.com / admin123"
      );
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
          <h1 className="auth-title">Iniciar Sesión</h1>
          <p className="auth-subtitle">Ingresa a tu cuenta para continuar</p>
        </div>
        <div className="auth-form-container">
          <form onSubmit={handleSubmit} className="auth-form">
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
            {error && <div className="auth-error-message">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className={`auth-submit-button ${loading ? "loading" : ""}`}
            >
              {loading ? "Procesando..." : "Iniciar Sesión"}
            </button>
          </form>
          <div className="auth-toggle-mode">
            <p>¿No tienes cuenta?</p>
            <Link to="/auth/register" className="auth-toggle-mode-button">
              Crear cuenta nueva
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
