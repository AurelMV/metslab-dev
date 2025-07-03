import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Home, ShoppingBag, Receipt } from "lucide-react";
import "../stayle/PaymentSuccess.css";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { paymentData, orderDetails } = location.state || {};

  const handleContinueShopping = () => {
    navigate("/catalog");
  };

  const handleViewOrders = () => {
    navigate("/profile"); // Asumiendo que hay una sección de pedidos en el perfil
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="payment-success-container">
      <div className="payment-success-content">
        {/* Icono de éxito */}
        <div className="success-icon-container">
          <CheckCircle className="success-icon" />
        </div>

        {/* Título y mensaje */}
        <div className="success-header">
          <h1 className="success-title">¡Pago Exitoso!</h1>
          <p className="success-message">
            Tu pedido ha sido procesado correctamente. Recibirás una
            confirmación por email.
          </p>
        </div>

        {/* Detalles del pedido */}
        {orderDetails && (
          <div className="order-details">
            <h2 className="order-details-title">Detalles del Pedido</h2>

            <div className="order-summary">
              <div className="order-summary-item">
                <span>Total pagado:</span>
                <span className="order-total">
                  S/ {orderDetails.total.toFixed(2)}
                </span>
              </div>

              <div className="order-summary-item">
                <span>Productos:</span>
                <span>
                  {orderDetails.items.length}{" "}
                  {orderDetails.items.length === 1 ? "producto" : "productos"}
                </span>
              </div>

              <div className="order-summary-item">
                <span>Tipo de entrega:</span>
                <span className="delivery-type">
                  {orderDetails.deliveryType === "delivery"
                    ? "Envío a domicilio"
                    : "Recoger en tienda"}
                </span>
              </div>

              {orderDetails.address && (
                <div className="order-summary-item">
                  <span>Dirección:</span>
                  <span className="delivery-address">
                    {orderDetails.address.street_name},{" "}
                    {orderDetails.address.district}
                  </span>
                </div>
              )}
            </div>

            {/* Lista de productos */}
            <div className="products-list">
              <h3>Productos ordenados:</h3>
              {orderDetails.items.map((item, index) => (
                <div key={index} className="product-item">
                  <div className="product-info">
                    <span className="product-name">{item.model.name}</span>
                    <span className="product-quantity">x{item.quantity}</span>
                  </div>
                  <span className="product-price">
                    S/ {(item.model.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="additional-info">
          <div className="info-item">
            <Receipt className="info-icon" />
            <div className="info-content">
              <h4>Confirmación por email</h4>
              <p>
                Recibirás un email con los detalles de tu pedido y el número de
                seguimiento.
              </p>
            </div>
          </div>

          {orderDetails?.deliveryType === "delivery" && (
            <div className="info-item">
              <ShoppingBag className="info-icon" />
              <div className="info-content">
                <h4>Envío</h4>
                <p>Tu pedido será enviado en los próximos 2-3 días hábiles.</p>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="action-buttons">
          <button
            onClick={handleContinueShopping}
            className="action-button primary"
          >
            <ShoppingBag className="button-icon" />
            Continuar Comprando
          </button>

          <button
            onClick={handleViewOrders}
            className="action-button secondary"
          >
            <Receipt className="button-icon" />
            Ver Mis Pedidos
          </button>

          <button onClick={handleGoHome} className="action-button secondary">
            <Home className="button-icon" />
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
