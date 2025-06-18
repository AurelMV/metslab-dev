import React, { useState, useEffect } from 'react'
import { Save, Edit, Mail, Lock } from 'lucide-react'
import { updateProfile, changePassword } from '../services/profile-service'
import { getCurrentUser } from '../services/auth-service'

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  })
  const [passwordMsg, setPasswordMsg] = useState('')

  useEffect(() => {
    setLoading(true)
    getCurrentUser()
      .then((user) => {
        setUserData({ name: user.name || '', email: user.email || '' })
        setLoading(false)
      })
      .catch(() => {
        setErrorMsg('No se pudo cargar el perfil')
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const res = await updateProfile(userData.name)
      setSuccessMsg('Nombre actualizado correctamente')
      setIsEditing(false)
    } catch (e) {
      setErrorMsg('Error al actualizar el perfil')
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordMsg('')
    try {
      await changePassword(
        passwords.current_password,
        passwords.new_password,
        passwords.new_password_confirmation
      )
      setPasswordMsg('Contraseña actualizada correctamente')
      setPasswords({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      })
      setShowPasswordForm(false)
    } catch (e) {
      setPasswordMsg('Error al cambiar la contraseña')
    }
  }

  if (loading) {
    return (
      <div className="user-profile-container" style={{ color: '#000' }}>
        Cargando perfil...
      </div>
    )
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-card">
        <div className="user-profile-header">
          <h2 className="user-profile-title">Perfil de Usuario</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="edit-button"
            style={{ color: '#fff' }}
          >
            <Edit className="icon" />
            <span style={{ color: '#fff' }}>{isEditing ? 'Cancelar' : 'Editar'}</span>
          </button>
        </div>

        <div
          className="user-profile-content-centered"
          style={{
            maxWidth: 400,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            background: '#f3f4f6',
            padding: '1.5rem',
            borderRadius: '0.5rem'
          }}
        >
          <div className="user-profile-grid">
            <div className="input-group full-width">
              <label className="input-label">
                <Mail className="icon-small" />
                Correo electrónico
              </label>
              <input type="email" value={userData.email} disabled className="input-field" />
            </div>
            <div className="input-group full-width">
              <label className="input-label">Nombre</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
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

          <div style={{ marginTop: '2rem' }}>
            <button
              className="edit-button"
              style={{ background: '#2563eb', marginBottom: '1rem' }}
              onClick={() => setShowPasswordForm((v) => !v)}
            >
              <Lock className="icon" style={{ color: '#fff' }} />
              <span style={{ color: '#fff' }}>Cambiar contraseña</span>
            </button>
            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} style={{ marginTop: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Contraseña actual</label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwords.current_password}
                    onChange={(e) =>
                      setPasswords({ ...passwords, current_password: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Nueva contraseña</label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    className="input-field"
                    value={passwords.new_password_confirmation}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new_password_confirmation: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="save-button-container">
                  <button type="submit" className="save-button">
                    <Save className="icon" />
                    <span>Guardar Contraseña</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {successMsg && <div style={{ color: '#16a34a', marginTop: '1rem' }}>{successMsg}</div>}
          {errorMsg && <div style={{ color: '#dc2626', marginTop: '1rem' }}>{errorMsg}</div>}
          {passwordMsg && (
            <div
              style={{
                color: passwordMsg.startsWith('Error') ? '#dc2626' : '#16a34a',
                marginTop: '1rem'
              }}
            >
              {passwordMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile
