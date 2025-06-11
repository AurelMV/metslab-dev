import { useState } from 'react'
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react'
function ModeloFormulario({ modelo = null, onGuardar, onCancelar }) {
  const [form, setForm] = useState({
    nombre: modelo?.nombre || '',
    descripcion: modelo?.descripcion || '',
    dimensiones: modelo?.dimensiones || '',
    modelo_3d: null,
    imagen: null,
    precio: modelo?.precio || '',
    idCategoria: modelo?.idCategoria || ''
  })

  const [preview, setPreview] = useState({
    imagen: modelo?.imagen || null,
    modeloNombre: modelo?.modelo_3d || ''
  })

  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState(null)

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (files) {
      const file = files[0]
      setForm((prev) => ({ ...prev, [name]: file }))

      if (name === 'imagen') {
        setPreview((prev) => ({ ...prev, imagen: URL.createObjectURL(file) }))
      }
      if (name === 'modelo_3d') {
        setPreview((prev) => ({ ...prev, modeloNombre: file.name }))
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación básica
    const nuevosErrores = {}
    if (!form.nombre) nuevosErrores.nombre = ['El nombre es requerido']
    if (!form.precio) nuevosErrores.precio = ['El precio es requerido']
    if (!form.modelo_3d && !modelo) nuevosErrores.modelo_3d = ['El archivo 3D es requerido']

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    setErrores({})

    // Simular guardado
    const nuevoModelo = {
      id: modelo?.id || Date.now(),
      ...form,
      imagen: preview.imagen,
      modelo_3d: preview.modeloNombre,
      fechaCreacion: modelo?.fechaCreacion || new Date().toLocaleDateString()
    }

    onGuardar(nuevoModelo)
    setMensaje(modelo ? 'Modelo actualizado exitosamente' : 'Modelo registrado exitosamente')

    if (!modelo) {
      // Limpiar formulario si es nuevo
      setForm({
        nombre: '',
        descripcion: '',
        dimensiones: '',
        modelo_3d: null,
        imagen: null,
        precio: '',
        idCategoria: ''
      })
      setPreview({ imagen: null, modeloNombre: '' })
    }
  }

  return (
    <div className="form-container">
      <style jsx>{`
        .form-container {
          background-color: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .form-title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 20px;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
        }

        .close-button:hover {
          color: #374151;
        }

        .success-message {
          background-color: #dcfce7;
          border: 1px solid #86efac;
          color: #166534;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .form-row.two-columns {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
        }

        .form-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .error-text {
          color: #dc2626;
          font-size: 12px;
          margin-top: 4px;
        }

        .preview-container {
          background-color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
        }

        .preview-title {
          font-size: 18px;
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 12px;
        }

        .preview-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .preview-content {
            grid-template-columns: 1fr auto;
          }
        }

        .preview-info p {
          margin: 4px 0;
          font-size: 14px;
        }

        .preview-image {
          width: 128px;
          height: 128px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
        }

        .btn-secondary {
          background-color: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background-color: #f9fafb;
        }

        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background-color: #2563eb;
        }
      `}</style>

      <div className="form-header">
        <h2 className="form-title">{modelo ? 'Editar Modelo 3D' : 'Registrar Modelo 3D'}</h2>
        {onCancelar && (
          <button className="close-button" onClick={onCancelar}>
            ✕
          </button>
        )}
      </div>

      {mensaje && <div className="success-message">{mensaje}</div>}

      <div className="form-content">
        <div className="form-row two-columns">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del modelo"
              value={form.nombre}
              onChange={handleChange}
              className="form-input"
            />
            {errores.nombre && <p className="error-text">{errores.nombre[0]}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Precio</label>
            <input
              type="number"
              name="precio"
              placeholder="Precio en S/."
              value={form.precio}
              onChange={handleChange}
              className="form-input"
            />
            {errores.precio && <p className="error-text">{errores.precio[0]}</p>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            name="descripcion"
            placeholder="Descripción del modelo"
            value={form.descripcion}
            onChange={handleChange}
            className="form-input form-textarea"
          />
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label className="form-label">Dimensiones</label>
            <input
              type="text"
              name="dimensiones"
              placeholder="Ej: 10cm x 15cm x 8cm"
              value={form.dimensiones}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">ID Categoría</label>
            <input
              type="text"
              name="idCategoria"
              placeholder="ID de categoría"
              value={form.idCategoria}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row two-columns">
          <div className="form-group">
            <label className="form-label">Archivo 3D (.obj)</label>
            <input
              type="file"
              name="modelo_3d"
              accept=".obj"
              onChange={handleChange}
              className="form-input"
            />
            {errores.modelo_3d && <p className="error-text">{errores.modelo_3d[0]}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Imagen (opcional)</label>
            <input
              type="file"
              name="imagen"
              accept="image/*"
              onChange={handleChange}
              className="form-input"
            />
            {errores.imagen && <p className="error-text">{errores.imagen[0]}</p>}
          </div>
        </div>

        <div className="preview-container">
          <h3 className="preview-title">Vista previa:</h3>
          <div className="preview-content">
            <div className="preview-info">
              <p>
                <strong>Nombre:</strong> {form.nombre || 'Sin nombre'}
              </p>
              <p>
                <strong>Precio:</strong> S/. {form.precio || '0.00'}
              </p>
              <p>
                <strong>Modelo:</strong> {preview.modeloNombre || 'No seleccionado'}
              </p>
              <p>
                <strong>Dimensiones:</strong> {form.dimensiones || 'No especificado'}
              </p>
            </div>
            <div>
              {preview.imagen && (
                <img src={preview.imagen} alt="Vista previa" className="preview-image" />
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          {onCancelar && (
            <button type="button" onClick={onCancelar} className="btn btn-secondary">
              Cancelar
            </button>
          )}
          <button type="button" onClick={handleSubmit} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            {modelo ? 'Actualizar modelo' : 'Guardar modelo'}
          </button>
        </div>
      </div>
    </div>
  )
}
export default ModeloFormulario
