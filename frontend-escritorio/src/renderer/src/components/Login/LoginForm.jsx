// src/components/Login/LoginForm.jsx
import React, { useState } from 'react'
import Button from '../Common/Button'
import Input from '../Common/Input'
import './LoginForm.css'

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simulación de autenticación
    try {
      if (formData.username && formData.password) {
        // Aquí puedes agregar tu lógica de autenticación real
        setTimeout(() => {
          onLogin({
            username: formData.username,
            email: `${formData.username}@ejemplo.com`
          })
          setIsLoading(false)
        }, 1000)
      } else {
        setError('Por favor, completa todos los campos')
        setIsLoading(false)
      }
    } catch (err) {
      setError('Error de autenticación')
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu panel de control</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            type="text"
            name="username"
            placeholder="Usuario"
            value={formData.username}
            onChange={handleChange}
            icon="👤"
          />

          <Input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            icon="🔒"
          />

          {error && <div className="error-message">{error}</div>}

          <Button type="submit" variant="primary" disabled={isLoading} fullWidth>
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <div className="login-footer">
          <p>¿Olvidaste tu contraseña?</p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
