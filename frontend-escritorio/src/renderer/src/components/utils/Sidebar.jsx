import React, { useEffect, useState } from 'react'
import { User, Box, Layers, ShoppingBag, Users, LogOut, Rocket, Wifi, WifiOff } from 'lucide-react'
import { getCurrentUser } from '../../services/auth-service'

const Sidebar = ({ activeSection, onSectionChange, onLogout, isOnline }) => {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null))
  }, [])

  const menuItems = [
    { id: 'models', label: 'Modelos', icon: Box },
    { id: 'categories', label: 'Categorías', icon: Layers },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
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
        <button
          className="sidebar-user-info"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'none',
            border: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            marginTop: '1rem',
            padding: 0
          }}
          onClick={() => onSectionChange('profile')}
        >
          <div className="user-avatar" style={{ height: '2.5rem', width: '2.5rem' }}>
            <span className="user-avatar-initials">
              {currentUser?.name ? (
                currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
              ) : (
                <User className="icon-small" />
              )}
            </span>
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.95rem', color: '#fff' }}>
              {currentUser?.name || 'Usuario'}
            </div>
            <div className="user-email" style={{ color: '#ffedd5', fontSize: '0.85rem' }}>
              {currentUser?.email || ''}
            </div>
          </div>
        </button>
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
