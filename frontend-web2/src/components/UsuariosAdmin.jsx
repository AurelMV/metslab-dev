import React, { useEffect, useState } from "react";
import { Eye, X, User } from "lucide-react";
import { getUsersWithPedidos } from "../services/usuario-service";
import "../stayle/UsuariosAdmin.css";

function isMobile() {
  return window.innerWidth < 700;
}

export default function UsuariosAdmin() {
  const [usersData, setUsersData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPedidosModal, setShowPedidosModal] = useState(false);
  const [mobile, setMobile] = useState(isMobile());

  useEffect(() => {
    async function fetchUsers() {
      const data = await getUsersWithPedidos();
      if (data) setUsersData(data);
    }
    fetchUsers();

    // Detecta cambios de tamaño de pantalla
    const handleResize = () => setMobile(isMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShowPedidos = (user) => {
    setSelectedUser(user);
    setShowPedidosModal(true);
  };

  const handleCloseModal = () => {
    setShowPedidosModal(false);
    setSelectedUser(null);
  };

  return (
    <div className="usuarios-table-container">
      <h2 className="usuarios-title">Usuarios Registrados</h2>
      <div>
        {mobile ? (
          <div className="usuarios-cards-list">
            {usersData.map((user) => (
              <div key={user.id} className="usuario-card">
                <div className="flex items-center mb-2">
                  <div className="user-avatar-placeholder">
                    <User className="icon" />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-secondary-900">
                      {user.name}
                    </div>
                    <div className="text-sm text-secondary-500">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mb-1">
                  {user.addresses && user.addresses.length > 0 ? (
                    <>
                      <div className="text-sm text-secondary-900 font-bold">
                        {user.addresses[0].first_name}{" "}
                        {user.addresses[0].last_name}
                      </div>
                      <div className="text-sm text-secondary-900">
                        {user.addresses[0].street_name},{" "}
                        {user.addresses[0].district},{" "}
                        {user.addresses[0].province},{" "}
                        {user.addresses[0].department}
                      </div>
                      <div className="text-sm text-secondary-500">
                        {user.addresses[0].phone_number}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-secondary-500">
                      Sin dirección
                    </div>
                  )}
                </div>
                <div className="mb-1">
                  <span className={`badge badge-gray`}>
                    {user.role ? user.role : "Cliente"}
                  </span>
                </div>
                <div className="mb-1 text-sm text-secondary-900">
                  Pedidos: {user.pedidos ? user.pedidos.length : 0}
                </div>
                <div>
                  <button
                    className="action-btn"
                    onClick={() => handleShowPedidos(user)}
                  >
                    <Eye className="icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Ubicacion y Contacto</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Pedidos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center">
                      <div className="user-avatar-placeholder">
                        <User className="icon" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-secondary-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {user.addresses && user.addresses.length > 0 ? (
                      <div>
                        <div className="text-sm text-secondary-900">
                          {user.addresses[0].street_name},{" "}
                          {user.addresses[0].district},{" "}
                          {user.addresses[0].province},{" "}
                          {user.addresses[0].department}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {user.addresses[0].phone_number}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-secondary-500">
                        Sin dirección
                      </div>
                    )}
                  </td>
                  <td>
                    {user.addresses && user.addresses.length > 0 ? (
                      <div>
                        <div className="text-sm text-secondary-900 font-bold">
                          {user.addresses[0].first_name}{" "}
                          {user.addresses[0].last_name}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-secondary-500">
                        Sin dirección
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-gray`}>
                      {user.role ? user.role : "Cliente"}
                    </span>
                  </td>
                  <td className="text-sm text-secondary-900">
                    {user.pedidos ? user.pedidos.length : 0}
                  </td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => handleShowPedidos(user)}
                    >
                      <Eye className="icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de pedidos */}
      {showPedidosModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Pedidos de {selectedUser.name}</h3>
              <button onClick={handleCloseModal} className="modal-close-btn">
                <X className="icon" />
              </button>
            </div>
            <div>
              {selectedUser.pedidos && selectedUser.pedidos.length > 0 ? (
                selectedUser.pedidos.map((pedido) => (
                  <div key={pedido.id} className="pedido-card">
                    <div className="font-bold mb-2 text-secondary-900">
                      Pedido #{pedido.id} - Estado: {pedido.estado}
                    </div>
                    <div className="mb-2 text-secondary-500">
                      Fecha: {new Date(pedido.fecha_pedido).toLocaleString()}
                    </div>
                    <div className="mb-2 text-secondary-500">
                      Tipo de pedido: {pedido.TipoPedido}
                    </div>
                    <div className="mb-2 text-secondary-900">
                      Total pagado:{" "}
                      <span className="font-bold">S/ {pedido.totalPago}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-secondary-900">
                        Modelos comprados:
                      </span>
                      <div className="modelos-list">
                        {pedido.detalles.map((detalle) =>
                          detalle.modelo ? (
                            <div
                              key={detalle.id}
                              className="modelo-item modelo-item-adornado"
                            >
                              <img
                                src={`${import.meta.env.VITE_BASE_URL_API.replace(
                                  "/api",
                                  ""
                                )}${detalle.modelo.imagen}`}
                                alt={detalle.modelo.nombre}
                                className="modelo-img modelo-img-grande"
                              />
                              <div>
                                <div className="font-medium text-secondary-900">
                                  {detalle.modelo.nombre}
                                </div>
                                <div className="text-sm text-secondary-500">
                                  {detalle.modelo.descripcion}
                                </div>
                                <div className="text-sm text-secondary-900">
                                  Precio:{" "}
                                  <span className="font-bold">
                                    S/ {detalle.modelo.precio}
                                  </span>
                                </div>
                                <div className="text-sm text-secondary-900">
                                  Cantidad:{" "}
                                  <span className="font-bold">
                                    {detalle.cantidad}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={detalle.id} className="modelo-item">
                              <span className="text-secondary-500">
                                Modelo no disponible
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary-500">
                  El usuario no tiene pedido hecho
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
