import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí deberías hacer la petición a tu backend para autenticar
    // Por ejemplo, usando fetch o axios
    // Si hay errores, actualiza setErrors
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', sans-serif",
      background: "linear-gradient(135deg, #667eea, #764ba2)",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div className="login-container" style={{
        background: "white",
        padding: "40px 30px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 20, color: "#333" }}>Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            required
            autoFocus
            onChange={e => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 15,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14
            }}
          />
          {errors.email && <div className="error" style={{ color: "red", fontSize: 13, marginTop: -10, marginBottom: 10 }}>{errors.email}</div>}

          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 15,
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 14
            }}
          />
          {errors.password && <div className="error" style={{ color: "red", fontSize: 13, marginTop: -10, marginBottom: 10 }}>{errors.password}</div>}

          <button type="submit" style={{
            width: "100%",
            padding: 12,
            backgroundColor: "#5A67D8",
            color: "white",
            fontSize: 16,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            transition: "background 0.3s"
          }}>Ingresar</button>
        </form>

        <div style={{ textAlign: "center", marginTop: 15 }}>
          ¿No tienes cuenta? <a href="/register">Regístrate aquí</a>
        </div>

        <div className="divider" style={{
          textAlign: "center",
          margin: "20px 0",
          position: "relative"
        }}>
          <span style={{
            background: "white",
            padding: "0 10px",
            color: "#777",
            fontSize: 14
          }}>o continua con</span>
          <div style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "40%",
            height: 1,
            background: "#ccc"
          }} />
          <div style={{
            position: "absolute",
            top: "50%",
            right: 0,
            width: "40%",
            height: 1,
            background: "#ccc"
          }} />
        </div>

        <div className="social-buttons" style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 20
        }}>
          <a href="/auth/google" className="btn-social btn-google" style={{
            padding: 10,
            color: "white",
            backgroundColor: "#db4437",
            border: "none",
            textAlign: "center",
            borderRadius: 6,
            fontSize: 14,
            textDecoration: "none",
            transition: "background 0.3s"
          }}>Iniciar con Google</a>
          <a href="/auth/facebook" className="btn-social btn-facebook" style={{
            padding: 10,
            color: "white",
            backgroundColor: "#3b5998",
            border: "none",
            textAlign: "center",
            borderRadius: 6,
            fontSize: 14,
            textDecoration: "none",
            transition: "background 0.3s"
          }}>Iniciar con Facebook</a>
        </div>
      </div>
    </div>
  );
}