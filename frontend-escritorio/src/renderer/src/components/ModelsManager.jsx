import React, { useEffect, useState } from 'react'
import { Plus, Edit, Eye, Filter } from 'lucide-react'
import {
  getModelos,
  createModelo,
  updateModelo,
  deleteModelo,
  getModelo
} from '../services/model-service'
import { getCategorias } from '../services/category-service'

function initialForm() {
  return {
    nombre: '',
    descripcion: '',
    dimensiones: '',
    precio: '',
    idCategoria: '',
    estado: true,
    modelo_3d: null,
    imagen: null
  }
}
const PAGE_SIZE = 10

export default function ModelsManager() {
  const [viewerUrl, setViewerUrl] = useState(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [modelos, setModelos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm())
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    nombre: '',
    categoria: '',
    estado: 'todos'
  })

  const modelosFiltrados = modelos.filter((modelo) => {
    const matchNombre = modelo.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
    const matchCategoria =
      filters.categoria === '' || modelo.idCategoria?.toString() === filters.categoria
    const matchEstado =
      filters.estado === 'todos' ||
      (filters.estado === 'activo' && modelo.estado) ||
      (filters.estado === 'inactivo' && !modelo.estado)
    return matchNombre && matchCategoria && matchEstado
  })

  const totalPages = Math.ceil(modelosFiltrados.length / PAGE_SIZE)
  const modelosPagina = modelosFiltrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    fetchModelos()
    fetchCategorias()
  }, [])

  async function fetchModelos() {
    setLoading(true)
    try {
      const data = await getModelos()
      setModelos(Array.isArray(data) ? data : [])
    } catch {
      setModelos([])
    }
    setLoading(false)
  }

  async function fetchCategorias() {
    try {
      const data = await getCategorias()
      setCategorias(Array.isArray(data) ? data : [])
    } catch {
      setCategorias([])
    }
  }

  function handleOpenCreate() {
    setEditing(null)
    setForm(initialForm())
    setFormErrors({})
    setShowModal(true)
  }

  function handleOpenEdit(modelo) {
    setEditing(modelo.idModelo)
    setForm({
      nombre: modelo.nombre,
      descripcion: modelo.descripcion,
      dimensiones: modelo.dimensiones,
      precio: modelo.precio,
      idCategoria: modelo.idCategoria,
      estado: modelo.estado ?? true,
      modelo_3d: null,
      imagen: null
    })
    setFormErrors({})
    setShowModal(true)
  }

  function handleChange(e) {
    const { name, value, type, checked, files } = e.target
    const val = type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    setForm((prev) => ({ ...prev, [name]: val }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  function handleFilterChange(e) {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  function clearFilters() {
    setFilters({
      nombre: '',
      categoria: '',
      estado: 'todos'
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    // Validación simple
    const errors = {}
    if (!form.nombre.trim()) errors.nombre = 'El nombre es requerido'
    if (!form.precio) errors.precio = 'El precio es requerido'
    if (form.precio && form.precio <= 0) errors.precio = 'El precio debe ser mayor a 0'
    if (!editing && !form.modelo_3d) errors.modelo_3d = 'El modelo 3D es requerido'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    const token = localStorage.getItem('token')
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (editing && (key === 'modelo_3d' || key === 'imagen') && !value) return
      if (value !== null && value !== undefined) {
        formData.append(key, key === 'estado' ? (value ? '1' : '0') : value)
      }
    })

    try {
      if (editing) {
        await updateModelo(editing, formData, token)
      } else {
        await createModelo(formData, token)
      }
      setShowModal(false)
      fetchModelos()
    } catch (error) {
      alert(error.message || 'Ocurrió un error al guardar el modelo')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(idModelo) {
    if (window.confirm('¿Eliminar este modelo?')) {
      setLoading(true)
      const token = localStorage.getItem('token')
      try {
        await deleteModelo(idModelo, token)
        fetchModelos()
      } catch (error) {
        alert(error.message || 'Error al eliminar modelo')
      }
      setLoading(false)
    }
  }

  async function handleView3D(idModelo) {
    setLoading(true)
    try {
      const data = await getModelo(idModelo)
      setViewerUrl(data.modelo_url)
      setViewerOpen(true)
    } catch {
      alert('No se pudo obtener el modelo 3D.')
    }
    setLoading(false)
  }

  // Estilos base para inputs y selects
  const inputBaseClasses =
    'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
  const formInputClasses = (fieldName) =>
    `${inputBaseClasses} ${formErrors[fieldName] ? 'border-red-500' : 'border-gray-300'}`

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
            Gestión de Modelos 3D
          </h1>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus size={20} />
            <span>Nuevo Modelo</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
            <Filter size={20} />
            <span>Filtros</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label
                htmlFor="nombreFilter"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Buscar por nombre
              </label>
              <input
                id="nombreFilter"
                type="text"
                name="nombre"
                value={filters.nombre}
                onChange={handleFilterChange}
                placeholder="Escribir nombre..."
                className={inputBaseClasses}
              />
            </div>
            <div>
              <label
                htmlFor="estadoFilter"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Estado
              </label>
              <select
                id="estadoFilter"
                name="estado"
                value={filters.estado}
                onChange={handleFilterChange}
                className={inputBaseClasses}
              >
                <option value="todos">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="categoriaFilter"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Categoría
              </label>
              <select
                id="categoriaFilter"
                name="categoria"
                value={filters.categoria}
                onChange={handleFilterChange}
                className={inputBaseClasses}
              >
                <option value="">Todas</option>
                {categorias.map((cat) => (
                  <option key={cat.idCategoria} value={cat.idCategoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 text-sm text-gray-600 border-b border-gray-200">
            Mostrando <strong>{modelosFiltrados.length}</strong> de{' '}
            <strong>{modelos.length}</strong> modelos
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Cargando modelos...</div>
          ) : modelosFiltrados.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500">
                No se encontraron modelos que coincidan con los filtros aplicados.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-xs text-gray-800 uppercase bg-gray-100">
                    <tr>
                      <th className="px-6 py-3">Imagen</th>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Descripción</th>
                      <th className="px-6 py-3">Dimensiones</th>
                      <th className="px-6 py-3">Categoría</th>
                      <th className="px-6 py-3">Precio</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelosPagina.map((modelo) => (
                      <tr
                        key={modelo.idModelo}
                        className="bg-white border-b hover:bg-gray-50 align-middle"
                      >
                        <td className="px-6 py-4">
                          <img
                            src={modelo.imagen_url || 'https://via.placeholder.com/150'}
                            alt={modelo.nombre}
                            className="w-12 h-12 object-cover rounded-md shadow-sm"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{modelo.nombre}</td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate" title={modelo.descripcion}>
                            {modelo.descripcion || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">{modelo.dimensiones || '-'}</td>
                        <td className="px-6 py-4">{modelo.nombreCategoria || 'Sin categoría'}</td>
                        <td className="px-6 py-4 font-semibold">
                          S/ {parseFloat(modelo.precio).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                              modelo.estado
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {modelo.estado ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(modelo)}
                              title="Editar modelo"
                              className="p-2 text-gray-500 rounded-full hover:bg-yellow-100 hover:text-yellow-600 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Paginación */}
              <div className="flex justify-center items-center gap-2 py-6 bg-gray-50">
                <button
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-700">
                  Página {page} de {totalPages}
                </span>
                <button
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                  disabled={page === totalPages || totalPages === 0}
                  onClick={() => setPage(page + 1)}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal del Visor 3D */}
      {viewerOpen && viewerUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
          onClick={() => setViewerOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl p-4 w-full max-w-3xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Vista previa 3D</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setViewerOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="w-full h-96 bg-gray-200 rounded-md flex items-center justify-center">
              {/* Aquí puedes poner tu visor 3D si lo tienes */}
              <span className="text-gray-500">Render 3D aquí</span>
            </div>
            <button
              className="mt-4 self-end px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
              onClick={() => setViewerOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Formulario (Crear/Editar) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editing ? 'Editar Modelo' : 'Nuevo Modelo'}
            </h3>
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className={formInputClasses('nombre')}
                    placeholder="Nombre del modelo"
                  />
                  {formErrors.nombre && (
                    <span className="text-red-600 text-xs mt-1">{formErrors.nombre}</span>
                  )}
                </div>
                {/* Precio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                  <input
                    name="precio"
                    type="number"
                    step="0.01"
                    value={form.precio}
                    onChange={handleChange}
                    className={formInputClasses('precio')}
                    placeholder="0.00"
                  />
                  {formErrors.precio && (
                    <span className="text-red-600 text-xs mt-1">{formErrors.precio}</span>
                  )}
                </div>
                {/* Descripción */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    className={inputBaseClasses + ' border-gray-300'}
                    rows="3"
                    placeholder="Descripción detallada del modelo"
                  ></textarea>
                </div>
                {/* Dimensiones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensiones
                  </label>
                  <input
                    name="dimensiones"
                    value={form.dimensiones}
                    onChange={handleChange}
                    className={inputBaseClasses + ' border-gray-300'}
                    placeholder="ej: 10x15x20 cm"
                  />
                </div>
                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    name="idCategoria"
                    value={form.idCategoria}
                    onChange={handleChange}
                    className={inputBaseClasses + ' border-gray-300'}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.idCategoria} value={cat.idCategoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                  <select
                    name="estado"
                    value={form.estado ? '1' : '0'}
                    onChange={(e) => setForm({ ...form, estado: e.target.value === '1' })}
                    className={inputBaseClasses + ' border-gray-300'}
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </div>
                {/* Archivos (solo para creación) */}
                {!editing && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Archivo Modelo 3D (.glb) *
                      </label>
                      <input
                        name="modelo_3d"
                        type="file"
                        accept=".glb"
                        onChange={handleChange}
                        className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${
                          formErrors.modelo_3d ? 'ring-2 ring-red-500 rounded-lg' : ''
                        }`}
                      />
                      {formErrors.modelo_3d && (
                        <span className="text-red-600 text-xs mt-1">{formErrors.modelo_3d}</span>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagen de previsualización
                      </label>
                      <input
                        name="imagen"
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </>
                )}
              </div>
              {/* Acciones del formulario */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
