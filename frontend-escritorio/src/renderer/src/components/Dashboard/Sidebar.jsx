// src/components/Dashboard/Sidebar.jsx
import React from 'react'
import Button from '../Common/Button'

const Sidebar = ({ menuItems, activeSection, onMenuClick, user, onLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">Metslab 3D Solucion</span>
        </div>
        <div className="user-info">
          <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <p className="user-name">{user?.username}</p>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-button ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => onMenuClick(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <Button variant="outline" onClick={onLogout} fullWidth>
          🚪 Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

export default Sidebar
