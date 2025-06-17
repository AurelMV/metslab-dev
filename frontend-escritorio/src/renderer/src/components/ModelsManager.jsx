import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import ModelForm from './utils/ModelForm'
import { getModelos, deleteModelo } from '../services/model-service'
import { getCategorias } from '../services/category-service'

const ModelsManager = ({ onModelCardClick }) => {
  const [showForm, setShowForm] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [models, setModels] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([getModelos(), getCategorias()])
      .then(([modelos, categorias]) => {
        setModels(
          Array.isArray(modelos)
            ? modelos.map((m) => ({
                idModelo: m.idModelo,
                nombre: m.nombre,
                descripcion: m.descripcion,
                precio: m.precio,
                dimensiones: m.dimensiones,
                idCategoria: m.idCategoria,
                nombreCategoria: m.nombreCategoria,
                modelo_url: m.modelo_url,
                imagen_url: m.imagen_url
              }))
            : []
        )
        setCategories(
          Array.isArray(categorias)
            ? categorias.map((cat) => ({
                idCategoria: cat.idCategoria,
                nombre: cat.nombre
              }))
            : []
        )
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const token = localStorage.getItem('token')

  const handleEdit = (model) => {
    setEditingModel(model)
    setShowForm(true)
  }

  const handleDelete = async (idModelo) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este modelo?')) {
      setLoading(true)
      setError(null)
      try {
        await deleteModelo(idModelo, token)
        setModels(models.filter((m) => m.idModelo !== idModelo))
      } catch (err) {
        setError(err.message)
      }
      setLoading(false)
    }
  }

  const handleFormSubmit = (result) => {
    // Si es edición, actualiza el modelo en la lista
    if (editingModel && editingModel.idModelo) {
      setModels(
        models.map((m) => (m.idModelo === editingModel.idModelo ? { ...m, ...result.data } : m))
      )
    } else {
      // Si es nuevo, agrega el modelo a la lista
      setModels([...models, result.data])
    }
    setShowForm(false)
    setEditingModel(null)
  }

  // Mostrar solo los primeros 12 modelos (3 filas x 4 columnas)
  const displayedModels = models.slice(0, 12)

  return (
    <div className="models-manager-container">
      <div className="models-manager-card">
        <div className="models-manager-header">
          <div className="models-manager-header-content">
            <h2 className="models-manager-title">Gestión de Modelos 3D</h2>
            <button onClick={() => setShowForm(true)} className="new-model-button">
              <Plus className="new-model-button-icon" />
              <span>Nuevo Modelo</span>
            </button>
          </div>
        </div>

        {error && <div className="models-error">{error}</div>}

        <div className="models-grid">
          {displayedModels.map((model) => (
            <div
              key={model.idModelo}
              className="model-card"
              onClick={(e) => {
                if (e.target.closest('.model-card-actions')) return
                if (onModelCardClick) {
                  onModelCardClick(model)
                } else {
                  alert('Visualizador 3D próximamente')
                }
              }}
              tabIndex={0}
              role="button"
            >
              <div className="model-card-image-wrapper">
                {model.imagen_url ? (
                  <img src={model.imagen_url} alt={model.nombre} className="model-card-image" />
                ) : (
                  <div className="model-card-image-placeholder">Sin imagen</div>
                )}
              </div>
              <div className="model-card-content">
                <h3 className="model-card-title">{model.nombre}</h3>
                <div className="model-card-info">
                  <span className="model-card-price">S/.{Number(model.precio).toFixed(2)}</span>
                </div>
                <div className="model-card-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(model)
                    }}
                    className="action-button edit"
                    title="Editar"
                  >
                    <Edit className="action-button-icon" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(model.idModelo)
                    }}
                    className="action-button delete"
                    title="Eliminar"
                    disabled={loading}
                  >
                    <Trash2 className="action-button-icon" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <ModelForm
          model={editingModel}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingModel(null)
          }}
          categories={categories}
          token={token}
        />
      )}
    </div>
  )
}

export default ModelsManager
