import React, { useState } from 'react'
import { X, Upload, Image, FileText } from 'lucide-react'
import { createModelo, updateModelo } from '../../services/model-service'

const ModelForm = ({ model, onSubmit, onCancel, categories, token }) => {
  const [formData, setFormData] = useState({
    nombre: model?.nombre || '',
    descripcion: model?.descripcion || '',
    precio: model?.precio || 0,
    dimensiones: model?.dimensiones || '',
    idCategoria: model?.idCategoria || '',
    imagen: null,
    modelo_3d: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData({ ...formData, [name]: files[0] })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('nombre', formData.nombre)
      fd.append('descripcion', formData.descripcion)
      fd.append('precio', formData.precio)
      fd.append('dimensiones', formData.dimensiones)
      fd.append('idCategoria', formData.idCategoria)
      if (formData.imagen) fd.append('imagen', formData.imagen)
      if (formData.modelo_3d) fd.append('modelo_3d', formData.modelo_3d)

      let result
      if (model && model.idModelo) {
        result = await updateModelo(model.idModelo, fd, token)
      } else {
        result = await createModelo(fd, token)
      }
      if (onSubmit) onSubmit(result)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
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
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Precio</label>
              <input
                type="number"
                name="precio"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Dimensiones</label>
              <input
                type="text"
                name="dimensiones"
                value={formData.dimensiones}
                onChange={handleChange}
                placeholder="ej: 15x10x8 cm"
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Categoría</label>
              <select
                name="idCategoria"
                value={formData.idCategoria}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories &&
                  categories.map((cat) => (
                    <option key={cat.idCategoria} value={cat.idCategoria}>
                      {cat.nombre}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              className="form-textarea"
              required
            />
          </div>

          <div className="form-grid">
            <div>
              <label className="form-label">Imagen del Modelo</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  name="imagen"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-upload-input"
                />
                {formData.imagen && (
                  <div className="file-upload-text-success">
                    <Image className="file-upload-text-success-icon" />
                    <span className="file-upload-text-success-filename">
                      {formData.imagen.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Archivo OBJ</label>
              <div className="file-upload-container">
                <input
                  type="file"
                  name="modelo_3d"
                  accept=".glb"
                  onChange={handleFileChange}
                  className="file-upload-input"
                />
                {formData.modelo_3d && (
                  <div className="file-upload-text-success">
                    <FileText className="file-upload-text-success-icon" />
                    <span className="file-upload-text-success-filename">
                      {formData.modelo_3d.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <div className="text-error">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-button" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Guardando...' : model ? 'Actualizar' : 'Crear'} Modelo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModelForm
