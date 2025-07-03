import React, { useState } from 'react'
import Sidebar from './utils/Sidebar.jsx'
import UserProfile from './UserProfile'
import ModelsManager from './ModelsManager'
import CategoriesManager from './CategoriesManager'
import OrdersManager from './OrdersManager.jsx'
import UsersManager from './UsersManager'
import ModelDetail from './ModelDetail'
import ColorManager from './ColorManager.jsx'

const Dashboard = ({ onLogout, isOnline }) => {
  const [activeSection, setActiveSection] = useState('profile')
  const [selectedModel, setSelectedModel] = useState(null)

  const renderContent = () => {
    if (activeSection === 'modelDetail' && selectedModel) {
      return <ModelDetail model={selectedModel} />
    }
    switch (activeSection) {
      case 'profile':
        return <UserProfile />
      case 'models':
        return (
          <ModelsManager
            onModelCardClick={(model) => {
              setSelectedModel(model)
              setActiveSection('modelDetail')
            }}
          />
        )
      case 'categories':
        return <CategoriesManager />
      case 'orders':
        return <OrdersManager />
      case 'users':
        return <UsersManager />
      case 'colors':
        return <ColorManager />
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
