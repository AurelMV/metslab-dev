import React, { useState, useEffect } from 'react'
import { Eye, Mail, Edit } from 'lucide-react'
import { getUsers, changeUserRole } from '../services/user-service'

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'cliente', label: 'Cliente' }
]

const UsersManager = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [editRole, setEditRole] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    setLoading(false)
    getUsers()
      .then((data) => {
        setUsers(data)
        setLoading(false)
      })
      .catch((err) => {
        setError('Error al obtener los usuarios')
        setLoading(false)
      })
  }, [successMsg])

  const openEditModal = (user) => {
    setEditUser(user)
    setEditRole(user.role || '')
  }

  const closeEditModal = () => {
    setEditUser(null)
    setEditRole('')
    setSuccessMsg('')
  }

  const handleSaveRole = async () => {
    if (!editUser || !editRole) return
    setSaving(true)
    try {
      await changeUserRole(editUser.id, editRole)
      setSuccessMsg('Rol actualizado correctamente')
      setEditUser(null)
      setEditRole('')
      // Recarga usuarios al guardar (trigger useEffect)
      setTimeout(() => setSuccessMsg(''), 1500)
    } catch (e) {
      setError('Error al actualizar el rol')
    } finally {
      setSaving(false)
    }
  }

  const getRoleClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge-admin'
      case 'cliente':
        return 'role-badge-cliente'
      default:
        return 'role-badge-default'
    }
  }

  const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '')

  if (loading) {
    return <div className="users-manager-container">Cargando usuarios...</div>
  }
  if (error) {
    return <div className="users-manager-container">{error}</div>
  }

  return (
    <div className="users-manager-container">
      <div className="users-manager-card">
        <div className="users-manager-header">
          <h2 className="users-manager-title">Gestión de Usuarios</h2>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead className="users-table-header">
              <tr>
                <th className="users-table-header th">Usuario</th>
                <th className="users-table-header th">Email</th>
                <th className="users-table-header th">Rol</th>
                <th className="users-table-header th">Acciones</th>
              </tr>
            </thead>
            <tbody className="users-table-body">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="users-table-data">
                    <div className="user-info-cell">
                      <div className="user-avatar-wrapper">
                        <div className="user-avatar">
                          <span className="user-avatar-initials">
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                      </div>
                      <div className="user-name-wrapper">
                        <div className="user-name">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="users-table-data">
                    <div className="contact-info">
                      <Mail className="contact-icon" />
                      {user.email}
                    </div>
                  </td>
                  <td className="users-table-data">
                    <span className={`role-badge ${getRoleClass(user.role)}`}>
                      {user.role ? capitalize(user.role) : 'Sin rol'}
                    </span>
                  </td>
                  <td className="users-table-data">
                    <div className="action-buttons-group">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="view-orders-button"
                        title="Ver pedidos"
                        disabled
                      >
                        <Eye className="view-orders-icon" />
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="edit-role-button"
                        title="Editar rol"
                      >
                        <Edit className="view-orders-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {successMsg && <div className="success-message">{successMsg}</div>}
      </div>

      {/* Modal para editar rol */}
      {editUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Editar rol de {editUser.name}</h3>
                <p className="modal-subtitle">{editUser.email}</p>
              </div>
              <button onClick={closeEditModal} className="modal-close-button">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <label className="modal-label" htmlFor="role-select">
                Rol
              </label>
              <select
                id="role-select"
                className="modal-select"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                disabled={saving}
              >
                <option value="">Seleccione un rol</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <div className="form-actions">
                <button className="cancel-button" onClick={closeEditModal} disabled={saving}>
                  Cancelar
                </button>
                <button
                  className="submit-button"
                  onClick={handleSaveRole}
                  disabled={saving || !editRole}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pedidos del usuario (deshabilitado porque no hay pedidos reales) */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Pedidos de {selectedUser.name}</h3>
                <p className="modal-subtitle">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="modal-close-button">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div>No hay pedidos disponibles para este usuario.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersManager
