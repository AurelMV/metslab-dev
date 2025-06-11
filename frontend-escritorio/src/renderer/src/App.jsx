import Versions from './components/Versions'
import React, { useState } from 'react'
import electronLogo from './assets/electron.svg'
import LoginForm from './components/Login/LoginForm'
import Dashboard from './components/Dashboard/Dashboard'
import './styles/globals.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
