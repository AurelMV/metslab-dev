import React, { useState } from 'react'
import { Save, Edit, Mail, Phone, Lock } from 'lucide-react'

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    email: 'admin@ejemplo.com',
    phone: '+1234567890',
    password: '••••••••'
  })

  const handleSave = () => {
    setIsEditing(false)
    alert('Datos guardados exitosamente')
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-card">
        <div className="user-profile-header">
          <h2 className="user-profile-title">Perfil de Usuario</h2>
          <button onClick={() => setIsEditing(!isEditing)} className="edit-button">
            <Edit className="icon" />
            <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
          </button>
        </div>

        <div className="user-profile-grid">
          <div className="input-group">
            <label className="input-label">
              <Mail className="icon-small" />
              Gmail
            </label>
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              disabled={!isEditing}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              <Phone className="icon-small" />
              Número de Teléfono
            </label>
            <input
              type="tel"
              value={userData.phone}
              onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              disabled={!isEditing}
              className="input-field"
            />
          </div>

          <div className="input-group full-width">
            <label className="input-label">
              <Lock className="icon-small" />
              Contraseña
            </label>
            <input
              type="password"
              value={userData.password}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              disabled={!isEditing}
              className="input-field"
            />
          </div>
        </div>

        {isEditing && (
          <div className="save-button-container">
            <button onClick={handleSave} className="save-button">
              <Save className="icon" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
