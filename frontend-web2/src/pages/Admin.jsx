import React, { useState } from "react";
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
} from "lucide-react";
import { models3D, categories, colors, mockOrders } from "../data/mockData"; // Asegúrate de que mockData exista y tenga los datos
import "../stayle/Admin.css"; // Importa tu archivo CSS puro
import ModelosAdmin from "./ModelosAdmin";
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

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { id: "models", label: "Gestión de Modelos", icon: Package },
    { id: "categories", label: "Categorías", icon: Tag },
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

  const renderUsersSection = () => <UsuariosAdmin />;

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
