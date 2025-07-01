import React, { useEffect, useState } from 'react'
import { getColores, createColor, updateColor, deleteColor } from '../services/color-service'
import {} from '../services/auth-service' // Debes tener este servicio
import { Plus, Edit, Trash2 } from 'lucide-react'

function initialForm() {
  return { nombre: '', codigo_hex: '#000000', estado: true }
}

export default function ColorManager() {
  const [colores, setColores] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchColores()
  }, [])

  async function fetchColores() {
    setLoading(true)
    try {
      // ...en fetchColores()
      const data = await getColores()
      setColores(Array.isArray(data) ? data : [])
    } catch (err) {
      setColores([])
    }
    setLoading(false)
  }

  function handleOpenCreate() {
    setEditing(null)
    setForm(initialForm())
    setShowModal(true)
  }

  function handleOpenEdit(color) {
    setEditing(color.id)
    setForm({
      nombre: color.nombre,
      codigo_hex: color.codigo_hex,
      estado: !!color.estado
    })
    setShowModal(true)
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const token = localStorage.getItem('token')
    const payload = {
      nombre: form.nombre,
      codigo_hex: form.codigo_hex,
      estado: form.estado
    }

    try {
      if (editing) {
        await updateColor(editing, payload, token)
      } else {
        await createColor(payload, token)
      }
      setShowModal(false)
      fetchColores()
    } catch (err) {
      alert('Error al guardar el color')
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este color?')) return
    setLoading(true)
    const token = getToken()
    try {
      await deleteColor(id, token)
      fetchColores()
    } catch (err) {
      alert('Error al eliminar el color')
    }
    setLoading(false)
  }

  function handleCancel() {
    setShowModal(false)
  }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2 className="text-lg font-semibold text-secondary-900">Colores</h2>
        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus className="icon" />
          <span>Nuevo Color</span>
        </button>
      </div>
      // ...existing code...
      <div className="form-grid color-grid">
        {colores.map((color) => (
          <div key={color.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">{color.nombre}</h3>
              <span className={`status-indicator ${color.estado ? 'active' : 'inactive'}`}>
                {color.estado ? 'Activo' : 'Inactivo'}
              </span>
              <div className="action-buttons">
                <button className="action-btn" title="Editar" onClick={() => handleOpenEdit(color)}>
                  <Edit className="icon" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  display: 'inline-block',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: color.codigo_hex,
                  border: '1px solid #ccc'
                }}
                title={color.codigo_hex}
              />
              <span className="text-xs">{color.codigo_hex}</span>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editing ? 'Editar Color' : 'Nuevo Color'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Código HEX</label>
                  <div className="color-input-row">
                    <input
                      type="color"
                      name="codigo_hex"
                      value={form.codigo_hex}
                      onChange={handleChange}
                      className="color-picker"
                      style={{
                        width: 36,
                        height: 36,
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        marginRight: 8
                      }}
                    />
                    <input
                      type="text"
                      name="codigo_hex"
                      value={form.codigo_hex}
                      onChange={handleChange}
                      className="form-input"
                      style={{ width: 100 }}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select
                    name="estado"
                    value={String(form.estado)}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        estado: e.target.value === 'true'
                      }))
                    }
                    required
                    className="form-input"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
