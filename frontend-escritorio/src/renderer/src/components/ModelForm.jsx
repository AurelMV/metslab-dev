import React, { useState } from 'react'
import { X, Upload, Image, FileText } from 'lucide-react'

const ModelForm = ({ model, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: model?.name || '',
    details: model?.details || '',
    price: model?.price || 0,
    dimensions: model?.dimensions || '',
    category: model?.category || '',
    image: model?.image || '',
    objFile: model?.objFile || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleFileUpload = (type) => {
    // Simular carga de archivo
    const fileName = type === 'image' ? 'modelo_imagen.jpg' : 'modelo.obj'
    setFormData({
      ...formData,
      [type]: fileName
    })
  }

  return (
    <div className="modal-overlay-form">
      <div className="modal-content-form">
        <div className="modal-header-form">
          <h3 className="modal-title-form">{model ? 'Editar Modelo' : 'Nuevo Modelo'}</h3>
          <button onClick={onCancel} className="modal-close-button-form">
            <X className="modal-close-icon-form" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="model-form">
          <div className="form-grid">
            <div>
              <label className="form-label">Nombre del Modelo</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Precio</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Dimensiones</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="ej: 15x10x8 cm"
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-select"
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="Fantasía">Fantasía</option>
                <option value="Arquitectura">Arquitectura</option>
                <option value="Joyería">Joyería</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Descripción</label>
            <textarea
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={4}
              className="form-textarea"
              required
            />
          </div>

          <div className="form-grid">
            <div>
              <label className="form-label">Imagen del Modelo</label>
              <div className="file-upload-container">
                {formData.image ? (
                  <div className="file-upload-text-success">
                    <Image className="file-upload-text-success-icon" />
                    <span className="file-upload-text-success-filename">{formData.image}</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="file-upload-icon-wrapper" />
                    <button
                      type="button"
                      onClick={() => handleFileUpload('image')}
                      className="file-upload-button"
                    >
                      Subir Imagen
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Archivo OBJ</label>
              <div className="file-upload-container">
                {formData.objFile ? (
                  <div className="file-upload-text-success">
                    <FileText className="file-upload-text-success-icon" />
                    <span className="file-upload-text-success-filename">{formData.objFile}</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="file-upload-icon-wrapper" />
                    <button
                      type="button"
                      onClick={() => handleFileUpload('objFile')}
                      className="file-upload-button"
                    >
                      Subir Archivo OBJ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              {model ? 'Actualizar' : 'Crear'} Modelo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModelForm
