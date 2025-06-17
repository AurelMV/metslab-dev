import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  verifyCode as verifyCodeService,
  resendCode,
} from "../../services/register-service";
import { useAuth } from "../../contexts/AuthContext";
import { Mail } from "lucide-react";
import "../../stayle/Auth.css";

export default function VerifyCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const email = location.state?.email || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const data = await verifyCodeService({ email, code });
      setUser(data.user || null);
      navigate("/");
    } catch (err) {
      setError(err?.message || "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setInfo("");
    try {
      await resendCode(email);
      setInfo("Código reenviado correctamente. Revisa tu correo.");
    } catch (err) {
      setError(err?.message || "No se pudo reenviar el código");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-wrapper">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <div className="auth-logo-icon-bg">
              <Mail className="auth-logo-icon" />
            </div>
            <span className="auth-logo-text">MetsLab</span>
          </Link>
          <h1 className="auth-title">Verifica tu correo</h1>
          <p className="auth-subtitle">
            Ingresa el código que enviamos a <b>{email}</b>
          </p>
        </div>
        <div className="auth-form-container">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label htmlFor="code" className="auth-label">
                Código de verificación
              </label>
              <div className="auth-input-wrapper">
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="auth-input-field"
                  placeholder="Ingresa el código de 6 dígitos"
                  maxLength={6}
                />
              </div>
            </div>
            {error && <div className="auth-error-message">{error}</div>}
            {info && <div className="auth-info-message">{info}</div>}
            <button
              type="submit"
              disabled={loading}
              className={`auth-submit-button ${loading ? "loading" : ""}`}
            >
              {loading ? "Verificando..." : "Verificar"}
            </button>
          </form>
          <div className="auth-toggle-mode">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="auth-toggle-mode-button"
            >
              {resending ? "Reenviando..." : "Reenviar código"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
