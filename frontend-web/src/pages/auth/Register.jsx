import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import env from "../../config/env";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };    const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});  // Limpiar errores anteriores
    setIsLoading(true);

    try {
      const response = await axios.post(`${env.BASE_URL_API}/api/register`, formData);
      
      if (response.data.user_id) {
        // Registro exitoso, redirigir a la página de verificación
        navigate('/verify-code', { 
          state: { 
            email: formData.email,
            user_id: response.data.user_id 
          }
        });
      } else {
        // Respuesta inesperada del servidor
        setErrors({
          general: 'Error inesperado al registrar usuario'
        });
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        // Errores de validación del servidor
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        // Mensaje de error específico del servidor
        setErrors({
          general: error.response.data.message
        });
      } else {
        // Error de red u otro error inesperado
        setErrors({
          general: 'Error de conexión. Por favor, intenta de nuevo.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div style={{
        fontFamily: "'Segoe UI', sans-serif",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{
          background: "white",
          padding: "40px 30px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center"
        }}>
          <h2 style={{ color: "#333", marginBottom: "20px" }}>¡Revisa tu correo!</h2>
          <p style={{ marginBottom: "15px", color: "#666" }}>
            Te hemos enviado un correo de verificación a <strong>{formData.email}</strong>
          </p>
          <p style={{ marginBottom: "20px", color: "#666" }}>
            Por favor, haz clic en el enlace de verificación para completar tu registro.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: "10px 20px",
              backgroundColor: "#5A67D8",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Estilo común para todos los inputs
  const inputStyle = {
    width: "100%",
    padding: 10,
    marginBottom: 15,
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 14,
    color: "#333", // Color del texto
    backgroundColor: "#fff", // Color de fondo
    outline: "none" // Mejora visual al hacer focus
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
      <div style={{
        background: "white",
        padding: "40px 30px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 20, color: "#333" }}>Registro</h2>
        
        {errors.general && (
          <div style={{ 
            color: "#dc3545", 
            backgroundColor: "#f8d7da", 
            padding: "10px", 
            borderRadius: "4px", 
            marginBottom: "15px",
            textAlign: "center"
          }}>
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="name" style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "#444" }}>
            Nombre
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          {errors.name && (
            <div style={{ color: "red", fontSize: 13, marginTop: -10, marginBottom: 10 }}>
              {errors.name}
            </div>
          )}

          <label htmlFor="email" style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "#444" }}>
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          {errors.email && (
            <div style={{ color: "red", fontSize: 13, marginTop: -10, marginBottom: 10 }}>
              {errors.email}
            </div>
          )}

          <label htmlFor="password" style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "#444" }}>
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          {errors.password && (
            <div style={{ color: "red", fontSize: 13, marginTop: -10, marginBottom: 10 }}>
              {errors.password}
            </div>
          )}

          <label htmlFor="password_confirmation" style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "#444" }}>
            Confirmar Contraseña
          </label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
            style={inputStyle}
          />
          {errors.password_confirmation && (
            <div style={{ color: "red", fontSize: 13, marginTop: -10, marginBottom: 10 }}>
              {errors.password_confirmation}
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
              transition: "background 0.3s"
            }}
          >
            {isLoading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 15 }}>
          ¿Ya tienes cuenta?{" "}
          <a href="/login" style={{ color: "#5A67D8", textDecoration: "none" }}>
            Inicia sesión aquí
          </a>
        </div>
      </div>
    </div>
  );
}
