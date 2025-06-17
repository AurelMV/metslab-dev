import React, { useState } from 'react'
import { Wifi, WifiOff, Lock, User, Rocket } from 'lucide-react'
import { login as loginService } from '../services/auth-service'

const Login = ({ onLogin, isOnline }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isOnline) {
      alert('Error de red: No hay conexión a internet')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await loginService(email, password)
      if (data && data.token) {
        onLogin(true)
      } else {
        setError('Credenciales incorrectas')
      }
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setError(
          'No se pudo conectar con el servidor. Verifica tu conexión o que la API esté activa.'
        )
      } else {
        setError(err.message || 'Error de autenticación')
      }
    }
    setLoading(false)
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

          {error && <div className="text-error">{error}</div>}

          <button type="submit" disabled={!isOnline || loading} className="submit-button">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
