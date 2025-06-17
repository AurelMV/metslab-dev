import React from 'react'
import { User, Box, Layers, ShoppingBag, Users, LogOut, Rocket, Wifi, WifiOff } from 'lucide-react'

const Sidebar = ({ activeSection, onSectionChange, onLogout, isOnline }) => {
  const menuItems = [
    { id: 'profile', label: 'Perfil de Usuario', icon: User },
    { id: 'models', label: 'Creación de Modelos', icon: Box },
    { id: 'categories', label: 'Creación de Categorías', icon: Layers },
    { id: 'orders', label: 'Peticiones Disponibles', icon: ShoppingBag },
    { id: 'users', label: 'Usuarios', icon: Users }
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <Rocket className="icon-large" />
          <div>
            <h1 className="brand-title">Metslab</h1>
            <p className="brand-subtitle">3D Solution</p>
          </div>
        </div>
        <div className="sidebar-user-info">
          <p>as</p>
          <p className="user-email">as@ejemplo.com</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
            >
              <Icon className="icon-small" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="network-status">
          <span>Estado de red:</span>
          {isOnline ? (
            <div className="status online">
              <Wifi className="icon-small" />
              <span>Online</span>
            </div>
          ) : (
            <div className="status offline">
              <WifiOff className="icon-small" />
              <span>Offline</span>
            </div>
          )}
        </div>
        <button className="logout-button" onClick={onLogout}>
          <LogOut className="icon-small" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar
