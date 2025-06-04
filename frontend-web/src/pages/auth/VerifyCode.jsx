import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Obtener el email y user_id del estado de navegación
  const email = location.state?.email;
  const userId = location.state?.user_id;

  useEffect(() => {
    if (!email || !userId) {
      navigate('/register');
      return;
    }
    // Enfocar el primer input al cargar
    inputRefs[0].current?.focus();
  }, [email, userId, navigate]);

  // Contador para reenvío de código
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Mover al siguiente input si hay un valor
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Enviar automáticamente cuando se complete el código
    if (index === 5 && value) {
      const completeCode = [...newCode.slice(0, 5), value].join('');
      if (completeCode.length === 6) {
        handleSubmit(null, completeCode);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Mover al input anterior en backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (e, completeCode = null) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      const verificationCode = completeCode || code.join('');
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL_API}/api/verify-code`, {
        email,
        code: verificationCode,
        user_id: userId
      });

      if (response.data.token) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Iniciar sesión con el contexto de autenticación
        await login(response.data.user, response.data.token);
        
        navigate('/', { 
          state: { 
            notification: {
              type: 'success',
              message: '¡Tu cuenta ha sido verificada exitosamente!'
            }
          }
        });
      }
    } catch (error) {
      console.error('Error de verificación:', error);
      setError(
        error.response?.data?.message || 
        'Error al verificar el código. Por favor, intenta nuevamente.'
      );
      // Limpiar los campos si el código es inválido
      if (error.response?.status === 422) {
        setCode(['', '', '', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      setIsLoading(true);
      await axios.post(`${import.meta.env.VITE_BASE_URL_API}/api/resend-code`, { 
        email,
        user_id: userId
      });
      
      setResendTimer(60);
      setCanResend(false);
      setError('');
      // Mostrar mensaje de éxito temporal
      const successMessage = document.createElement('div');
      successMessage.innerHTML = '✓ Nuevo código enviado';
      successMessage.style.position = 'fixed';
      successMessage.style.top = '20px';
      successMessage.style.left = '50%';
      successMessage.style.transform = 'translateX(-50%)';
      successMessage.style.backgroundColor = '#48bb78';
      successMessage.style.color = 'white';
      successMessage.style.padding = '10px 20px';
      successMessage.style.borderRadius = '6px';
      successMessage.style.animation = 'fadeInOut 3s forwards';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } catch (error) {
      setError('No se pudo reenviar el código. Por favor, intenta más tarde.');
    } finally {
      setIsLoading(false);
    }
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
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -20px); }
            10% { opacity: 1; transform: translate(-50%, 0); }
            90% { opacity: 1; transform: translate(-50%, 0); }
            100% { opacity: 0; transform: translate(-50%, -20px); }
          }
        `}
      </style>
      <div style={{
        background: "white",
        padding: "40px 30px",
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 20, color: "#333" }}>
          Verificar Correo Electrónico
        </h2>

        <p style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
          Hemos enviado un código de verificación a:<br/>
          <strong>{email}</strong>
        </p>

        {error && (
          <div style={{ 
            color: "#dc3545", 
            backgroundColor: "#f8d7da", 
            padding: "10px", 
            borderRadius: "4px", 
            marginBottom: "15px",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            marginBottom: "20px"
          }}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{
                  width: "40px",
                  height: "50px",
                  fontSize: "24px",
                  textAlign: "center",
                  border: "2px solid #ccc",
                  borderRadius: "8px",
                  outline: "none",
                  transition: "all 0.3s",
                  borderColor: error ? "#dc3545" : "#ccc",
                  backgroundColor: error ? "#fff5f5" : "white",
                  "&:focus": {
                    borderColor: "#5A67D8",
                    boxShadow: "0 0 0 2px rgba(90, 103, 216, 0.2)"
                  }
                }}
                autoComplete="off"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || code.join('').length !== 6}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: isLoading || code.join('').length !== 6 ? "#a0aec0" : "#5A67D8",
              color: "white",
              fontSize: "16px",
              border: "none",
              borderRadius: "6px",
              cursor: isLoading || code.join('').length !== 6 ? "not-allowed" : "pointer",
              transition: "background 0.3s"
            }}
          >
            {isLoading ? "Verificando..." : "Verificar"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={handleResendCode}
            disabled={!canResend || isLoading}
            style={{
              background: "none",
              border: "none",
              color: canResend ? "#5A67D8" : "#a0aec0",
              cursor: canResend && !isLoading ? "pointer" : "not-allowed",
              fontSize: "14px",
              textDecoration: canResend ? "underline" : "none"
            }}
          >
            {canResend ? "Reenviar código" : `Reenviar código en ${resendTimer}s`}
          </button>
        </div>
      </div>
    </div>
  );
}
