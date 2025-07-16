import React, { useState, useEffect } from 'react'
import {
  obtenerPedidos,
  obtenerDetallePedido,
  actualizarEstadoPedido,
  actualizarEstadosLote,
  obtenerEstadosDisponibles,
  formatearFecha,
  formatearMoneda,
  obtenerColorEstado
} from '../services/pedidos-admin-service'
import {
  Package,
  User,
  Eye,
  X,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Mail,
  FileText,
  Truck,
  Clock,
  CheckSquare,
  Square,
  Edit,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  Info,
  RefreshCw
} from 'lucide-react'

const OrdersManager = () => {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPedidos, setSelectedPedidos] = useState([])
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [batchNewState, setBatchNewState] = useState('')
  const [batchNotes, setBatchNotes] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPedidoDetails, setSelectedPedidoDetails] = useState(null)
  const [filtros, setFiltros] = useState({
    estado: '',
    tipo_entrega: '',
    fecha_desde: '',
    fecha_hasta: '',
    busqueda: ''
  })
  const [paginacion, setPaginacion] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [estadosDisponibles, setEstadosDisponibles] = useState([])

  // Cargar pedidos
  const cargarPedidos = async () => {
    setLoading(true)
    try {
      const data = await obtenerPedidos(filtros, paginacion.page, paginacion.limit)
      setPedidos(data.data || [])
      setPaginacion((prev) => ({
        ...prev,
        total: data.pagination?.total_items || 0,
        totalPages: data.pagination?.total_pages || 0
      }))
    } catch (err) {
      setError(err.message)
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar estados disponibles
  const cargarEstados = async () => {
    try {
      const data = await obtenerEstadosDisponibles()
      setEstadosDisponibles(data.data || [])
    } catch (err) {
      setEstadosDisponibles([])
    }
  }

  useEffect(() => {
    cargarPedidos()
    cargarEstados()
    // eslint-disable-next-line
  }, [paginacion.page, filtros])

  // Selección múltiple
  const togglePedidoSelection = (pedidoId) => {
    setSelectedPedidos((prev) =>
      prev.includes(pedidoId) ? prev.filter((id) => id !== pedidoId) : [...prev, pedidoId]
    )
  }
  const selectAllPedidos = () => {
    if (selectedPedidos.length === pedidos.length) {
      setSelectedPedidos([])
    } else {
      setSelectedPedidos(pedidos.map((p) => p.id))
    }
  }

  // Actualizar estado individual
  const actualizarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await actualizarEstadoPedido(pedidoId, nuevoEstado)
      cargarPedidos()
    } catch (err) {
      alert(`Error al actualizar estado: ${err.message}`)
    }
  }

  // Actualizar estados por lote
  const actualizarEstadosLoteHandler = async () => {
    if (selectedPedidos.length === 0 || !batchNewState) return
    try {
      await actualizarEstadosLote(selectedPedidos, batchNewState, batchNotes)
      setSelectedPedidos([])
      setShowBatchModal(false)
      setBatchNewState('')
      setBatchNotes('')
      cargarPedidos()
    } catch (err) {
      alert(`Error al actualizar estados: ${err.message}`)
    }
  }

  // Validar selección lote
  const validarSeleccionLote = () => {
    if (selectedPedidos.length === 0)
      return { valid: false, message: 'No hay pedidos seleccionados' }
    const pedidosSeleccionados = pedidos.filter((p) => selectedPedidos.includes(p.id))
    const estadosUnicos = [...new Set(pedidosSeleccionados.map((p) => p.estado))]
    if (estadosUnicos.length > 1) {
      return {
        valid: false,
        message: `Los pedidos seleccionados tienen estados diferentes (${estadosUnicos.join(', ')}).`
      }
    }
    return { valid: true, estadoActual: estadosUnicos[0] }
  }
  const getEstadosDisponiblesParaLote = () => {
    const validacion = validarSeleccionLote()
    if (!validacion.valid) return []
    const pedidoEjemplo = pedidos.find((p) => p.estado === validacion.estadoActual)
    if (!pedidoEjemplo || !pedidoEjemplo.siguientes_estados) return []
    return pedidoEjemplo.siguientes_estados
      .filter((estado) => estado !== 'pedido_realizado')
      .map((estado) => {
        const estadoInfo = estadosDisponibles.find((e) => e.valor === estado)
        return {
          valor: estado,
          nombre: estadoInfo?.nombre || estado,
          fase: estadoInfo?.fase || 'N/A'
        }
      })
  }

  // Mostrar detalles
  const mostrarDetalles = async (pedidoId) => {
    try {
      const data = await obtenerDetallePedido(pedidoId)
      setSelectedPedidoDetails(data.data)
      setShowDetailsModal(true)
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  // Estadísticas rápidas
  const totalPedidos = paginacion.total
  const pedidosEnProceso = pedidos.filter((p) =>
    ['en_preparacion', 'en_camino', 'en_transito', 'pendiente_envio'].includes(p.estado)
  ).length
  const pedidosCompletados = pedidos.filter((p) =>
    ['entregado', 'completado'].includes(p.estado)
  ).length
  const pedidosProblemas = pedidos.filter((p) =>
    ['retrasado', 'cancelado', 'devuelto', 'perdido'].includes(p.estado)
  ).length
  const ingresosTotales = pedidos.reduce((sum, p) => {
    const total =
      typeof p.total_pago === 'string'
        ? parseFloat(p.total_pago.replace(/[^0-9.-]+/g, ''))
        : parseFloat(p.total_pago) || 0
    return sum + total
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <Package className="w-8 h-8 text-teal-600" />
        Gestión de Pedidos
      </h2>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Pedidos</h3>
              <p className="text-2xl font-bold text-blue-600">{totalPedidos}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">En Proceso</h3>
              <p className="text-2xl font-bold text-yellow-600">{pedidosEnProceso}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Completados</h3>
              <p className="text-2xl font-bold text-green-600">{pedidosCompletados}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Problemas</h3>
              <p className="text-2xl font-bold text-red-600">{pedidosProblemas}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Ingresos</h3>
              <p className="text-xl font-bold text-purple-600">S/ {ingresosTotales.toFixed(2)}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros avanzados */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por número de pedido o cliente..."
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="form-select w-full"
            >
              <option value="">Todos los estados</option>
              {estadosDisponibles.map((estado) => (
                <option key={estado.valor} value={estado.valor}>
                  {estado.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Entrega</label>
            <select
              value={filtros.tipo_entrega}
              onChange={(e) => setFiltros({ ...filtros, tipo_entrega: e.target.value })}
              className="form-select w-full"
            >
              <option value="">Todos los tipos</option>
              <option value="delivery">Delivery</option>
              <option value="pickup">Recojo en tienda</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
              className="form-input w-full"
            />
          </div>
        </div>
        <div className="flex items-end mt-4">
          {selectedPedidos.length > 0 && (
            <button
              onClick={() => setShowBatchModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Actualizar {selectedPedidos.length} pedido(s)
            </button>
          )}
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-500" />
            <span className="ml-3 text-teal-700">Cargando pedidos...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-12">
            <span className="text-red-600 mb-2">Error: {error}</span>
            <button
              onClick={() => {
                setError(null)
                cargarPedidos()
              }}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase">
                    <th className="w-12">
                      <button onClick={selectAllPedidos} className="hover:bg-gray-100 p-1 rounded">
                        {selectedPedidos.length === pedidos.length && pedidos.length > 0 ? (
                          <CheckSquare className="w-5 h-5 text-teal-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Productos</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((pedido) => (
                    <tr
                      key={pedido.id}
                      className={
                        selectedPedidos.includes(pedido.id)
                          ? 'bg-teal-50 border-l-4 border-teal-400'
                          : 'hover:bg-gray-50'
                      }
                    >
                      <td>
                        <button
                          onClick={() => togglePedidoSelection(pedido.id)}
                          className="hover:bg-gray-100 p-1 rounded"
                        >
                          {selectedPedidos.includes(pedido.id) ? (
                            <CheckSquare className="w-5 h-5 text-teal-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />#{pedido.numero_pedido}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatearFecha(pedido.fecha_pedido)}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {pedido.cliente?.nombre || 'Sin nombre'}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {pedido.cliente?.email || 'Sin email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium flex items-center gap-1">
                          <ShoppingCart className="w-4 h-4 text-gray-400" />
                          {pedido.total_productos || 0} producto(s)
                        </div>
                      </td>
                      <td className="font-medium text-gray-900">
                        <div className="text-lg font-bold">S/ {pedido.total_pago || '0.00'}</div>
                      </td>
                      <td>
                        <select
                          value={pedido.estado}
                          onChange={(e) => actualizarEstado(pedido.id, e.target.value)}
                          className="form-select bg-white border-gray-300 text-xs"
                          style={{ color: obtenerColorEstado(pedido.estado) }}
                        >
                          <option value={pedido.estado}>{pedido.estado_formateado}</option>
                          {pedido.siguientes_estados &&
                            pedido.siguientes_estados
                              .filter((estado) => estado !== pedido.estado)
                              .map((estado) => (
                                <option key={estado} value={estado}>
                                  {estadosDisponibles.find((e) => e.valor === estado)?.nombre ||
                                    estado}
                                </option>
                              ))}
                        </select>
                      </td>
                      <td>
                        <span
                          className={`badge ${pedido.tipo_entrega === 'delivery' ? 'badge-blue' : 'badge-green'}`}
                        >
                          {pedido.tipo_entrega === 'delivery' ? (
                            <>
                              <Truck className="w-4 h-4" />
                              Delivery
                            </>
                          ) : (
                            <>
                              <Package className="w-4 h-4" />
                              Recojo
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            className="action-btn hover:bg-blue-50 hover:text-blue-600"
                            title="Ver detalles del pedido"
                            onClick={() => mostrarDetalles(pedido.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Paginación */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-700">
                Mostrando {(paginacion.page - 1) * paginacion.limit + 1} a{' '}
                {Math.min(paginacion.page * paginacion.limit, paginacion.total)} de{' '}
                {paginacion.total} pedidos
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                  disabled={paginacion.page === 1}
                  onClick={() => setPaginacion((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <span className="text-sm text-gray-700">
                  Página {paginacion.page} de {paginacion.totalPages}
                </span>
                <button
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                  disabled={paginacion.page === paginacion.totalPages}
                  onClick={() => setPaginacion((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de actualización masiva */}
      {showBatchModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={() => setShowBatchModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl max-h-[90vh] flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Actualizar {selectedPedidos.length} pedido(s)
              </h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              {(() => {
                const validacion = validarSeleccionLote()
                const estadosDisponiblesLote = getEstadosDisponiblesParaLote()
                if (!validacion.valid) {
                  return (
                    <div className="mb-4 p-4 bg-red-50 rounded-lg">
                      <p className="text-red-800 text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {validacion.message}
                      </p>
                    </div>
                  )
                }
                return (
                  <>
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        Se actualizarán {selectedPedidos.length} pedido(s) con estado actual:{' '}
                        <strong>{validacion.estadoActual}</strong>
                      </p>
                    </div>
                    <div className="mb-4">
                      <label className="block font-semibold mb-1">Nuevo estado *</label>
                      <select
                        value={batchNewState}
                        onChange={(e) => setBatchNewState(e.target.value)}
                        className="form-select w-full"
                      >
                        <option value="">Seleccionar estado</option>
                        {estadosDisponiblesLote.map((estado) => (
                          <option key={estado.valor} value={estado.valor}>
                            {estado.nombre} - {estado.fase}
                          </option>
                        ))}
                      </select>
                      {estadosDisponiblesLote.length === 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          No hay estados disponibles para la transición desde el estado actual.
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block font-semibold mb-1">
                        Notas administrativas (opcional)
                      </label>
                      <textarea
                        value={batchNotes}
                        onChange={(e) => setBatchNotes(e.target.value)}
                        className="form-input w-full"
                        rows={3}
                        placeholder="Agregar notas sobre el cambio de estado..."
                      />
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-yellow-800 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <strong>Atención:</strong> Esta acción actualizará el estado de todos los
                        pedidos seleccionados.
                      </p>
                    </div>
                  </>
                )
              })()}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                onClick={() => setShowBatchModal(false)}
              >
                Cancelar
              </button>
              {(() => {
                const validacion = validarSeleccionLote()
                const estadosDisponiblesLote = getEstadosDisponiblesParaLote()
                const isDisabled =
                  !validacion.valid || !batchNewState || estadosDisponiblesLote.length === 0
                return (
                  <button
                    type="button"
                    onClick={actualizarEstadosLoteHandler}
                    disabled={isDisabled}
                    className={`px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Actualizar Estados
                  </button>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailsModal && selectedPedidoDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Detalles del Pedido #{selectedPedidoDetails.numero_pedido}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <span className="font-semibold text-gray-700">Cliente:</span>{' '}
                {selectedPedidoDetails.cliente?.nombre || 'Sin nombre'}
                <div className="text-xs text-gray-500">
                  {selectedPedidoDetails.cliente?.email || 'Sin email'}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Fecha:</span>{' '}
                {formatearFecha(selectedPedidoDetails.fecha_pedido)}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Estado:</span>{' '}
                {selectedPedidoDetails.estado_formateado}
              </div>
              <div>
                <span className="font-semibold text-gray-700">Total:</span>{' '}
                {formatearMoneda(selectedPedidoDetails.total_pago)}
              </div>
              {/* Productos del pedido */}
              <div>
                <span className="font-semibold text-gray-700">Productos:</span>
                <div className="overflow-x-auto mt-2">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-1">Producto</th>
                        <th className="px-2 py-1">Cantidad</th>
                        <th className="px-2 py-1">Precio Unit.</th>
                        <th className="px-2 py-1">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPedidoDetails.items &&
                        selectedPedidoDetails.items.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-none hover:bg-gray-50">
                            <td className="px-2 py-1">{item.modelo || 'Sin modelo'}</td>
                            <td className="px-2 py-1 text-center">{item.cantidad || 0}</td>
                            <td className="px-2 py-1 text-right">
                              {formatearMoneda(item.precio_unitario)}
                            </td>
                            <td className="px-2 py-1 text-right font-bold text-teal-700">
                              {formatearMoneda(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Notas */}
              {selectedPedidoDetails.notas && (
                <div>
                  <span className="font-semibold text-gray-700">Notas:</span>
                  <div className="bg-yellow-50 border border-yellow-200 p-2 rounded-lg mt-2 text-gray-700">
                    {selectedPedidoDetails.notas}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersManager
