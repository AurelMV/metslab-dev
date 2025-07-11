import React, { useState, useEffect } from "react";
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
  Eye,
  Truck,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar
} from "lucide-react";
import { getSeguimientoPedidos, getHistorialPedidos, getDetallesPedido } from "../services/tracking-service";
import OrderDetailsModal from "../components/OrderDetailsModal";

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

  // Estados para el seguimiento y historial
  const [seguimientoPedidos, setSeguimientoPedidos] = useState([]);
  const [historialPedidos, setHistorialPedidos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('seguimiento'); // 'seguimiento' o 'historial'
  const [orderDetails, setOrderDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Cargar datos de pedidos
  useEffect(() => {
    const loadOrdersData = async () => {
      setLoading(true);
      try {
        // Cargar seguimiento de pedidos activos
        const seguimientoData = await getSeguimientoPedidos();
        if (seguimientoData?.success) {
          setSeguimientoPedidos(seguimientoData.data);
        }

        // Cargar historial de pedidos
        const historialData = await getHistorialPedidos(1, 10);
        if (historialData?.success) {
          setHistorialPedidos(historialData.data);
          setEstadisticas(historialData.estadisticas);
        }
      } catch (error) {
        console.error('Error cargando datos de pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadOrdersData();
    }
  }, [user]);

  // Función para ver detalles del pedido
  const handleViewDetails = async (pedidoId) => {
    try {
      const detalles = await getDetallesPedido(pedidoId);
      if (detalles?.success) {
        setOrderDetails(detalles.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error cargando detalles del pedido:', error);
    }
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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

            {/* Order Tracking and History */}
            <div className="profile-card">
              {/* Tabs para Seguimiento e Historial */}
              <div className="order-tabs">
                <button 
                  className={`tab-button ${activeTab === 'seguimiento' ? 'active' : ''}`}
                  onClick={() => setActiveTab('seguimiento')}
                >
                  <Truck className="tab-icon" />
                  Seguimiento
                </button>
                <button 
                  className={`tab-button ${activeTab === 'historial' ? 'active' : ''}`}
                  onClick={() => setActiveTab('historial')}
                >
                  <Package className="tab-icon" />
                  Historial
                </button>
              </div>

              {/* Contenido del Tab Activo */}
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Cargando pedidos...</p>
                </div>
              ) : (
                <>
                  {activeTab === 'seguimiento' && (
                    <div className="tracking-section">
                      <div className="section-header">
                        <h3>Pedidos en Seguimiento</h3>
                        <p>Revisa el estado actual de tus pedidos activos</p>
                      </div>
                      
                      {seguimientoPedidos.length === 0 ? (
                        <div className="no-orders-message">
                          <Truck className="no-orders-icon" />
                          <p className="no-orders-text">No tienes pedidos en seguimiento</p>
                          <p className="no-orders-cta">
                            Todos tus pedidos han sido entregados o no tienes pedidos activos
                          </p>
                        </div>
                      ) : (
                        <div className="tracking-orders-list">
                          {seguimientoPedidos.map((pedido) => (
                            <div key={pedido.id} className="tracking-order-card">
                              <div className="tracking-order-header">
                                <div className="order-info">
                                  <h4>Pedido #{pedido.numero_pedido}</h4>
                                  <div className="order-date">
                                    <Calendar className="date-icon" />
                                    <span>{pedido.fecha_pedido}</span>
                                  </div>
                                </div>
                                <div className={`tracking-status status-${pedido.estado}`}>
                                  {pedido.estado === 'entregado' && <CheckCircle className="status-icon" />}
                                  {pedido.estado === 'enviado' && <Truck className="status-icon" />}
                                  {pedido.estado === 'en_proceso' && <Package className="status-icon" />}
                                  {pedido.estado === 'pagado' && <CheckCircle className="status-icon" />}
                                  {pedido.estado === 'pendiente' && <Clock className="status-icon" />}
                                  <span>{pedido.estado_formateado}</span>
                                </div>
                              </div>

                              <div className="tracking-progress">
                                <div className="progress-bar">
                                  <div 
                                    className="progress-fill" 
                                    style={{ width: `${pedido.progreso}%` }}
                                  ></div>
                                </div>
                                <div className="progress-info">
                                  <span className="progress-text">{pedido.progreso}% completado</span>
                                  <span className="next-step">{pedido.proximo_paso}</span>
                                </div>
                              </div>

                              {pedido.producto_principal && (
                                <div className="main-product">
                                  <span className="product-name">{pedido.producto_principal.nombre}</span>
                                  <span className="product-quantity">
                                    {pedido.total_productos > 1 
                                      ? `y ${pedido.total_productos - 1} producto(s) más` 
                                      : `Cantidad: ${pedido.producto_principal.cantidad}`
                                    }
                                  </span>
                                </div>
                              )}

                              <div className="tracking-order-footer">
                                <div className="order-total">S/ {pedido.total_pago}</div>
                                <button 
                                  className="view-details-btn"
                                  onClick={() => handleViewDetails(pedido.id)}
                                >
                                  <Eye className="btn-icon" />
                                  Ver Detalles
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'historial' && (
                    <div className="history-section">
                      <div className="section-header">
                        <h3>Historial de Pedidos</h3>
                        <p>Todos tus pedidos realizados</p>
                      </div>
                      
                      {historialPedidos.length === 0 ? (
                        <div className="no-orders-message">
                          <Package className="no-orders-icon" />
                          <p className="no-orders-text">No tienes pedidos en tu historial</p>
                          <p className="no-orders-cta">
                            Explora nuestro catálogo y realiza tu primera compra
                          </p>
                        </div>
                      ) : (
                        <div className="history-orders-list">
                          {historialPedidos.map((pedido) => (
                            <div key={pedido.id} className="history-order-card">
                              <div className="history-order-header">
                                <div className="order-basic-info">
                                  <h4>Pedido #{pedido.numero_pedido}</h4>
                                  <div className="order-meta">
                                    <span className="order-date">{pedido.fecha_pedido}</span>
                                    <span className="order-days">
                                      Hace {pedido.dias_desde_pedido} día(s)
                                    </span>
                                  </div>
                                </div>
                                <div className={`order-status-badge status-${pedido.estado}`}>
                                  {pedido.estado_formateado}
                                </div>
                              </div>

                              {pedido.producto_preview && (
                                <div className="product-preview">
                                  <div className="product-preview-info">
                                    <span className="product-name">{pedido.producto_preview.nombre}</span>
                                    <span className="product-summary">
                                      {pedido.resumen.total_productos} producto(s) • {pedido.resumen.metodo_pago}
                                    </span>
                                  </div>
                                  {pedido.se_puede_seguir && (
                                    <div className="can-track-indicator">
                                      <TrendingUp className="track-icon" />
                                      <span>Se puede seguir</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="history-order-footer">
                                <div className="order-total-section">
                                  <span className="total-label">Total:</span>
                                  <span className="total-amount">S/ {pedido.total_pago}</span>
                                </div>
                                <div className="order-actions">
                                  {pedido.se_puede_seguir && (
                                    <button 
                                      className="track-btn"
                                      onClick={() => setActiveTab('seguimiento')}
                                    >
                                      <Truck className="btn-icon" />
                                      Seguir
                                    </button>
                                  )}
                                  <button 
                                    className="view-details-btn"
                                    onClick={() => handleViewDetails(pedido.id)}
                                  >
                                    <Eye className="btn-icon" />
                                    Detalles
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
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
                    {estadisticas?.total_pedidos || 0}
                  </span>
                </div>
                <div className="account-summary-item">
                  <span className="account-summary-label">
                    Pedidos completados:
                  </span>
                  <span className="account-summary-value">
                    {estadisticas?.pedidos_completados || 0}
                  </span>
                </div>
                <div className="account-summary-item">
                  <span className="account-summary-label">
                    Pedidos activos:
                  </span>
                  <span className="account-summary-value">
                    {estadisticas?.pedidos_activos || 0}
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

        {/* Modal para detalles del pedido */}
        <OrderDetailsModal 
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          orderDetails={orderDetails}
        />
      </div>
    </div>
  );
}