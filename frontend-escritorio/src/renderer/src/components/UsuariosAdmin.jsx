import React, { useEffect, useState } from 'react'
import { Eye, X, User } from 'lucide-react'
import { getUsersWithPedidos } from '../services/usuario-service'
import { API_URL } from '../constants/constanst'

function isMobile() {
  return window.innerWidth < 700
}

export default function UsuariosAdmin() {
  const [usersData, setUsersData] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showPedidosModal, setShowPedidosModal] = useState(false)
  const [mobile, setMobile] = useState(isMobile())
  const [pedidosPage, setPedidosPage] = useState(1)
  const pedidosPerPage = 5
  useEffect(() => {
    async function fetchUsers() {
      const data = await getUsersWithPedidos()
      if (data) setUsersData(data)
    }
    fetchUsers()
    const handleResize = () => setMobile(isMobile())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  useEffect(() => {
    setPedidosPage(1)
  }, [selectedUser])
  const handleShowPedidos = (user) => {
    setSelectedUser(user)
    setShowPedidosModal(true)
    setPedidosPage(1)
  }

  const handleCloseModal = () => {
    setShowPedidosModal(false)
    setSelectedUser(null)
    setPedidosPage(1)
  }

  const pedidos = selectedUser?.pedidos || []
  const totalPedidosPages = Math.ceil(pedidos.length / pedidosPerPage)
  const pedidosToShow = pedidos.slice(
    (pedidosPage - 1) * pedidosPerPage,
    pedidosPage * pedidosPerPage
  )
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Usuarios Registrados</h2>
      <div className="w-full max-w-5xl">
        {mobile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {usersData.map((user) => (
              <div key={user.id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-2">
                <div className="flex items-center mb-2">
                  <div className="bg-blue-100 rounded-full p-2">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mb-1">
                  {user.addresses && user.addresses.length > 0 ? (
                    <>
                      <div className="text-sm font-bold text-gray-900">
                        {user.addresses[0].first_name} {user.addresses[0].last_name}
                      </div>
                      <div className="text-sm text-gray-700">
                        {user.addresses[0].street_name}, {user.addresses[0].district},{' '}
                        {user.addresses[0].province}, {user.addresses[0].department}
                      </div>
                      <div className="text-sm text-gray-500">{user.addresses[0].phone_number}</div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">Sin dirección</div>
                  )}
                </div>
                <div className="mb-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'Admin'
                        ? 'bg-orange-100 text-orange-700'
                        : user.role === 'Cliente'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {user.role ? user.role : 'Cliente'}
                  </span>
                </div>
                <div className="mb-1 text-sm text-gray-900">
                  Pedidos: {user.pedidos ? user.pedidos.length : 0}
                </div>
                <div>
                  <button
                    className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                    onClick={() => handleShowPedidos(user)}
                    title="Ver pedidos"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase">
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Ubicación y Contacto</th>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Rol</th>
                  <th className="px-4 py-3 text-left">Pedidos</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usersData.map((user) => (
                  <tr key={user.id} className="border-b last:border-none hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-2">
                          <User className="w-7 h-7 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.addresses && user.addresses.length > 0 ? (
                        <div>
                          <div className="text-xs text-gray-700">
                            {user.addresses[0].street_name}, {user.addresses[0].district},{' '}
                            {user.addresses[0].province}, {user.addresses[0].department}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.addresses[0].phone_number}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">Sin dirección</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {user.addresses && user.addresses.length > 0 ? (
                        <div className="text-xs font-bold text-gray-900">
                          {user.addresses[0].first_name} {user.addresses[0].last_name}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">Sin dirección</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'Admin'
                            ? 'bg-orange-100 text-orange-700'
                            : user.role === 'Cliente'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {user.role ? user.role : 'Cliente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-900">
                      {user.pedidos ? user.pedidos.length : 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                        onClick={() => handleShowPedidos(user)}
                        title="Ver pedidos"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de pedidos */}
      {showPedidosModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Pedidos de {selectedUser.name}</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6">
              {pedidosToShow.length > 0 ? (
                pedidosToShow.map((pedido) => (
                  <div key={pedido.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="font-bold mb-2 text-gray-900">
                      Pedido #{pedido.id} - Estado: {pedido.estado}
                    </div>
                    <div className="mb-2 text-gray-500">
                      Fecha: {new Date(pedido.fecha_pedido).toLocaleString()}
                    </div>
                    <div className="mb-2 text-gray-500">Tipo de pedido: {pedido.TipoPedido}</div>
                    <div className="mb-2 text-gray-900">
                      Total pagado: <span className="font-bold">S/ {pedido.totalPago}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Modelos comprados:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {pedido.detalles.map((detalle) =>
                          detalle.modelo ? (
                            <div
                              key={detalle.id}
                              className="flex gap-3 items-center bg-white rounded-lg shadow p-2"
                            >
                              <img
                                src={
                                  detalle.modelo.imagen
                                    ? detalle.modelo.imagen.startsWith('http')
                                      ? detalle.modelo.imagen
                                      : `https://api.metslab3d.com${detalle.modelo.imagen.startsWith('/') ? '' : '/storage/imagenes/'}${detalle.modelo.imagen}`
                                    : 'https://via.placeholder.com/150'
                                }
                                alt={detalle.modelo.nombre}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {detalle.modelo.nombre}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {detalle.modelo.descripcion}
                                </div>
                                <div className="text-xs text-gray-900">
                                  Precio:{' '}
                                  <span className="font-bold">S/ {detalle.modelo.precio}</span>
                                </div>
                                <div className="text-xs text-gray-900">
                                  Cantidad: <span className="font-bold">{detalle.cantidad}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={detalle.id} className="text-gray-500">
                              Modelo no disponible
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">El usuario no tiene pedido hecho</p>
              )}
            </div>
            {/* Paginación */}
            {totalPedidosPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                  disabled={pedidosPage === 1}
                  onClick={() => setPedidosPage(pedidosPage - 1)}
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-700">
                  Página {pedidosPage} de {totalPedidosPages}
                </span>
                <button
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                  disabled={pedidosPage === totalPedidosPages}
                  onClick={() => setPedidosPage(pedidosPage + 1)}
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
