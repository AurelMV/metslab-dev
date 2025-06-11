import React, { useState, useEffect } from 'react'
import './CreaCateStyle.css' // Asegúrate de que la ruta sea correcta

const CategoriasManager = () => {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    id: '',
    nombre: ''
  })
  const [isEditing, setIsEditing] = useState(false)

  // Simular carga inicial de categorías
  useEffect(() => {
    // Simulamos un retraso para la "carga"
    setLoading(true)
    setTimeout(() => {
      // Datos de ejemplo para el frontend
      setCategorias([
        { id: 1, nombre: 'Electrónica' },
        { id: 2, nombre: 'Libros' },
        { id: 3, nombre: 'Ropa' }
      ])
      setLoading(false)
    }, 500) // 0.5 segundos de retraso
  }, [])

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Crear o actualizar categoría (simulado)
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      setError('El nombre de la categoría es requerido')
      return
    }

    setLoading(true)
    setError('')

    // Simulamos un retraso para la operación
    setTimeout(() => {
      let message = ''
      if (isEditing) {
        // Lógica de actualización simulada
        setCategorias((prevCategorias) =>
          prevCategorias.map((cat) =>
            cat.id === formData.id ? { ...cat, nombre: formData.nombre } : cat
          )
        )
        message = 'Categoría actualizada con éxito!'
      } else {
        // Lógica de creación simulada
        const newId = Math.max(0, ...categorias.map((cat) => cat.id)) + 1 // Genera un nuevo ID
        setCategorias((prevCategorias) => [
          ...prevCategorias,
          { id: newId, nombre: formData.nombre }
        ])
        message = 'Categoría creada con éxito!'
      }

      setSuccess(message)
      setFormData({ id: '', nombre: '' }) // Limpiar formulario
      setIsEditing(false) // Salir del modo edición
      setLoading(false)

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(''), 3000)
    }, 500)
  }

  // Preparar formulario para edición
  const handleEdit = (categoria) => {
    setFormData({
      id: categoria.id,
      nombre: categoria.nombre
    })
    setIsEditing(true)
    setError('')
    setSuccess('')
  }

  // Eliminar categoría (simulado)
  const handleDelete = (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      return
    }

    setLoading(true)
    // Simulamos un retraso para la eliminación
    setTimeout(() => {
      setCategorias((prevCategorias) => prevCategorias.filter((cat) => cat.id !== id))
      setSuccess('Categoría eliminada con éxito!')
      setLoading(false)
      setTimeout(() => setSuccess(''), 3000)
    }, 500)
  }

  // Cancelar edición
  const handleCancel = () => {
    setFormData({ id: '', nombre: '' })
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  return (
    <div className="categorias-container">
      <div className="categorias-header">
        <h1>Gestión de Categorías</h1>
      </div>

      {/* Mensajes de error y éxito */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Formulario */}
      <div className="form-container">
        <h2>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
        <div className="categoria-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la Categoría:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre de la categoría"
              className="form-input"
              disabled={loading}
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Procesando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="categorias-list">
        <h2>Lista de Categorías</h2>
        {loading && <div className="loading">Cargando...</div>}

        {categorias.length === 0 && !loading ? (
          <div className="empty-state">No hay categorías registradas</div>
        ) : (
          <div className="categorias-grid">
            {categorias.map((categoria) => (
              <div key={categoria.id} className="categoria-card">
                <div className="categoria-info">
                  <h3>{categoria.nombre}</h3>
                  <span className="categoria-id">ID: {categoria.id}</span>
                </div>
                <div className="categoria-actions">
                  <button
                    onClick={() => handleEdit(categoria)}
                    className="btn btn-edit"
                    disabled={loading}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(categoria.id)}
                    className="btn btn-delete"
                    disabled={loading}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoriasManager
