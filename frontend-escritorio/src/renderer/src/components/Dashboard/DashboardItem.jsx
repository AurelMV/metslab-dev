// src/components/Dashboard/DashboardItem.jsx
import React from 'react'
import Button from '../Common/Button'

const DashboardItem = ({ title, message, actions, icon, isEmpty = false, data = null }) => {
  const handleActionClick = (action) => {
    console.log(`Acción: ${action}`)
    // Aquí puedes agregar la lógica para cada acción
  }

  return (
    <div className={`dashboard-item ${isEmpty ? 'empty-state' : ''}`}>
      <div className="item-header">
        <div className="item-title">
          <span className="item-icon">{icon}</span>
          <h3>{title}</h3>
        </div>
      </div>

      <div className="item-content">
        {isEmpty ? (
          <div className="empty-state-content">
            <div className="empty-icon">{icon}</div>
            <p className="empty-message">{message}</p>

            {actions && actions.length > 0 && (
              <div className="empty-actions">
                <h4>Acciones disponibles:</h4>
                <div className="action-buttons">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={index === 0 ? 'primary' : 'outline'}
                      onClick={() => handleActionClick(action)}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="item-data">
            {/* Aquí iría el contenido cuando haya datos */}
            <p>Datos del item: {JSON.stringify(data)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardItem
