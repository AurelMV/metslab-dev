import React, { useState } from 'react'
import Sidebar from './Sidebar'
import UserProfile from './UserProfile'
import ModelsManager from './ModelsManager'
import CategoriesManager from './CategoriesManager'
import OrdersManager from './OrdersManager.jsx'
import UsersManager from './UsersManager'

const Dashboard = ({ onLogout, isOnline }) => {
  const [activeSection, setActiveSection] = useState('profile')

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <UserProfile />
      case 'models':
        return <ModelsManager />
      case 'categories':
        return <CategoriesManager />
      case 'orders':
        return <OrdersManager />
      case 'users':
        return <UsersManager />
      default:
        return <UserProfile />
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={onLogout}
        isOnline={isOnline}
      />
      <div className="dashboard-content-area">{renderContent()}</div>
    </div>
  )
}

export default Dashboard
