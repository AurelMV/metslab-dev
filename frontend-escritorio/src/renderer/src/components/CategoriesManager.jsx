import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from '../services/category-service'

const CategoriesManager = () => {
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar categorías al montar
  useEffect(() => {
    setLoading(true)
    getCategorias()
      .then((data) => {
        // Si la respuesta es un array de objetos con 'nombre', mapea a {id, name}
        setCategories(
          Array.isArray(data)
            ? data.map((cat) => ({ id: cat.idCategoria, name: cat.nombre || cat.name }))
            : []
        )
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const getToken = () => localStorage.getItem('token')

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await createCategoria(newCategoryName.trim(), token)
      // res.categoria contiene la nueva categoría
      setCategories([...categories, { id: res.categoria.idCategoria, name: res.categoria.nombre }])
      setNewCategoryName('')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleEditCategory = (category) => {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const handleSaveEdit = async () => {
    if (!editingName.trim() || !editingId) return
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      const res = await updateCategoria(editingId, editingName.trim(), token)
      setCategories(
        categories.map((cat) =>
          cat.id === editingId ? { ...cat, name: res.categoria.nombre } : cat
        )
      )
      console.log(res)
      setEditingId(null)
      setEditingName('')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      await deleteCategoria(id, token)
      setCategories(categories.filter((cat) => cat.id !== id))
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="categories-manager-container">
      <div className="categories-manager-card">
        <h2 className="categories-manager-title">Gestión de Categorías</h2>

        {/* Formulario para crear nueva categoría */}
        <div className="new-category-section">
          <h3 className="new-category-title">Crear Nueva Categoría</h3>
          <form onSubmit={handleAddCategory} className="new-category-form">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nombre de la categoría"
              className="new-category-input"
              required
              disabled={loading}
            />
            <button type="submit" className="add-category-button" disabled={loading}>
              <Plus className="add-category-icon" />
              <span>Agregar</span>
            </button>
          </form>
        </div>

        {/* Mensaje de error */}
        {error && <div className="category-error">{error}</div>}

        {/* Lista de categorías */}
        <div>
          <h3 className="existing-categories-section-title">Categorías Existentes</h3>
          {loading ? (
            <div>Cargando...</div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <div key={category.id} className="category-item">
                  {editingId === category.id ? (
                    <div className="category-item-edit-mode">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="edit-category-input"
                        autoFocus
                        disabled={loading}
                      />
                      <div className="edit-actions">
                        <button
                          onClick={handleSaveEdit}
                          className="save-edit-button"
                          disabled={loading}
                        >
                          <Save className="edit-action-icon" />
                          <span>Guardar</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="cancel-edit-button"
                          disabled={loading}
                        >
                          <X className="edit-action-icon" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="category-item-display-mode">
                      <span className="category-name">{category.name}</span>
                      <div className="category-actions">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="action-button edit-button"
                          title="Editar"
                          disabled={loading}
                        >
                          <Edit className="action-icon" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="action-button delete-button"
                          title="Eliminar"
                          disabled={loading}
                        >
                          <Trash2 className="action-icon" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CategoriesManager
