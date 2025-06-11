// src/components/Dashboard/Dashboard.jsx
import React, { useState } from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import './Dashboard.css'

const Dashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('inicio')

  const menuItems = [
    { id: 'inicio', name: 'Creacion de Modelos', icon: '🏠' },
    { id: 'usuarios', name: 'Creacion de categorias ', icon: '👥' },
    { id: 'reportes', name: 'Peticiones Disponibles ', icon: '📊' },
    { id: 'configuracion', name: 'Usuarios', icon: '⚙️' }
  ]

  const handleMenuClick = (sectionId) => {
    setActiveSection(sectionId)
  }

  return (
    <div className="dashboard">
      <Sidebar
        menuItems={menuItems}
        activeSection={activeSection}
        onMenuClick={handleMenuClick}
        user={user}
        onLogout={onLogout}
      />
      <MainContent activeSection={activeSection} menuItems={menuItems} user={user} />
    </div>
  )
}

export default Dashboard
