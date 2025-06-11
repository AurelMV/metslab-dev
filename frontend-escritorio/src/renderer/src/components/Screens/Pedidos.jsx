import React, { useState } from 'react'
import { Package, Edit3, Check, Clock, Truck, CheckCircle } from 'lucide-react'

const OrderManager3D = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      model: 'Figura de Dragón',
      quantity: 2,
      color: 'Rojo',
      material: 'PLA',
      price: 45.5,
      status: 'pending'
    },
    {
      id: 2,
      model: 'Miniatura de Casa',
      quantity: 1,
      color: 'Turquesa',
      material: 'Resina',
      price: 28.0,
      status: 'printing'
    },
    {
      id: 3,
      model: 'Prototipo Industrial',
      quantity: 5,
      color: 'Azul',
      material: 'PLA',
      price: 120.75,
      status: 'completed'
    },
    {
      id: 4,
      model: 'Joyería Personalizada',
      quantity: 3,
      color: 'Verde',
      material: 'Resina',
      price: 85.25,
      status: 'shipped'
    }
  ])

  const statusOptions = [
    { value: 'pending', label: 'Pendiente', color: '#FFA726', icon: Clock },
    { value: 'printing', label: 'Imprimiendo', color: '#42A5F5', icon: Edit3 },
    { value: 'completed', label: 'Completado', color: '#66BB6A', icon: Check },
    { value: 'shipped', label: 'Enviado', color: '#AB47BC', icon: Truck },
    { value: 'delivered', label: 'Entregado', color: '#26A69A', icon: CheckCircle }
  ]

  const colorOptions = [
    { name: 'Rojo', hex: '#FF6B6B' },
    { name: 'Turquesa', hex: '#4ECDC4' },
    { name: 'Azul', hex: '#45B7D1' },
    { name: 'Verde', hex: '#96CEB4' },
    { name: 'Amarillo', hex: '#FECA57' },
    { name: 'Rosa', hex: '#FF9FF3' },
    { name: 'Azul Claro', hex: '#54A0FF' },
    { name: 'Púrpura', hex: '#5F27CD' },
    { name: 'Cian', hex: '#00D2D3' },
    { name: 'Naranja', hex: '#FF9F43' }
  ]

  const updateOrder = (orderId, field, value) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, [field]: value } : order)))
  }

  const getStatusInfo = (status) => {
    return statusOptions.find((option) => option.value === status) || statusOptions[0]
  }

  const getColorHex = (colorName) => {
    const colorOption = colorOptions.find((color) => color.name === colorName)
    return colorOption ? colorOption.hex : '#95a5a6'
  }

  const calculateTotal = (price, quantity) => {
    return (price * quantity).toFixed(2)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f38321',
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
              gap: '15px'
            }}
          >
            <Package size={32} color="#667eea" />
            <h1
              style={{
                margin: 0,
                fontSize: '28px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Gestor de Pedidos 3D
            </h1>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '20px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
            }}
          >
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              const StatusIcon = statusInfo.icon

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#fff',
                    borderRadius: '15px',
                    padding: '25px',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)'
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '20px'
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#2c3e50'
                      }}
                    >
                      {order.model}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: statusInfo.color + '20',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: statusInfo.color
                      }}
                    >
                      <StatusIcon size={14} />
                      {statusInfo.label}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '20px'
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#7f8c8d',
                          marginBottom: '5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={order.quantity}
                        onChange={(e) =>
                          updateOrder(order.id, 'quantity', parseInt(e.target.value))
                        }
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #ecf0f1',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#2c3e50',
                          transition: 'border-color 0.3s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                        onBlur={(e) => (e.target.style.borderColor = '#ecf0f1')}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#7f8c8d',
                          marginBottom: '5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Precio Unitario
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={order.price}
                        onChange={(e) => updateOrder(order.id, 'price', parseFloat(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '2px solid #ecf0f1',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#2c3e50',
                          transition: 'border-color 0.3s ease',
                          outline: 'none'
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                        onBlur={(e) => (e.target.style.borderColor = '#ecf0f1')}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '15px',
                      marginBottom: '20px'
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#7f8c8d',
                          marginBottom: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Color
                      </label>
                      <select
                        value={order.color}
                        onChange={(e) => updateOrder(order.id, 'color', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #ecf0f1',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#2c3e50',
                          background: '#fff',
                          cursor: 'pointer',
                          outline: 'none',
                          transition: 'border-color 0.3s ease'
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                        onBlur={(e) => (e.target.style.borderColor = '#ecf0f1')}
                      >
                        {colorOptions.map((color) => (
                          <option key={color.name} value={color.name}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                      <div
                        style={{
                          marginTop: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            backgroundColor: getColorHex(order.color),
                            border: '2px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                        />
                        <span
                          style={{
                            fontSize: '12px',
                            color: '#7f8c8d',
                            fontWeight: '500'
                          }}
                        >
                          Vista previa del color
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#7f8c8d',
                          marginBottom: '5px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Material
                      </label>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px'
                        }}
                      >
                        {['PLA', 'Resina'].map((material) => (
                          <button
                            key={material}
                            onClick={() => updateOrder(order.id, 'material', material)}
                            style={{
                              padding: '8px 16px',
                              border: 'none',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              background:
                                order.material === material
                                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                                  : '#f8f9fa',
                              color: order.material === material ? '#fff' : '#2c3e50',
                              outline: 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (order.material !== material) {
                                e.target.style.background = '#e9ecef'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (order.material !== material) {
                                e.target.style.background = '#f8f9fa'
                              }
                            }}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginBottom: '20px'
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#7f8c8d',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Estado del Pedido
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrder(order.id, 'status', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #ecf0f1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#2c3e50',
                        background: '#fff',
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                      onBlur={(e) => (e.target.style.borderColor = '#ecf0f1')}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    style={{
                      background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                      padding: '15px',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#7f8c8d'
                      }}
                    >
                      Total:
                    </span>
                    <span
                      style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      ${calculateTotal(order.price, order.quantity)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              marginTop: '30px',
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea10, #764ba210)',
              borderRadius: '15px',
              textAlign: 'center'
            }}
          >
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c3e50'
              }}
            >
              Total General
            </h3>
            <div
              style={{
                fontSize: '24px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              ${orders.reduce((total, order) => total + order.price * order.quantity, 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderManager3D
