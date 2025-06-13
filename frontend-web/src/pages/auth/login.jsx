import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect } from "react";
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      // Redirige según el rol
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/catalogo");
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL_API}/api/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (response.status === 403 && data.verification_required) {
        // Redirigir a la página de verificación si el correo no está verificado
        navigate("/verify-code", {
          state: {
            email: data.email,
            user_id: data.user_id,
          },
        });
        return;
      }

      if (!response.ok) {
        setErrors(data.errors || { general: data.message });
        return;
      }

      // Login exitoso
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirigir según el rol del usuario y refrescar
      if (data.user.role === "admin") {
        navigate("/admin");
        window.location.reload(); // Añade el refresh
      } else {
        navigate("/");
        window.location.reload(); // Añade el refresh
      }
    } catch (error) {
      setErrors({ general: "Error al iniciar sesión" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BASE_URL_API}/auth/google`;
  };

  const handleFacebookLogin = () => {
    window.location.href = `${import.meta.env.VITE_BASE_URL_API}/auth/facebook`;
  };

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="login-container"
        style={{
          background: "white",
          padding: "40px 30px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20, color: "#333" }}>
          Iniciar Sesión
        </h2>

        {errors.general && (
          <div
            style={{
              color: "#dc3545",
              backgroundColor: "#f8d7da",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            required
            autoFocus
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 15,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
              color: "#333", // Añadido color de texto
              backgroundColor: "#fff", // Añadido color de fondo
            }}
          />
          {errors.email && (
            <div
              style={{
                color: "red",
                fontSize: 13,
                marginTop: -10,
                marginBottom: 10,
              }}
            >
              {errors.email}
            </div>
          )}

          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 15,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14,
              color: "#333", // Añadido color de texto
              backgroundColor: "#fff", // Añadido color de fondo
            }}
          />
          {errors.password && (
            <div
              style={{
                color: "red",
                fontSize: 13,
                marginTop: -10,
                marginBottom: 10,
              }}
            >
              {errors.password}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: 12,
              backgroundColor: isLoading ? "#a0aec0" : "#5A67D8",
              color: "white",
              fontSize: 16,
              border: "none",
              borderRadius: 6,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background 0.3s",
            }}
          >
            {isLoading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 15 }}>
          ¿No tienes cuenta?{" "}
          <a
            href="/register"
            style={{ color: "#5A67D8", textDecoration: "none" }}
          >
            Regístrate aquí
          </a>
        </div>

        <div
          style={{
            textAlign: "center",
            margin: "20px 0",
            position: "relative",
          }}
        >
          <span
            style={{
              background: "white",
              padding: "0 10px",
              color: "#777",
              fontSize: 14,
            }}
          >
            o continua con
          </span>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: "40%",
              height: 1,
              background: "#ccc",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: 0,
              width: "40%",
              height: 1,
              background: "#ccc",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginTop: 20,
          }}
        >
          <button
            onClick={handleGoogleLogin}
            className="btn-social btn-google"
            style={{
              padding: 10,
              color: "white",
              backgroundColor: "#db4437",
              border: "none",
              textAlign: "center",
              borderRadius: 6,
              fontSize: 14,
              cursor: "pointer",
              transition: "background 0.3s",
            }}
          >
            Iniciar con Google
          </button>
          <button
            onClick={handleFacebookLogin}
            className="btn-social btn-facebook"
            style={{
              padding: 10,
              color: "white",
              backgroundColor: "#3b5998",
              border: "none",
              textAlign: "center",
              borderRadius: 6,
              fontSize: 14,
              cursor: "pointer",
              transition: "background 0.3s",
            }}
          >
            Iniciar con Facebook
          </button>
        </div>
      </div>
    </div>
  );
}
