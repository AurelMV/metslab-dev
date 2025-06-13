import React, { useState } from 'react'
import { Eye, Package, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'

const OrdersManager = () => {
  const [activeTab, setActiveTab] = useState('active')
  const [currentPageActive, setCurrentPageActive] = useState(1)
  const [currentPageCompleted, setCurrentPageCompleted] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orders, setOrders] = useState([
    {
      id: 1,
      model: 'Figura de Dragón',
      quantity: 2,
      color: 'Rojo',
      material: 'PLA',
      unitPrice: 45.5,
      total: 91.0,
      status: 'Pendiente',
      customerName: 'Juan Pérez',
      customerEmail: 'juan@ejemplo.com',
      date: '2024-01-20',
      specifications: 'Dragón fantástico con detalles en escamas, alas extendidas'
    },
    {
      id: 2,
      model: 'Miniatura de Casa',
      quantity: 1,
      color: 'Turquesa',
      material: 'Resina',
      unitPrice: 28.0,
      total: 28.0,
      status: 'Imprimiendo',
      customerName: 'María García',
      customerEmail: 'maria@ejemplo.com',
      date: '2024-01-19',
      specifications: 'Casa moderna con ventanas detalladas y puerta principal'
    },
    {
      id: 3,
      model: 'Prototipo Industrial',
      quantity: 5,
      color: 'Azul',
      material: 'PLA',
      unitPrice: 120.75,
      total: 603.75,
      status: 'Completado',
      customerName: 'Carlos López',
      customerEmail: 'carlos@ejemplo.com',
      date: '2024-01-18',
      specifications: 'Pieza industrial con tolerancias precisas, acabado liso'
    },
    {
      id: 4,
      model: 'Joyería Personalizada',
      quantity: 3,
      color: 'Verde',
      material: 'Resina',
      unitPrice: 85.25,
      total: 255.75,
      status: 'Enviado',
      customerName: 'Ana Martínez',
      customerEmail: 'ana@ejemplo.com',
      date: '2024-01-17',
      specifications: 'Anillo personalizado con grabado, alta resolución'
    },
    {
      id: 5,
      model: 'Miniatura Robot',
      quantity: 1,
      color: 'Plateado',
      material: 'PLA',
      unitPrice: 35.5,
      total: 35.5,
      status: 'Pendiente',
      customerName: 'Luis Rodríguez',
      customerEmail: 'luis@ejemplo.com',
      date: '2024-01-21',
      specifications: 'Robot articulado con detalles mecánicos'
    },
    {
      id: 6,
      model: 'Vaso Personalizado',
      quantity: 3,
      color: 'Azul',
      material: 'PLA',
      unitPrice: 15.0,
      total: 45.0,
      status: 'Imprimiendo',
      customerName: 'Carmen Flores',
      customerEmail: 'carmen@ejemplo.com',
      date: '2024-01-22',
      specifications: 'Vaso con logo personalizado y textura antideslizante'
    },
    {
      id: 7,
      model: 'Llavero 3D',
      quantity: 10,
      color: 'Multicolor',
      material: 'PLA',
      unitPrice: 8.5,
      total: 85.0,
      status: 'Completado',
      customerName: 'Pedro Morales',
      customerEmail: 'pedro@ejemplo.com',
      date: '2024-01-12',
      specifications: 'Llaveros con nombres personalizados en relieve'
    },
    {
      id: 8,
      model: 'Escultura Artística',
      quantity: 1,
      color: 'Blanco',
      material: 'Resina',
      unitPrice: 150.0,
      total: 150.0,
      status: 'Enviado',
      customerName: 'Sofia Herrera',
      customerEmail: 'sofia@ejemplo.com',
      date: '2024-01-16',
      specifications: 'Escultura abstracta con acabado mate y base incluida'
    }
  ])

  const ITEMS_PER_PAGE = 5

  const activeOrders = orders.filter((order) => ['Pendiente', 'Imprimiendo'].includes(order.status))

  const completedOrders = orders.filter((order) => ['Completado', 'Enviado'].includes(order.status))

  const getPaginatedData = (data, currentPage) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / ITEMS_PER_PAGE)
  }

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(
      orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente':
        return 'status-pending'
      case 'Imprimiendo':
        return 'status-printing'
      case 'Completado':
        return 'status-completed'
      case 'Enviado':
        return 'status-shipped'
      default:
        return 'status-default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pendiente':
        return <Clock className="tab-icon" />
      case 'Imprimiendo':
        return <Package className="tab-icon" />
      case 'Completado':
        return <CheckCircle className="tab-icon" />
      case 'Enviado':
        return <XCircle className="tab-icon" />
      default:
        return <Clock className="tab-icon" />
    }
  }

  const renderPagination = (currentPage, totalPages, onPageChange) => {
    if (totalPages <= 1) return null

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          <span>
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
            {Math.min(
              currentPage * ITEMS_PER_PAGE,
              activeTab === 'active' ? activeOrders.length : completedOrders.length
            )}{' '}
            de {activeTab === 'active' ? activeOrders.length : completedOrders.length} resultados
          </span>
        </div>
        <div className="pagination-controls">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <ChevronLeft className="pagination-button-icon" />
            Anterior
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`pagination-page-button ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Siguiente
            <ChevronRight className="pagination-button-icon-right" />
          </button>
        </div>
      </div>
    )
  }

  const renderOrdersTable = (ordersData, currentPage, onPageChange) => {
    const paginatedOrders = getPaginatedData(ordersData, currentPage)
    const totalPages = getTotalPages(ordersData.length)

    return (
      <div className="table-container">
        <div className="table-overflow-auto">
          <table className="orders-table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Modelo</th>
                <th className="table-header-cell">Cliente</th>
                <th className="table-header-cell">Cantidad</th>
                <th className="table-header-cell">Total</th>
                <th className="table-header-cell">Estado</th>
                <th className="table-header-cell">Acciones</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td className="table-body-cell">
                    <div className="cell-model-info">
                      <div className="cell-model-name">{order.model}</div>
                      <div className="cell-model-details">
                        {order.color} - {order.material}
                      </div>
                    </div>
                  </td>
                  <td className="table-body-cell">
                    <div className="cell-customer-info">
                      <div className="cell-customer-name">{order.customerName}</div>
                      <div className="cell-customer-email">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td className="cell-quantity">{order.quantity}</td>
                  <td className="cell-total">S/.{order.total.toFixed(2)}</td>
                  <td className="table-body-cell">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`status-select ${getStatusColor(order.status)}`}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Imprimiendo">Imprimiendo</option>
                      <option value="Completado">Completado</option>
                      <option value="Enviado">Enviado</option>
                    </select>
                  </td>
                  <td className="table-body-cell">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="action-button"
                      title="Ver detalles"
                    >
                      <Eye className="action-button-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination(currentPage, totalPages, onPageChange)}
      </div>
    )
  }

  return (
    <div className="orders-manager-container">
      <h2 className="orders-manager-title">Gestión de Pedidos</h2>

      {/* Pestañas */}
      <div className="tabs-container">
        <div className="tabs-border">
          <nav className="tabs-nav">
            <button
              onClick={() => setActiveTab('active')}
              className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            >
              <div className="tab-button-content">
                <Package className="tab-icon" />
                <span>Pedidos Activos ({activeOrders.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
            >
              <div className="tab-button-content">
                <CheckCircle className="tab-icon" />
                <span>Pedidos Completados ({completedOrders.length})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'active'
        ? renderOrdersTable(activeOrders, currentPageActive, setCurrentPageActive)
        : renderOrdersTable(completedOrders, currentPageCompleted, setCurrentPageCompleted)}

      {/* Modal de detalles del pedido */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Detalles del Pedido #{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} className="modal-close-button">
                <XCircle className="modal-close-icon" />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                <div>
                  <label className="modal-label">Cliente</label>
                  <p className="modal-text-strong">{selectedOrder.customerName}</p>
                  <p className="modal-text-muted">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <label className="modal-label">Fecha</label>
                  <p className="modal-text-strong">{selectedOrder.date}</p>
                </div>
              </div>

              <div>
                <label className="modal-label">Estado del Pedido</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    handleStatusChange(selectedOrder.id, e.target.value)
                    setSelectedOrder({ ...selectedOrder, status: e.target.value })
                  }}
                  className="modal-select"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Imprimiendo">Imprimiendo</option>
                  <option value="Completado">Completado</option>
                  <option value="Enviado">Enviado</option>
                </select>
              </div>

              <div>
                <label className="modal-label">Especificaciones del Modelo</label>
                <div className="modal-specifications-container">
                  <h4 className="modal-specifications-title">{selectedOrder.model}</h4>
                  <p className="modal-specifications-text">{selectedOrder.specifications}</p>
                  <div className="modal-details-container">
                    <span className="modal-details-label">Detalles: </span>
                    {selectedOrder.quantity} unidades, Color: {selectedOrder.color}, Material:{' '}
                    {selectedOrder.material}
                  </div>
                </div>
              </div>

              <div className="modal-total-section">
                <span className="modal-total-label">Total del Pedido:</span>
                <span className="modal-total-amount">S/.{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersManager
