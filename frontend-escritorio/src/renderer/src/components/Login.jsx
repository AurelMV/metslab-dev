import React, { useState } from 'react'
import { Wifi, WifiOff, Lock, User, Rocket } from 'lucide-react'

const Login = ({ onLogin, isOnline }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isOnline) {
      alert('Error de red: No hay conexión a internet')
      return
    }

    setLoading(true)

    // Simular autenticación
    setTimeout(() => {
      if (email && password) {
        onLogin(true)
      } else {
        alert('Credenciales incorrectas')
      }
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <Rocket className="login-logo-icon" />
          </div>
          <h1 className="login-title">Metslab 3D</h1>
          <p className="login-subtitle">Solution Admin</p>
        </div>

        <div className="status-indicator-wrapper">
          {isOnline ? (
            <div className="status-indicator-online">
              <Wifi className="status-indicator-icon" />
              <span className="status-indicator-text">Conexión estable</span>
            </div>
          ) : (
            <div className="status-indicator-offline">
              <WifiOff className="status-indicator-icon" />
              <span className="status-indicator-text">Error de red</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="admin@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={!isOnline || loading} className="submit-button">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
