import React, { useState } from 'react'
import {
  Users,
  ShoppingCart,
  User,
  Search,
  Filter,
  Eye,
  Calendar,
  DollarSign,
  Package,
  Phone,
  Mail,
  MapPin,
  CreditCard
} from 'lucide-react'

const UserPurchaseManager = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Ana García',
      email: 'ana.garcia@email.com',
      phone: '+51 987 654 321',
      address: 'Av. Arequipa 1234, Lima',
      registrationDate: '2024-01-15',
      status: 'active',
      totalSpent: 245.75,
      purchases: [
        {
          id: 101,
          date: '2024-06-01',
          items: [
            {
              name: 'Figura de Dragón',
              quantity: 1,
              price: 22.75,
              material: 'PLA',
              color: '#FF6B6B'
            },
            {
              name: 'Miniatura de Casa',
              quantity: 2,
              price: 28.0,
              material: 'Resina',
              color: '#4ECDC4'
            }
          ],
          total: 78.75,
          status: 'completed'
        },
        {
          id: 102,
          date: '2024-05-15',
          items: [
            {
              name: 'Prototipo Industrial',
              quantity: 3,
              price: 24.25,
              material: 'PLA',
              color: '#45B7D1'
            }
          ],
          total: 72.75,
          status: 'shipped'
        },
        {
          id: 103,
          date: '2024-04-20',
          items: [
            {
              name: 'Joyería Personalizada',
              quantity: 1,
              price: 94.25,
              material: 'Resina',
              color: '#96CEB4'
            }
          ],
          total: 94.25,
          status: 'delivered'
        }
      ]
    },
    {
      id: 2,
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@email.com',
      phone: '+51 912 345 678',
      address: 'Jr. Huancavelica 567, Lima',
      registrationDate: '2024-02-20',
      status: 'active',
      totalSpent: 189.5,
      purchases: [
        {
          id: 201,
          date: '2024-06-05',
          items: [
            {
              name: 'Herramientas 3D',
              quantity: 2,
              price: 35.5,
              material: 'PLA',
              color: '#FECA57'
            },
            {
              name: 'Componentes Electrónicos',
              quantity: 1,
              price: 45.25,
              material: 'PLA',
              color: '#FF9FF3'
            }
          ],
          total: 116.25,
          status: 'printing'
        },
        {
          id: 202,
          date: '2024-03-10',
          items: [
            {
              name: 'Decoración Hogar',
              quantity: 1,
              price: 73.25,
              material: 'Resina',
              color: '#54A0FF'
            }
          ],
          total: 73.25,
          status: 'delivered'
        }
      ]
    },
    {
      id: 3,
      name: 'María Rodriguez',
      email: 'maria.rodriguez@email.com',
      phone: '+51 956 789 012',
      address: 'Av. Brasil 890, Breña',
      registrationDate: '2024-03-05',
      status: 'inactive',
      totalSpent: 156.0,
      purchases: [
        {
          id: 301,
          date: '2024-05-25',
          items: [
            {
              name: 'Figuras Colección',
              quantity: 4,
              price: 18.5,
              material: 'PLA',
              color: '#5F27CD'
            },
            {
              name: 'Accesorios Gaming',
              quantity: 2,
              price: 43.0,
              material: 'Resina',
              color: '#00D2D3'
            }
          ],
          total: 160.0,
          status: 'pending'
        }
      ]
    }
  ])

  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showPurchaseDetails, setShowPurchaseDetails] = useState(null)

  const statusOptions = [
    { value: 'all', label: 'Todos los Estados', color: '#6c757d' },
    { value: 'active', label: 'Activo', color: '#28a745' },
    { value: 'inactive', label: 'Inactivo', color: '#dc3545' }
  ]

  const purchaseStatusOptions = [
    { value: 'pending', label: 'Pendiente', color: '#FFA726' },
    { value: 'printing', label: 'Imprimiendo', color: '#42A5F5' },
    { value: 'completed', label: 'Completado', color: '#66BB6A' },
    { value: 'shipped', label: 'Enviado', color: '#AB47BC' },
    { value: 'delivered', label: 'Entregado', color: '#26A69A' }
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status, type = 'user') => {
    const options = type === 'user' ? statusOptions : purchaseStatusOptions
    return options.find((option) => option.value === status)?.color || '#6c757d'
  }

  const getStatusLabel = (status, type = 'user') => {
    const options = type === 'user' ? statusOptions : purchaseStatusOptions
    return options.find((option) => option.value === status)?.label || status
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const updateUserStatus = (userId, newStatus) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f38321 0%, #ff9f4d 100%)',
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto'
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '30px',
              flexWrap: 'wrap',
              gap: '20px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <Users size={32} color="#2196F3" />
              <h1
                style={{
                  margin: 0,
                  fontSize: '28px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #2196F3, #21CBF3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Gestor de Usuarios y Compras
              </h1>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '15px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ position: 'relative' }}>
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6c757d'
                  }}
                />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '12px 12px 12px 40px',
                    border: '2px solid #e9ecef',
                    borderRadius: '25px',
                    fontSize: '14px',
                    outline: 'none',
                    minWidth: '250px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#2196F3')}
                  onBlur={(e) => (e.target.style.borderColor = '#e9ecef')}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '2px solid #e9ecef',
                  borderRadius: '25px',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#fff',
                  cursor: 'pointer'
                }}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr',
              gap: '30px',
              minHeight: '600px'
            }}
          >
            {/* Users List */}
            <div>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <User size={20} />
                Usuarios ({filteredUsers.length})
              </h2>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                  maxHeight: '550px',
                  overflowY: 'auto',
                  paddingRight: '10px'
                }}
              >
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    style={{
                      background: selectedUser?.id === user.id ? '#f8f9ff' : '#fff',
                      border:
                        selectedUser?.id === user.id ? '2px solid #2196F3' : '1px solid #e9ecef',
                      borderRadius: '15px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow:
                        selectedUser?.id === user.id
                          ? '0 8px 25px rgba(33, 150, 243, 0.15)'
                          : '0 4px 15px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedUser?.id !== user.id) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedUser?.id !== user.id) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '15px'
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: '0 0 5px 0',
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#2c3e50'
                          }}
                        >
                          {user.name}
                        </h3>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            color: '#6c757d',
                            marginBottom: '3px'
                          }}
                        >
                          <Mail size={12} />
                          {user.email}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            color: '#6c757d'
                          }}
                        >
                          <Phone size={12} />
                          {user.phone}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '8px'
                        }}
                      >
                        <select
                          value={user.status}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateUserStatus(user.id, e.target.value)
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '15px',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: getStatusColor(user.status) + '20',
                            color: getStatusColor(user.status),
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="active">Activo</option>
                          <option value="inactive">Inactivo</option>
                        </select>

                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#2196F3'
                          }}
                        >
                          ${user.totalSpent.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#6c757d'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Calendar size={12} />
                        Registro: {formatDate(user.registrationDate)}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <ShoppingCart size={12} />
                        {user.purchases.length} compras
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Details */}
            {selectedUser && (
              <div>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#2c3e50',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <ShoppingCart size={20} />
                  Compras de {selectedUser.name}
                </h2>

                <div
                  style={{
                    background: '#f8f9fa',
                    borderRadius: '15px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '15px'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <MapPin size={16} color="#6c757d" />
                      <div>
                        <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: '600' }}>
                          DIRECCIÓN
                        </div>
                        <div style={{ fontSize: '14px', color: '#2c3e50' }}>
                          {selectedUser.address}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <DollarSign size={16} color="#6c757d" />
                      <div>
                        <div style={{ fontSize: '12px', color: '#6c757d', fontWeight: '600' }}>
                          TOTAL GASTADO
                        </div>
                        <div style={{ fontSize: '16px', color: '#2196F3', fontWeight: '700' }}>
                          ${selectedUser.totalSpent.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    maxHeight: '450px',
                    overflowY: 'auto',
                    paddingRight: '10px'
                  }}
                >
                  {selectedUser.purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      style={{
                        background: '#fff',
                        borderRadius: '15px',
                        padding: '20px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        border: '1px solid #e9ecef'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '15px'
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              margin: '0 0 5px 0',
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#2c3e50'
                            }}
                          >
                            Pedido #{purchase.id}
                          </h4>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#6c757d'
                            }}
                          >
                            {formatDate(purchase.date)}
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <div
                            style={{
                              padding: '6px 12px',
                              borderRadius: '15px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: getStatusColor(purchase.status, 'purchase') + '20',
                              color: getStatusColor(purchase.status, 'purchase')
                            }}
                          >
                            {getStatusLabel(purchase.status, 'purchase')}
                          </div>
                          <button
                            onClick={() =>
                              setShowPurchaseDetails(
                                showPurchaseDetails === purchase.id ? null : purchase.id
                              )
                            }
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '5px',
                              borderRadius: '5px',
                              color: '#2196F3'
                            }}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>

                      {showPurchaseDetails === purchase.id && (
                        <div
                          style={{
                            background: '#f8f9fa',
                            borderRadius: '10px',
                            padding: '15px',
                            marginBottom: '15px'
                          }}
                        >
                          <h5
                            style={{
                              margin: '0 0 10px 0',
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#2c3e50'
                            }}
                          >
                            Artículos:
                          </h5>
                          {purchase.items.map((item, index) => (
                            <div
                              key={index}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom:
                                  index < purchase.items.length - 1 ? '1px solid #e9ecef' : 'none'
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '10px'
                                }}
                              >
                                <div
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: item.color,
                                    border: '2px solid #fff',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                  }}
                                />
                                <div>
                                  <div
                                    style={{
                                      fontSize: '13px',
                                      fontWeight: '600',
                                      color: '#2c3e50'
                                    }}
                                  >
                                    {item.name}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#6c757d' }}>
                                    {item.material} • Cantidad: {item.quantity}
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: '#2196F3'
                                }}
                              >
                                ${(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: '10px',
                          borderTop: '1px solid #e9ecef'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '12px',
                            color: '#6c757d'
                          }}
                        >
                          <Package size={12} />
                          {purchase.items.length} artículo{purchase.items.length !== 1 ? 's' : ''}
                        </div>
                        <div
                          style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#2196F3'
                          }}
                        >
                          ${purchase.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserPurchaseManager
