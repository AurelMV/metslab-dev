import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import env from '../../config/env';

const VerificationCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutos en segundos

  useEffect(() => {
    if (!location.state?.userId) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.state, navigate]);

  const handleChange = (index, value) => {
    if (value.length > 1) return; // Prevenir múltiples caracteres
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const verificationCode = code.join('');
      const response = await axios.post(`${env.BASE_URL_API}/api/verify-code`, {
        userId: location.state.userId,
        code: verificationCode
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error al verificar el código');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await axios.post(`${env.BASE_URL_API}/api/resend-code`, {
        userId: location.state.userId
      });
      setCountdown(300); // Reiniciar el contador
      setError('');
    } catch (error) {
      setError('Error al reenviar el código');
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        <h2 style={{ textAlign: "center", marginBottom: 20, color: "#333" }}>
          Verifica tu correo
        </h2>
        
        <p style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
          Hemos enviado un código de verificación a tu correo electrónico
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
            justifyContent: "center",
            gap: "10px",
            marginBottom: "20px"
          }}>
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                id={`code-${index}`}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={1}
                style={{
                  width: "40px",
                  height: "40px",
                  textAlign: "center",
                  fontSize: "20px",
                  border: "2px solid #ccc",
                  borderRadius: "8px",
                  margin: "0 4px"
                }}
                required
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || code.some(digit => !digit) || countdown === 0}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: isLoading || code.some(digit => !digit) || countdown === 0 
                ? "#a0aec0" 
                : "#5A67D8",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: isLoading || code.some(digit => !digit) || countdown === 0 
                ? "not-allowed" 
                : "pointer",
              marginBottom: "15px"
            }}
          >
            {isLoading ? "Verificando..." : "Verificar"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <p style={{ color: "#666", marginBottom: "10px" }}>
            ¿No recibiste el código? {countdown > 0 ? `(${formatTime(countdown)})` : ''}
          </p>
          <button
            onClick={handleResendCode}
            disabled={countdown > 0}
            style={{
              background: "none",
              border: "none",
              color: countdown > 0 ? "#a0aec0" : "#5A67D8",
              cursor: countdown > 0 ? "not-allowed" : "pointer",
              textDecoration: "underline",
              fontSize: "14px"
            }}
          >
            Reenviar código
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationCode;
