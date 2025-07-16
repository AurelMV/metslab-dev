import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import ModelForm from "./ModelosAdmin";
import CategoryForm from "./CategoriasAdmin";
import {
  Package,
  Tag,
  Palette,
  ShoppingBag,
  Users,
  User,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Search,
  ChartBar,
} from "lucide-react";
import { models3D, categories, mockOrders } from "../data/mockData"; // Assuming mockData exists and has the data
import ModelosAdmin from "./ModelosAdmin";
import {
  getPedidosPorMes,
  getIngresosPorMes,
} from "../services/metrick-service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import UsuariosAdmin from "../components/UsuariosAdmin";

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState("models");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data states (in real app, these would come from API/database)
  const [modelsData, setModelsData] = useState(models3D);
  const [categoriesData, setCategoriesData] = useState(categories);
  const [ordersData, setOrdersData] = useState(mockOrders);
  const [usersData, setUsersData] = useState([
    {
      id: "1",
      name: "Admin MetsLab",
      email: "admin@metslab.com",
      role: "admin",
      phone: "+51 984 123 456",
      address: "Av. El Sol 123, Cusco",
    },
    {
      id: "2",
      name: "Cliente Ejemplo",
      email: "cliente@example.com",
      role: "customer",
      phone: "+51 987 654 321",
      address: "Jr. Comercio 456, Cusco",
    },
  ]);
  const [pedidosPorMes, setPedidosPorMes] = useState([]);
  const [ingresosPorMes, setIngresosPorMes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    new Date().getFullYear()
  );
  const [aniosDisponibles, setAniosDisponibles] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const cargarMetricas = async () => {
      if (activeSection === "metric") {
        console.log("Iniciando carga de métricas...");
        setLoading(true);
        setError(null);

        try {
          const [pedidos, ingresos] = await Promise.all([
            getPedidosPorMes(),
            getIngresosPorMes(),
          ]);

          console.log("Datos recibidos:", { pedidos, ingresos });

          // Extraer años disponibles
          const todosAnios = [
            ...new Set([
              ...pedidos.map((p) => p.anio),
              ...ingresos.map((i) => i.anio),
            ]),
          ].sort((a, b) => b - a); // Orden descendente

          if (isMounted) {
            setAniosDisponibles(todosAnios);
            if (
              todosAnios.length > 0 &&
              !todosAnios.includes(anioSeleccionado)
            ) {
              setAnioSeleccionado(todosAnios[0]); // Establecer el año más reciente
            }
            setPedidosPorMes(pedidos);
            setIngresosPorMes(ingresos);
          }
        } catch (err) {
          console.error("Error al cargar métricas:", err);
          if (isMounted) {
            setError(err.message || "Error al cargar métricas");
            setPedidosPorMes([]);
            setIngresosPorMes([]);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    cargarMetricas();

    return () => {
      isMounted = false;
    };
  }, [activeSection, anioSeleccionado]); // Añade anioSeleccionado como dependencia

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { id: "models", label: "Gestión de Modelos", icon: Package },
    { id: "categories", label: "Categorías", icon: Tag },
    // { id: "colors", label: "Colores", icon: Palette }, // Commented out as ColoresAdmin and ColorForm are not provided
    { id: "orders", label: "Pedidos", icon: ShoppingBag },
    { id: "metric", label: "Métricas", icon: ChartBar },
    { id: "users", label: "Usuarios", icon: Users },
    { id: "profile", label: "Mi Perfil", icon: User },
  ];

  const handleSave = (data) => {
    switch (activeSection) {
      case "models":
        if (editingItem) {
          setModelsData((prev) =>
            prev.map((item) =>
              item.id === editingItem.id
                ? { ...data, id: editingItem.id }
                : item
            )
          );
        } else {
          setModelsData((prev) => [
            ...prev,
            { ...data, id: Date.now().toString() },
          ]);
        }
        break;
      case "categories":
        if (editingItem) {
          setCategoriesData((prev) =>
            prev.map((item) =>
              item.id === editingItem.id
                ? { ...data, id: editingItem.id }
                : item
            )
          );
        } else {
          setCategoriesData((prev) => [
            ...prev,
            { ...data, id: Date.now().toString() },
          ]);
        }
        break;
      // case "colors": // Commented out as ColoresAdmin and ColorForm are not provided
      //   if (editingItem) {
      //     setColorsData((prev) =>
      //       prev.map((item) =>
      //         item.id === editingItem.id
      //           ? { ...data, id: editingItem.id }
      //           : item
      //       )
      //     );
      //   } else {
      //     setColorsData((prev) => [
      //       ...prev,
      //       { ...data, id: Date.now().toString() },
      //     ]);
      //   }
      //   break;
      default:
        // Handle other cases or an error if necessary
        break;
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    // Replace with a custom modal for confirmation
    // if (confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
    console.log("Would show a custom confirmation modal here.");
    // For now, proceed directly for demonstration
    switch (activeSection) {
      case "models":
        setModelsData((prev) => prev.filter((item) => item.id !== id));
        break;
      case "categories":
        setCategoriesData((prev) => prev.filter((item) => item.id !== id));
        break;
      // case "colors": // Commented out as ColoresAdmin and ColorForm are not provided
      //   setColorsData((prev) => prev.filter((item) => item.id !== id));
      //   break;
      default:
        // Handle other cases or an error if necessary
        break;
    }
    // }
  };

  const renderModelsSection = () => {
    // const filteredModels = modelsData.filter( // This filtering logic is not used as ModelosAdmin is imported
    //   (model) =>
    //     model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //     model.description.toLowerCase().includes(searchTerm.toLowerCase())
    // );
    return <ModelosAdmin />;
  };

  const renderCategoriesSection = () => <CategoryForm />;

  // const renderColorsSection = () => <ColoresAdmin />; // Commented out as ColoresAdmin is not provided

  const renderOrdersSection = () => (
    <div className="section-content flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h2>

      <div className="table-container bg-white rounded-lg shadow-md overflow-hidden">
        <div className="table-responsive overflow-x-auto">
          <table className="data-table w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordersData.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium text-gray-900">#{order.id}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium text-gray-900">
                      Cliente #{order.userId}
                    </div>
                    <div className="text-sm text-gray-500">{order.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="text-sm text-gray-900">
                      {order.items.map((item, index) => (
                        <div key={index} className="mb-1">
                          {item.model.name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    S/ {order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select
                      value={order.status}
                      onChange={(e) => {
                        setOrdersData((prev) =>
                          prev.map((o) =>
                            o.id === order.id
                              ? { ...o, status: e.target.value }
                              : o
                          )
                        );
                      }}
                      className="text-sm form-select w-full px-3 py-2 border border-gray-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="processing">Procesando</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        order.deliveryType === "delivery"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.deliveryType === "delivery"
                        ? "Delivery"
                        : "Recojo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button className="action-btn text-indigo-600 transition-colors bg-transparent border-none cursor-pointer p-0 hover:text-indigo-900">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMetricSection = () => {
    const nombresMeses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    const formatCurrency = (value) => {
      return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "PEN",
      }).format(value);
    };

    // Filtrar datos por año seleccionado
    const pedidosFiltrados = pedidosPorMes.filter(
      (item) => item.anio === anioSeleccionado
    );
    const ingresosFiltrados = ingresosPorMes.filter(
      (item) => item.anio === anioSeleccionado
    );

    // Crear estructura completa de 12 meses
    const crearEstructuraMensual = (datos, campo) => {
      const estructuraCompleta = nombresMeses.map((nombre, index) => {
        const mes = index + 1;
        const datoExistente = datos.find((d) => d.mes === mes);
        return {
          mes,
          mesNombre: nombre,
          [campo]: datoExistente ? datoExistente[campo] : 0,
          anio: anioSeleccionado,
        };
      });
      return estructuraCompleta;
    };

    // Datos para gráficos con todos los meses
    const datosGraficoPedidos = crearEstructuraMensual(
      pedidosFiltrados,
      "cantidad"
    );
    const datosGraficoIngresos = crearEstructuraMensual(
      ingresosFiltrados,
      "ingresos"
    );

    // Calcular totales
    const totalPedidos = datosGraficoPedidos.reduce(
      (acc, item) => acc + item.cantidad,
      0
    );
    const totalIngresos = datosGraficoIngresos.reduce(
      (acc, item) => acc + item.ingresos,
      0
    );

    return (
      <div className="section-content flex flex-col space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Métricas de la Tienda
        </h2>

        {/* Selector de Año */}
        <div className="mb-6 flex items-center">
          <label htmlFor="anio-select" className="mr-2 font-medium">
            Año:
          </label>
          <select
            id="anio-select"
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
            className="border rounded px-3 py-1"
            disabled={loading}
          >
            {aniosDisponibles.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </div>

        {/* Tarjetas de Total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-gray-700">
              Total de Pedidos
            </h3>
            <p className="text-2xl font-bold text-blue-600">{totalPedidos}</p>
            <p className="text-sm text-gray-500">Año {anioSeleccionado}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-700">
              Total de Ingresos
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIngresos)}
            </p>
            <p className="text-sm text-gray-500">Año {anioSeleccionado}</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Pedidos por Mes</h3>
            <div style={{ height: 300 }}>
              {datosGraficoPedidos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGraficoPedidos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mesNombre" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [value, "Pedidos"]}
                      labelFormatter={(value) => `Mes: ${value}`}
                    />
                    <Bar dataKey="cantidad" fill="#8884d8" name="Pedidos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No hay datos para el año seleccionado
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Ingresos por Mes</h3>
            <div style={{ height: 300 }}>
              {datosGraficoIngresos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGraficoIngresos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mesNombre" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Ingresos"]}
                      labelFormatter={(value) => `Mes: ${value}`}
                    />
                    <Bar dataKey="ingresos" fill="#82ca9d" name="Ingresos" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No hay datos para el año seleccionado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsersSection = () => <UsuariosAdmin />;

  const renderProfileSection = () => (
    <div className="section-content flex flex-col space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Mi Perfil de Administrador
      </h2>

      <div className="card bg-white rounded-lg shadow-md p-6">
        <div className="form-grid grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="form-group mb-4">
            <label className="form-label block text-sm font-medium text-gray-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              defaultValue={user?.name}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue={user?.email}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              defaultValue={user?.phone}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="form-group mb-4">
            <label className="form-label block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              defaultValue={user?.address}
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="btn-primary bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 border-none cursor-pointer hover:bg-indigo-600">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="modal-content bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative">
          <div className="modal-header flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">
              {editingItem ? "Editar" : "Crear"}{" "}
              {activeSection === "models"
                ? "Modelo"
                : activeSection === "categories"
                ? "Categoría"
                : activeSection === "colors"
                ? "Color"
                : ""}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="modal-close-btn text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {activeSection === "models" && (
            <ModelForm
              initialData={editingItem}
              categories={categoriesData}
              onSave={handleSave}
              onCancel={() => setShowModal(false)}
            />
          )}

          {activeSection === "categories" && (
            <CategoryForm
              initialData={editingItem}
              onSave={handleSave}
              onCancel={() => setShowModal(false)}
            />
          )}

          {/* {activeSection === "colors" && ( // Commented out as ColorForm is not provided
            <ColorForm
              initialData={editingItem}
              onSave={handleSave}
              onCancel={() => setShowModal(false)}
            />
          )} */}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "models":
        return renderModelsSection();
      case "categories":
        return renderCategoriesSection();
      // case "colors": // Commented out as ColoresAdmin is not provided
      //   return renderColorsSection();
      case "orders":
        return renderOrdersSection();
      case "metric":
        return renderMetricSection();
      case "users":
        return renderUsersSection();
      case "profile":
        return renderProfileSection();
      default:
        return renderModelsSection();
    }
  };

  return (
    <div className="admin-dashboard-container min-h-screen bg-gray-50 font-sans">
      {" "}
      {/* Added font-sans for Inter */}
      <div className="admin-content-wrapper max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="admin-header mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administrador
          </h1>
          <p className="text-gray-600">Gestiona tu tienda de modelos 3D</p>
        </div>

        <div className="admin-grid grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="admin-sidebar-col lg:col-span-1">
            <div className="admin-sidebar bg-white rounded-lg shadow-md p-4">
              <nav className="admin-nav flex flex-col space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`admin-nav-item w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors border-r-2 border-transparent bg-transparent cursor-pointer hover:bg-gray-50 ${
                        activeSection === item.id
                          ? "active bg-indigo-100 text-indigo-700 border-r-indigo-500"
                          : "text-gray-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="admin-main-content-col lg:col-span-3">
            {renderContent()}
          </div>
        </div>

        {renderModal()}
      </div>
    </div>
  );
}
