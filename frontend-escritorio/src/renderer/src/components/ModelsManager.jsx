import React, { useState } from 'react'
import { Plus, Edit, Eye, Trash2, Upload } from 'lucide-react'
import ModelForm from './ModelForm' // Asegúrate de que ModelForm exista

const ModelsManager = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [models, setModels] = useState([
    {
      id: 1,
      name: 'Figura de Dragón',
      details: 'Modelo detallado de dragón fantástico',
      price: 45.5,
      dimensions: '15x10x8 cm',
      category: 'Fantasía'
    },
    {
      id: 2,
      name: 'Miniatura de Casa',
      details: 'Casa arquitectónica moderna',
      price: 28.0,
      dimensions: '12x8x6 cm',
      category: 'Arquitectura'
    }
  ])

  const handleEdit = (model) => {
    setEditingModel(model)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este modelo?')) {
      setModels(models.filter((m) => m.id !== id))
    }
  }

  const handleFormSubmit = (modelData) => {
    if (editingModel) {
      setModels(models.map((m) => (m.id === editingModel.id ? { ...m, ...modelData } : m)))
    } else {
      const newModel = { ...modelData, id: Date.now() }
      setModels([...models, newModel])
    }
    setShowForm(false)
    setEditingModel(null)
  }

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

        <div className="table-overflow-auto">
          <table className="models-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Nombre</th>
                <th className="table-header-cell">Detalles</th>
                <th className="table-header-cell">Precio</th>
                <th className="table-header-cell">Dimensiones</th>
                <th className="table-header-cell">Categoría</th>
                <th className="table-header-cell">Acciones</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {models.map((model) => (
                <tr key={model.id}>
                  <td className="table-body-cell cell-name">{model.name}</td>
                  <td className="table-body-cell cell-details">{model.details}</td>
                  <td className="table-body-cell cell-price">S/.{model.price.toFixed(2)}</td>
                  <td className="table-body-cell cell-dimensions">{model.dimensions}</td>
                  <td className="table-body-cell cell-category">{model.category}</td>
                  <td className="table-body-cell">
                    <div className="action-buttons-group">
                      <button
                        onClick={() => alert('Visualizador 3D próximamente')}
                        className="action-button view"
                        title="Ver modelo 3D"
                      >
                        <Eye className="action-button-icon" />
                      </button>
                      <button
                        onClick={() => handleEdit(model)}
                        className="action-button edit"
                        title="Editar"
                      >
                        <Edit className="action-button-icon" />
                      </button>
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="action-button delete"
                        title="Eliminar"
                      >
                        <Trash2 className="action-button-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        />
      )}
    </div>
  )
}

export default ModelsManager
