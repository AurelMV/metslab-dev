import React, { useEffect, useState } from "react";
import { Eye, X, User, ArrowLeft } from "lucide-react";
import { getUsersWithPedidos } from "../services/usuario-service";

function isMobile() {
  return window.innerWidth < 700;
}

const PAGE_SIZE = 10;

export default function UsuariosAdmin() {
  const [usersData, setUsersData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPedidosModal, setShowPedidosModal] = useState(false);
  const [mobile, setMobile] = useState(isMobile());
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  useEffect(() => {
    async function fetchUsers() {
      const data = await getUsersWithPedidos();
      if (data) setUsersData(data);
    }
    fetchUsers();

    const handleResize = () => setMobile(isMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // FILTRO
  const usuariosFiltrados = usersData.filter((user) => {
    const matchNombre = user.name
      .toLowerCase()
      .includes(filters.nombre.toLowerCase());
    const matchEmail = user.email
      .toLowerCase()
      .includes(filters.email.toLowerCase());
    const telefono =
      user.addresses && user.addresses.length > 0
        ? user.addresses[0].phone_number || ""
        : "";
    const matchTelefono = telefono
      .toLowerCase()
      .includes(filters.telefono.toLowerCase());
    return matchNombre && matchEmail && matchTelefono;
  });

  // PAGINACIÓN
  const totalPages = Math.ceil(usuariosFiltrados.length / PAGE_SIZE);
  const usersPagina = usuariosFiltrados.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Reiniciar página al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const handleShowPedidos = (user) => {
    setSelectedUser(user);
    setShowPedidosModal(true);
  };

  const handleCloseModal = () => {
    setShowPedidosModal(false);
    setSelectedUser(null);
  };

  // Filtros handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Usuarios Registrados
      </h2>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          name="nombre"
          value={filters.nombre}
          onChange={handleFilterChange}
          placeholder="Filtrar por nombre"
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
          placeholder="Filtrar por email"
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="telefono"
          value={filters.telefono}
          onChange={handleFilterChange}
          placeholder="Filtrar por teléfono"
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        {mobile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {usersPagina.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
              >
                <div className="flex items-center mb-2 gap-3">
                  <div className="bg-gray-200 rounded-full p-2">
                    <User className="text-gray-600 w-8 h-8" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mb-1">
                  {user.addresses && user.addresses.length > 0 ? (
                    <>
                      <div className="text-sm font-bold text-gray-900">
                        {user.addresses[0].first_name}{" "}
                        {user.addresses[0].last_name}
                      </div>
                      <div className="text-sm text-gray-900">
                        {user.addresses[0].street_name},{" "}
                        {user.addresses[0].district},{" "}
                        {user.addresses[0].province},{" "}
                        {user.addresses[0].department}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.addresses[0].phone_number}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500">Sin dirección</div>
                  )}
                </div>
                <div className="mb-1">
                  <span className="px-2 py-1 rounded bg-gray-200 text-gray-800 text-xs font-semibold">
                    {user.role ? user.role : "Cliente"}
                  </span>
                </div>
                <div className="mb-1 text-sm text-gray-900">
                  Pedidos: {user.pedidos ? user.pedidos.length : 0}
                </div>
                <div>
                  <button
                    className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                    onClick={() => handleShowPedidos(user)}
                  >
                    <Eye className="text-blue-700" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="px-4 py-2">Usuario</th>
                  <th className="px-4 py-2">Ubicación y Contacto</th>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Rol</th>
                  <th className="px-4 py-2">Pedidos</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usersPagina.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-200 rounded-full p-2">
                          <User className="text-gray-600 w-8 h-8" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {user.addresses && user.addresses.length > 0 ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {user.addresses[0].street_name},{" "}
                            {user.addresses[0].district},{" "}
                            {user.addresses[0].province},{" "}
                            {user.addresses[0].department}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.addresses[0].phone_number}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Sin dirección
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {user.addresses && user.addresses.length > 0 ? (
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {user.addresses[0].first_name}{" "}
                            {user.addresses[0].last_name}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          Sin dirección
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 rounded bg-gray-200 text-gray-800 text-xs font-semibold">
                        {user.role ? user.role : "Cliente"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {user.pedidos ? user.pedidos.length : 0}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition"
                        onClick={() => handleShowPedidos(user)}
                      >
                        <Eye className="text-blue-700" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* PAGINACIÓN */}
      <div className="flex justify-center items-center gap-2 mt-8">
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

      {/* Modal de pedidos */}
      {showPedidosModal && selectedUser && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 mr-2"
                title="Regresar"
              >
                <ArrowLeft className="text-gray-600" />
              </button>
              <h3 className="text-xl font-bold text-gray-800 flex-1 text-center">
                Pedidos de {selectedUser.name}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 ml-2"
                title="Cerrar"
              >
                <X className="text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto pr-2" style={{ maxHeight: "65vh" }}>
              {selectedUser.pedidos && selectedUser.pedidos.length > 0 ? (
                selectedUser.pedidos.map((pedido) => (
                  <div key={pedido.id} className="mb-6 border-b pb-4">
                    <div className="font-bold mb-2 text-gray-900">
                      Pedido #{pedido.id} - Estado: {pedido.estado}
                    </div>
                    <div className="mb-2 text-gray-500">
                      Fecha: {new Date(pedido.fecha_pedido).toLocaleString()}
                    </div>
                    <div className="mb-2 text-gray-500">
                      Tipo de pedido: {pedido.TipoPedido}
                    </div>
                    <div className="mb-2 text-gray-900">
                      Total pagado:{" "}
                      <span className="font-bold">S/ {pedido.totalPago}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        Modelos comprados:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {pedido.detalles.map((detalle) =>
                          detalle.modelo ? (
                            <div
                              key={detalle.id}
                              className="flex gap-3 items-center bg-gray-50 rounded-lg p-3"
                            >
                              <img
                                src={detalle.modelo.imagen}
                                className="w-16 h-16 object-cover rounded shadow"
                              />
                              <div>
                                <div className="font-medium text-gray-900">
                                  {detalle.modelo.nombre}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {detalle.modelo.descripcion}
                                </div>
                                <div className="text-sm text-gray-900">
                                  Precio:{" "}
                                  <span className="font-bold">
                                    S/ {detalle.modelo.precio}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-900">
                                  Cantidad:{" "}
                                  <span className="font-bold">
                                    {detalle.cantidad}
                                  </span>
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
                <p className="text-gray-500">
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
