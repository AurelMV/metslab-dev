import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Clock,
  Edit,
  Save,
  X,
  Settings,
  ArrowRight,
} from "lucide-react";
import { mockOrders } from "../data/mockData";

// Import the pure CSS file
import "../stayle/Profile.css"; // Adjust the path as per your file structure

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Mock user orders (in real app, this would come from API)
  const userOrders = mockOrders.filter((order) => order.userId === user.id);

  const handleSave = () => {
    updateUser(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
    });
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "status-yellow-100 text-yellow-800"; // Assuming a class that maps to specific colors
      case "processing":
        return "status-blue-100 text-blue-800";
      case "shipped":
        return "status-purple-100 text-purple-800";
      case "delivered":
        return "status-green-100 text-green-800";
      case "cancelled":
        return "status-red-100 text-red-800";
      default:
        return "status-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "processing":
        return "Procesando";
      case "shipped":
        return "Enviado";
      case "delivered":
        return "Entregado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-content-wrapper">
        {/* Header */}
        <div className="profile-header">
          <h1 className="profile-title">Mi Perfil</h1>
          <p className="profile-subtitle">
            Gestiona tu información personal y revisa tus pedidos
          </p>
        </div>

        <div className="profile-grid">
          {/* Profile Information */}
          <div className="profile-info-section">
            {/* Personal Info Card */}
            <div className="profile-card">
              <div className="personal-info-header">
                <h2 className="personal-info-title">
                  <User className="personal-info-icon" />
                  Información Personal
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="edit-button"
                  >
                    <Edit className="edit-button-icon" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button onClick={handleSave} className="save-button">
                      <Save className="edit-button-icon" />
                      <span>Guardar</span>
                    </button>
                    <button onClick={handleCancel} className="cancel-button">
                      <X className="edit-button-icon" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="form-fields-container">
                {/* Name */}
                <div className="form-field">
                  <label className="form-label">Nombre Completo</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="form-input"
                    />
                  ) : (
                    <p className="display-text">{user.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="form-field">
                  <label className="form-label">
                    <Mail className="form-label-icon" />
                    Correo Electrónico
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="form-input"
                    />
                  ) : (
                    <p className="display-text">{user.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="profile-card">
              <h2 className="order-history-title">
                <Package className="order-history-icon" />
                Historial de Pedidos
              </h2>

              {userOrders.length === 0 ? (
                <div className="no-orders-message">
                  <Package className="no-orders-icon" />
                  <p className="no-orders-text">No tienes pedidos aún</p>

                  <p className="no-orders-cta">
                    Explora nuestro catálogo y realiza tu primera compra
                  </p>
                </div>
              ) : (
                <div className="orders-list">
                  {userOrders.map((order) => (
                    <div key={order.id} className="order-item-card">
                      <div className="order-header">
                        <div>
                          <h3 className="order-id">Pedido #{order.id}</h3>
                          <div className="order-date">
                            <Clock className="order-date-icon" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString(
                                "es-ES",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`order-status-tag ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="order-items-list">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item-detail">
                            <div className="order-item-dot"></div>
                            <span className="order-item-name">
                              {item.model.name}
                            </span>
                            <span className="order-item-quantity">
                              x{item.quantity}
                            </span>
                            <div className="order-item-color-info">
                              <div
                                className="order-item-color-swatch"
                                style={{ backgroundColor: item.color.hex }}
                              ></div>
                              <span className="order-item-color-name">
                                {item.color.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-summary-footer">
                        <div className="delivery-type-tag">
                          <span
                            className={
                              order.deliveryType === "delivery"
                                ? "delivery-type-delivery"
                                : "delivery-type-pickup"
                            }
                          >
                            {order.deliveryType === "delivery"
                              ? "Delivery"
                              : "Recojo en tienda"}
                          </span>
                        </div>
                        <div className="order-total-amount">
                          S/ {order.totalAmount.toFixed(2)}
                        </div>
                      </div>

                      {order.address && (
                        <div className="order-address">
                          <MapPin className="order-address-icon" />
                          {order.address}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar-section">
            {/* Account Summary */}
            <div className="profile-card">
              <h3 className="account-summary-title">Resumen de Cuenta</h3>
              <div className="account-summary-list">
                <div className="account-summary-item">
                  <span className="account-summary-label">
                    Pedidos totales:
                  </span>
                  <span className="account-summary-value">
                    {userOrders.length}
                  </span>
                </div>
                <div className="account-summary-item">
                  <span className="account-summary-label">Tipo de cuenta:</span>
                  <span
                    className={`account-type-tag ${
                      user.role === "admin"
                        ? "account-type-admin"
                        : "account-type-client"
                    }`}
                  >
                    {user.role === "admin" ? "Administrador" : "Cliente"}
                  </span>
                </div>
                <div className="account-summary-item">
                  <span className="account-summary-label">Miembro desde:</span>
                  <span className="account-summary-value">2024</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="profile-card">
              <h3 className="quick-actions-title">Acciones Rápidas</h3>
              <div className="quick-actions-list">
                <a href="/catalog" className="quick-action-button">
                  Explorar Catálogo
                </a>
                <a href="/cart" className="quick-action-button secondary">
                  Ver Carrito
                </a>
              </div>
            </div>

            {/* Address Management Card */}
            <div className="profile-card address-management-card">
              <div className="address-card-header">
                <div className="address-icon-container">
                  <MapPin className="address-main-icon" />
                </div>
                <div className="address-content">
                  <h3 className="address-card-title">Mis Direcciones</h3>
                  <p className="address-card-description">
                    Administra tus direcciones de entrega guardadas
                  </p>
                </div>
              </div>
              
              <Link to="/direcciones" className="manage-addresses-button">
                <div className="button-content">
                  <div className="button-icon-wrapper">
                    <Settings className="button-icon" />
                  </div>
                  <div className="button-text-content">
                    <span className="button-main-text">Gestionar Direcciones</span>
                    <span className="button-sub-text">Agregar, editar o eliminar</span>
                  </div>
                  <ArrowRight className="button-arrow" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}