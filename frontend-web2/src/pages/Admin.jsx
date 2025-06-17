import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
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
} from "lucide-react";
import { models3D, categories, colors, mockOrders } from "../data/mockData"; // Asegúrate de que mockData exista y tenga los datos
import "../stayle/Admin.css"; // Importa tu archivo CSS puro

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState("models");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data states (in real app, these would come from API/database)
  const [modelsData, setModelsData] = useState(models3D);
  const [categoriesData, setCategoriesData] = useState(categories);
  const [colorsData, setColorsData] = useState(colors);
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

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { id: "models", label: "Gestión de Modelos", icon: Package },
    { id: "categories", label: "Categorías", icon: Tag },
    { id: "colors", label: "Colores", icon: Palette },
    { id: "orders", label: "Pedidos", icon: ShoppingBag },
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

    return (
      <div className="section-content">
        <div className="section-header">
          <h2>Gestión de Modelos</h2>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="btn-primary"
          >
            <Plus className="icon" />
            <span>Nuevo Modelo</span>
          </button>
        </div>

        <div className="table-container">
          <div className="p-4 border-b">
            <div className="search-input-wrapper">
              <Search className="icon" />
              <input
                type="text"
                placeholder="Buscar modelos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Dimensiones</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model) => (
                  <tr key={model.id}>
                    <td>
                      <div className="flex items-center">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={model.image}
                          alt={model.name}
                        />
                        <div className="ml-4">
                          <div className="font-medium text-secondary-900">
                            {model.name}
                          </div>
                          <div className="text-sm text-secondary-500 text-truncate max-w-xs">
                            {model.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {categoriesData.find(
                          (cat) => cat.id === model.categoryId
                        )?.name || "Sin categoría"}
                      </span>
                    </td>
                    <td className="font-medium">S/ {model.price.toFixed(2)}</td>
                    <td className="text-sm text-secondary">
                      {model.dimensions.width}×{model.dimensions.height}×
                      {model.dimensions.depth} cm
                    </td>
                    <td className="action-buttons">
                      <button
                        onClick={() => {
                          setEditingItem(model);
                          setShowModal(true);
                        }}
                        className="action-btn"
                      >
                        <Edit className="icon" />
                      </button>
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="action-btn delete"
                      >
                        <Trash2 className="icon" />
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
  };

  const renderCategoriesSection = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Gestión de Categorías</h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="icon" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div className="form-grid category-grid">
        {categoriesData.map((category) => (
          <div key={category.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">
                {category.name}
              </h3>
              <div className="action-buttons space-x-2">
                <button
                  onClick={() => {
                    setEditingItem(category);
                    setShowModal(true);
                  }}
                  className="action-btn"
                >
                  <Edit className="icon" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="action-btn delete"
                >
                  <Trash2 className="icon" />
                </button>
              </div>
            </div>
            <p className="text-secondary-600 text-sm mb-4">
              {category.description}
            </p>
            <div className="text-xs text-secondary-500">
              {
                modelsData.filter((model) => model.categoryId === category.id)
                  .length
              }{" "}
              modelos
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderColorsSection = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Gestión de Colores</h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="icon" />
          <span>Nuevo Color</span>
        </button>
      </div>

      <div className="form-grid color-grid lg-cols-6">
        {colorsData.map((color) => (
          <div key={color.id} className="card p-4">
            <div className="flex justify-between items-start mb-3">
              <div
                className="color-swatch"
                style={{ backgroundColor: color.hex }}
              ></div>
              <div className="action-buttons color-card-actions space-x-1">
                <button
                  onClick={() => {
                    setEditingItem(color);
                    setShowModal(true);
                  }}
                  className="action-btn"
                >
                  <Edit className="icon" />
                </button>
                <button
                  onClick={() => handleDelete(color.id)}
                  className="action-btn delete"
                >
                  <Trash2 className="icon" />
                </button>
              </div>
            </div>
            <h3 className="font-medium text-secondary-900 text-sm">
              {color.name}
            </h3>
            <p className="text-xs text-secondary-500">{color.hex}</p>
          </div>
        ))}
      </div>
    </div>
  );

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
