import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import './estilos.css' // Asegúrate de que tu CSS global esté importado
import { logout as logoutService } from './services/auth-service'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleLogin = (success) => {
    setIsAuthenticated(success)
  }

  const handleLogout = async () => {
    await logoutService()
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} isOnline={isOnline} />
  }

  // Envuelve el Dashboard en un div con la clase 'app-container'
  return (
    <div className="app-container">
      <Dashboard onLogout={handleLogout} isOnline={isOnline} />
    </div>
  )
}

export default App
