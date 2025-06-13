import React, { useState } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

const CategoriesManager = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Fantasía' },
    { id: 2, name: 'Arquitectura' },
    { id: 3, name: 'Joyería' },
    { id: 4, name: 'Industrial' }
  ])

  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (newCategoryName.trim()) {
      const newCategory = {
        id: Date.now(),
        name: newCategoryName.trim()
      }
      setCategories([...categories, newCategory])
      setNewCategoryName('')
    }
  }

  const handleEditCategory = (category) => {
    setEditingId(category.id)
    setEditingName(category.name)
  }

  const handleSaveEdit = () => {
    if (editingName.trim() && editingId) {
      setCategories(
        categories.map((cat) => (cat.id === editingId ? { ...cat, name: editingName.trim() } : cat))
      )
      setEditingId(null)
      setEditingName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleDeleteCategory = (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      setCategories(categories.filter((cat) => cat.id !== id))
    }
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
            />
            <button type="submit" className="add-category-button">
              <Plus className="add-category-icon" />
              <span>Agregar</span>
            </button>
          </form>
        </div>

        {/* Lista de categorías */}
        <div>
          <h3 className="existing-categories-section-title">Categorías Existentes</h3>
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
                    />
                    <div className="edit-actions">
                      <button onClick={handleSaveEdit} className="save-edit-button">
                        <Save className="edit-action-icon" />
                        <span>Guardar</span>
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-edit-button">
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
                      >
                        <Edit className="action-icon" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="action-button delete-button"
                        title="Eliminar"
                      >
                        <Trash2 className="action-icon" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoriesManager
