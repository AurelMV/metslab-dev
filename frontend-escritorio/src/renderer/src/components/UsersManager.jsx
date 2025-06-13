import React, { useState } from 'react'
import { Eye, Mail, Phone, ShoppingBag } from 'lucide-react'

const UsersManager = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [users] = useState([
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      phone: '+51 123-456-789',
      orders: [
        {
          id: 1,
          modelName: 'Figura de Dragón',
          quantity: 2,
          price: 91.0,
          date: '2024-01-20',
          status: 'Pendiente'
        },
        {
          id: 5,
          modelName: 'Miniatura Robot',
          quantity: 1,
          price: 35.5,
          date: '2024-01-15',
          status: 'Completado'
        }
      ]
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@ejemplo.com',
      phone: '+51 987-654-321',
      orders: [
        {
          id: 2,
          modelName: 'Miniatura de Casa',
          quantity: 1,
          price: 28.0,
          date: '2024-01-19',
          status: 'Imprimiendo'
        },
        {
          id: 6,
          modelName: 'Vaso Personalizado',
          quantity: 3,
          price: 45.0,
          date: '2024-01-10',
          status: 'Enviado'
        }
      ]
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos@ejemplo.com',
      phone: '+51 555-123-456',
      orders: [
        {
          id: 3,
          modelName: 'Prototipo Industrial',
          quantity: 5,
          price: 603.75,
          date: '2024-01-18',
          status: 'Completado'
        }
      ]
    },
    {
      id: 4,
      name: 'Ana Martínez',
      email: 'ana@ejemplo.com',
      phone: '+51 777-888-999',
      orders: [
        {
          id: 4,
          modelName: 'Joyería Personalizada',
          quantity: 3,
          price: 255.75,
          date: '2024-01-17',
          status: 'Enviado'
        },
        {
          id: 7,
          modelName: 'Llavero 3D',
          quantity: 10,
          price: 85.0,
          date: '2024-01-12',
          status: 'Completado'
        }
      ]
    },
    {
      id: 5,
      name: 'Roberto Silva',
      email: 'roberto@ejemplo.com',
      phone: '+51 444-555-666',
      orders: [
        {
          id: 8,
          modelName: 'Escultura Artística',
          quantity: 1,
          price: 150.0,
          date: '2024-01-16',
          status: 'Completado'
        }
      ]
    }
  ])

  const getTotalSpent = (orders) => {
    return orders.reduce((total, order) => total + order.price, 0)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente':
        return 'status-pendiente'
      case 'Imprimiendo':
        return 'status-imprimiendo'
      case 'Completado':
        return 'status-completado'
      case 'Enviado':
        return 'status-enviado'
      default:
        return 'status-default'
    }
  }

  return (
    <div className="users-manager-container">
      <div className="users-manager-card">
        <div className="users-manager-header">
          <h2 className="users-manager-title">Gestión de Usuarios</h2>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead className="users-table-header">
              <tr>
                <th className="users-table-header th">Usuario</th>
                <th className="users-table-header th">Email</th>
                <th className="users-table-header th">Teléfono</th>
                <th className="users-table-header th">Pedidos</th>
                <th className="users-table-header th">Total Gastado</th>
                <th className="users-table-header th">Acciones</th>
              </tr>
            </thead>
            <tbody className="users-table-body">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="users-table-data">
                    <div className="user-info-cell">
                      <div className="user-avatar-wrapper">
                        <div className="user-avatar">
                          <span className="user-avatar-initials">
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                      </div>
                      <div className="user-name-wrapper">
                        <div className="user-name">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="users-table-data">
                    <div className="contact-info">
                      <Mail className="contact-icon" />
                      {user.email}
                    </div>
                  </td>
                  <td className="users-table-data">
                    <div className="contact-info">
                      <Phone className="contact-icon" />
                      {user.phone}
                    </div>
                  </td>
                  <td className="users-table-data users-table-data-medium">
                    {user.orders.length} pedidos
                  </td>
                  <td className="users-table-data users-table-data-medium">
                    S/.{getTotalSpent(user.orders).toFixed(2)}
                  </td>
                  <td className="users-table-data">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="view-orders-button"
                      title="Ver pedidos"
                    >
                      <Eye className="view-orders-icon" />
                      <span>Ver Pedidos</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de pedidos del usuario */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Pedidos de {selectedUser.name}</h3>
                <p className="modal-subtitle">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="modal-close-button">
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="order-summary-card">
                <div className="order-summary-content">
                  <div className="order-summary-info">
                    <ShoppingBag className="order-summary-icon" />
                    <span className="order-summary-text">Resumen</span>
                  </div>
                  <div className="order-summary-totals">
                    <p className="order-summary-total-orders">
                      Total de pedidos: {selectedUser.orders.length}
                    </p>
                    <p className="order-summary-total-spent">
                      Total gastado: S/.{getTotalSpent(selectedUser.orders).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-orders-table-container">
                <table className="modal-orders-table">
                  <thead className="modal-orders-table-header">
                    <tr>
                      <th className="modal-orders-table-header th">Pedido</th>
                      <th className="modal-orders-table-header th">Modelo</th>
                      <th className="modal-orders-table-header th">Cantidad</th>
                      <th className="modal-orders-table-header th">Precio</th>
                      <th className="modal-orders-table-header th">Fecha</th>
                      <th className="modal-orders-table-header th">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="modal-orders-table-body">
                    {selectedUser.orders.map((order) => (
                      <tr key={order.id}>
                        <td className="modal-orders-table-data modal-orders-table-data-medium">
                          #{order.id}
                        </td>
                        <td className="modal-orders-table-data">{order.modelName}</td>
                        <td className="modal-orders-table-data">{order.quantity}</td>
                        <td className="modal-orders-table-data modal-orders-table-data-medium">
                          S/.{order.price.toFixed(2)}
                        </td>
                        <td className="modal-orders-table-data">{order.date}</td>
                        <td className="modal-orders-table-data">
                          <span className={`status-badge ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersManager
