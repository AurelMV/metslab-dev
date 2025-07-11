import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { data, Navigate } from "react-router-dom";
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
import { models3D, categories, colors, mockOrders } from "../data/mockData"; // Asegúrate de que mockData exista y tenga los datos
import "../stayle/Admin.css"; // Importa tu archivo CSS puro
import ModelosAdmin from "./ModelosAdmin";
import { getPedidosPorMes, getIngresosPorMes } from "../services/metrick-service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  useEffect(() => {
    const cargarMetricas = async () => {
      if (activeSection === 'metric') {
        setLoading(true);
        try {
          const [pedidos, ingresos] = await Promise.all([
            getPedidosPorMes(),
            getIngresosPorMes()
          ]);
          setPedidosPorMes(pedidos);
          setIngresosPorMes(ingresos);
        } catch (error) {
          console.error('Error al cargar métricas:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    cargarMetricas();
  }, [activeSection]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { id: "models", label: "Gestión de Modelos", icon: Package },
    { id: "categories", label: "Categorías", icon: Tag },
    { id: "orders", label: "Pedidos", icon: ShoppingBag },
    { id: "metric", label: "Metricas", icon: ChartBar},
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
      case "colors":
        if (editingItem) {
          setColorsData((prev) =>
            prev.map((item) =>
              item.id === editingItem.id
                ? { ...data, id: editingItem.id }
                : item
            )
          );
        } else {
          setColorsData((prev) => [
            ...prev,
            { ...data, id: Date.now().toString() },
          ]);
        }
        break;
      default:
        // Manejar otros casos o un error si es necesario
        break;
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
      switch (activeSection) {
        case "models":
          setModelsData((prev) => prev.filter((item) => item.id !== id));
          break;
        case "categories":
          setCategoriesData((prev) => prev.filter((item) => item.id !== id));
          break;
        case "colors":
          setColorsData((prev) => prev.filter((item) => item.id !== id));
          break;
        default:
          // Manejar otros casos o un error si es necesario
          break;
      }
    }
  };

  const renderModelsSection = () => {
    const filteredModels = modelsData.filter(
      (model) =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return <ModelosAdmin />;
  };

  const renderCategoriesSection = () => <CategoryForm />;

  const renderColorsSection = () => <ColoresAdmin />;

  const renderOrdersSection = () => (
    <div className="section-content">
      <h2 className="text-2xl font-bold text-secondary-900">
        Gestión de Pedidos
      </h2>

      <div className="table-container">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Entrega</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordersData.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div className="font-medium text-secondary-900">
                      #{order.id}
                    </div>
                    <div className="text-sm text-secondary-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium text-secondary-900">
                      Cliente #{order.userId}
                    </div>
                    <div className="text-sm text-secondary-500">
                      {order.address}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-secondary-900">
                      {order.items.map((item, index) => (
                        <div key={index} className="mb-1">
                          {item.model.name} x{item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="font-medium text-secondary-900">
                    S/ {order.totalAmount.toFixed(2)}
                  </td>
                  <td>
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
                      className="text-sm form-select"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="processing">Procesando</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        order.deliveryType === "delivery"
                          ? "badge-blue"
                          : "badge-green"
                      }`}
                    >
                      {order.deliveryType === "delivery"
                        ? "Delivery"
                        : "Recojo"}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn">
                      <Eye className="icon" />
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
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
      <div className="section-content">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">
          Métricas de la Tienda
        </h2>

        {loading ? (
          <div>Cargando métricas...</div>
        ) : (
          <>
            <div className="metric-cards grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="metric-card bg-white p-6 rounded-lg shadow-md">
                <h3 className="metric-title text-lg font-semibold mb-2">
                  Total de Pedidos
                </h3>
                <p className="metric-value text-3xl font-bold text-primary-600">
                  {pedidosPorMes.reduce((acc, item) => acc + item.cantidad, 0)}
                </p>
              </div>
              <div className="metric-card bg-white p-6 rounded-lg shadow-md">
                <h3 className="metric-title text-lg font-semibold mb-2">
                  Total de Ingresos
                </h3>
                <p className="metric-value text-3xl font-bold text-primary-600">
                  S/ {ingresosPorMes.reduce((acc, item) => acc + item.ingresos, 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="charts-container grid grid-cols-1 gap-6">
              <div className="chart-card bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Pedidos por Mes</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pedidosPorMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="mes" 
                      tickFormatter={(value) => nombresMeses[value - 1]} 
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Pedidos']}
                      labelFormatter={(mes) => nombresMeses[mes - 1]}
                    />
                    <Bar dataKey="cantidad" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Ingresos por Mes</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ingresosPorMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="mes" 
                      tickFormatter={(value) => nombresMeses[value - 1]} 
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`S/ ${value.toFixed(2)}`, 'Ingresos']}
                      labelFormatter={(mes) => nombresMeses[mes - 1]}
                    />
                    <Bar dataKey="ingresos" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderUsersSection = () => (
    <div className="section-content">
      <h2 className="text-2xl font-bold text-secondary-900">
        Usuarios Registrados
      </h2>

      <div className="table-container">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Contacto</th>
                <th>Rol</th>
                <th>Pedidos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((userData) => (
                <tr key={userData.id}>
                  <td>
                    <div className="flex items-center">
                      <div className="user-avatar-placeholder">
                        <User className="icon" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-secondary-900">
                          {userData.name}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {userData.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm text-secondary-900">
                      {userData.phone}
                    </div>
                    <div className="text-sm text-secondary-500">
                      {userData.address}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        userData.role === "admin"
                          ? "badge-purple"
                          : "badge-gray"
                      }`}
                    >
                      {userData.role === "admin" ? "Administrador" : "Cliente"}
                    </span>
                  </td>
                  <td className="text-sm text-secondary-900">
                    {
                      ordersData.filter((order) => order.userId === userData.id)
                        .length
                    }
                  </td>
                  <td>
                    <button className="action-btn">
                      <Eye className="icon" />
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

  const renderProfileSection = () => (
    <div className="section-content">
      <h2 className="text-2xl font-bold text-secondary-900">
        Mi Perfil de Administrador
      </h2>

      <div className="card p-6">
        <div className="form-grid md-cols-2">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              defaultValue={user?.name}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              defaultValue={user?.email}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input
              type="tel"
              defaultValue={user?.phone}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              defaultValue={user?.address}
              className="form-input"
            />
          </div>
        </div>
        <div className="mt-6">
          <button className="btn-primary">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>
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
              className="modal-close-btn"
            >
              <X className="icon" />
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

          {activeSection === "colors" && (
            <ColorForm
              initialData={editingItem}
              onSave={handleSave}
              onCancel={() => setShowModal(false)}
            />
          )}
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
      case "colors":
        return renderColorsSection();
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
    <div className="admin-dashboard-container">
      <div className="admin-content-wrapper">
        {/* Header */}
        <div className="admin-header">
          <h1>Panel de Administrador</h1>
          <p>Gestiona tu tienda de modelos 3D</p>
        </div>

        <div className="admin-grid">
          {/* Sidebar */}
          <div className="admin-sidebar-col">
            <div className="admin-sidebar">
              <nav className="admin-nav">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`admin-nav-item ${
                        activeSection === item.id ? "active" : ""
                      }`}
                    >
                      <Icon className="icon" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="admin-main-content-col">{renderContent()}</div>
        </div>

        {renderModal()}
      </div>
    </div>
  );
}
