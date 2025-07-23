import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CreditCard,
  MapPin,
  Store,
  Package,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import AddressPage from "../pages/Direcciones/AddressPage";
import MercadoPagoBricks from "../components/MercadoPagoBricks";
import YapeForm from "../components/YapeForm";
import { paymentService } from "../services/payment-service";

import "../stayle/Cart.css";

const statusMessages = {
  approved: "¡Pago aprobado! Gracias por tu compra.",
  in_process: "Tu pago está en proceso. Te avisaremos cuando se acredite.",
  rejected: "El pago fue rechazado. Revisa los detalles e inténtalo de nuevo.",
};

const statusDetailMessages = {
  accredited: "El pago fue acreditado exitosamente.",
  cc_rejected_bad_filled_cvv:
    "CVV inválido. Por favor, revisa el código de seguridad de tu tarjeta.",
  cc_rejected_bad_filled_date: "Fecha de vencimiento incorrecta.",
  cc_rejected_bad_filled_other: "Datos de la tarjeta incorrectos.",
  cc_rejected_insufficient_amount:
    "Fondos insuficientes en la tarjeta o cuenta Yape.",
  cc_rejected_card_disabled:
    "La tarjeta está inhabilitada. Llama a tu banco para activarla.",
  cc_rejected_card_error: "No se pudo procesar el pago. Intenta nuevamente.",
  cc_rejected_high_risk:
    "El pago fue rechazado por seguridad. Prueba con otro medio de pago.",
  cc_rejected_call_for_authorize:
    "Debes autorizar el pago con tu banco o Yape.",
  cc_rejected_other_reason:
    "El pago fue rechazado. Intenta nuevamente o usa otro método.",
  cc_rejected_card_type_not_allowed:
    "El tipo de tarjeta no está permitido para este pago.",
  cc_rejected_max_attempts:
    "Se alcanzó el número máximo de intentos permitidos. Intenta más tarde.",
  cc_rejected_bad_filled_security_code:
    "El código de seguridad (OTP) es incorrecto.",
  cc_rejected_form_error:
    "Error en el formulario. Revisa los datos ingresados.",
};

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState("pickup");
  const [showPayment, setShowPayment] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showYape, setShowYape] = useState(false);
  const [preferenceId, setPreferenceId] = useState(null);
  const [externalReference, setExternalReference] = useState(null);

  const finalTotal = total + deliveryFee;

  const handleQuantityChange = (modelId, colorId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(modelId, colorId, newQuantity);
    }
  };

  const handleDeliveryTypeChange = (e) => {
    const value = e.target.value;
    setDeliveryType(value);
    if (value === "delivery") {
      setDeliveryFee(10);
    } else {
      setDeliveryFee(0);
      setSelectedAddress(null);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Debes iniciar sesión para continuar con la compra");
      navigate("/auth/login");
      return;
    }
    if (deliveryType === "delivery" && !selectedAddress) {
      alert("Debes seleccionar una dirección de entrega");
      return;
    }
    // Preparar datos del pedido
    const orderData = {
      items: items.map((item) => ({
        idModelo: item.model.id,
        nombre: item.model.name,
        cantidad: item.quantity,
        precio: item.model.price,
      })),
      total: total + deliveryFee,
      delivery_type: deliveryType,
      delivery_fee: deliveryFee,
      address_id: deliveryType === "delivery" ? selectedAddress?.id : null,
      back_urls: {
        success: window.location.origin + "/payment/success",
        failure: window.location.origin + "/payment/failure",
        pending: window.location.origin + "/payment/pending",
      },
    };
    try {
      const res = await paymentService.createOrder(orderData);
      if (res.success) {
        setPreferenceId(res.preference_id);
        setExternalReference(res.external_reference);
        setShowPayment(true);
      } else {
        alert("No se pudo crear el pedido: " + res.message);
      }
    } catch (err) {
      alert("Error al crear el pedido: " + err.message);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    const { status, status_detail, message } = paymentData;
    let userMessage = message;
    if (status === "rejected" && status_detail) {
      userMessage =
        statusDetailMessages?.[status_detail] ||
        statusMessages?.[status] ||
        "El pago fue rechazado. Intenta con otra tarjeta.";
      alert(userMessage);
      // No navegar
      return;
    } else if (status === "approved") {
      alert(userMessage);
      navigate("/payment/success", {
        state: {
          paymentData,
          orderDetails: {
            total: total + deliveryFee,
            items: items,
            deliveryType: deliveryType,
            address: selectedAddress,
          },
        },
      });
      return;
    } else {
      alert(userMessage);
      // No navegar
      return;
    }
  };

  const handlePaymentError = (error) => {
    // Si el error es realmente un pago aprobado, no mostrar nada
    if (error && error.status === "approved") {
      return;
    }
    // Mostrar mensaje personalizado si viene en userMessage
    if (error && error.userMessage) {
      alert(error.userMessage);
      return;
    }
    console.error("Payment failed:", error);
    let errorMessage = "Hubo un error en el procesamiento del pago.";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    alert(
      `Error en el pago: ${errorMessage}\n\nPor favor, intenta nuevamente.`
    );
    setShowPayment(false);
  };

  // If user is not authenticated, redirect to login
  if (!user) {
    return (
      <div className="cart-page-container">
        <div className="cart-content-wrapper">
          <div className="cart-auth-required">
            <ShoppingCart className="cart-auth-icon" />
            <h2>Inicia sesión para continuar</h2>
            <p>Necesitas estar autenticado para ver tu carrito de compras</p>
            <Link to="/auth/login" className="cart-login-button">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If showing payment, display payment interface
  if (showPayment) {
    return (
      <div className="cart-page-container">
        <div className="cart-content-wrapper">
          <div className="cart-payment-header">
            <button
              onClick={() => {
                setShowPayment(false);
                setShowYape(false);
              }}
              className="cart-back-button"
            >
              <ArrowLeft className="cart-back-icon" />
              Volver al Carrito
            </button>
            <h1 className="cart-title">Procesar Pago</h1>
          </div>

          {/* Botones para elegir método de pago */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
            <button
              className={`cart-pay-method-btn${!showYape ? " selected" : ""}`}
              onClick={() => setShowYape(false)}
            >
              <CreditCard style={{ marginRight: 6 }} />
              Pagar con Tarjeta
            </button>
            <button
              className={`cart-pay-method-btn${showYape ? " selected" : ""}`}
              onClick={() => setShowYape(true)}
            >
              <img
                src="https://seeklogo.com/images/Y/yape-logo-3A4F8B9E0B-seeklogo.com.png"
                alt="Yape"
                style={{ width: 22, marginRight: 6, verticalAlign: "middle" }}
              />
              Pagar con Yape
            </button>
          </div>

          {/* Mostrar el método seleccionado */}
          {!showYape ? (
            <MercadoPagoBricks
              deliveryType={deliveryType}
              deliveryFee={deliveryFee}
              selectedAddress={selectedAddress}
              preferenceId={preferenceId}
              externalReference={externalReference}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          ) : (
            <YapeForm
              amount={finalTotal}
              preferenceId={preferenceId}
              externalReference={externalReference}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </div>
      </div>
    );
  }

  // If cart is empty, display empty state
  if (items.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="cart-content-wrapper">
          <div className="cart-empty-state">
            <ShoppingCart className="cart-empty-icon" />
            <h2 className="cart-empty-title">Tu carrito está vacío</h2>
            <p className="cart-empty-message">
              Explora nuestro catálogo y encuentra modelos 3D únicos
            </p>
            <Link to="/catalog" className="cart-catalog-link">
              <ArrowLeft className="cart-catalog-link-icon" />
              Ir al Catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart has items, display full cart
  return (
    <div className="cart-page-container">
      <div className="cart-content-wrapper">
        {/* Header */}
        <div className="cart-header">
          <Link to="/catalog" className="cart-continue-shopping-link">
            <ArrowLeft className="cart-continue-shopping-icon" />
            Continuar Comprando
          </Link>
          <h1 className="cart-title">Carrito de Compras</h1>
          <p className="cart-item-count">
            {items.length} {items.length === 1 ? "producto" : "productos"} en tu
            carrito
          </p>
        </div>

        <div className="cart-main-grid">
          {/* Cart Items */}
          <div className="cart-items-section">
            {items.map((item) => (
              <div
                key={`${item.model.id}-${item.selectedColor.id}`}
                className="cart-item-card"
              >
                <div className="cart-item-content">
                  {/* Product Image */}
                  <div className="cart-item-image-wrapper">
                    <img
                      src={item.model.image}
                      alt={item.model.name}
                      className="cart-item-image"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.model.name}</h3>
                    <p className="cart-item-description">
                      {item.model.description}
                    </p>

                    {/* Color */}
                    <div className="cart-item-color-info">
                      <span className="cart-item-color-label">Color:</span>
                      <div className="cart-item-color-display">
                        <div
                          className="cart-item-color-swatch"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        ></div>
                        <span className="cart-item-color-name">
                          {item.selectedColor.name}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="cart-item-controls">
                      <div className="cart-quantity-controls">
                        <span className="cart-quantity-label">Cantidad:</span>
                        <div className="cart-quantity-buttons-group">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.model.id,
                                item.selectedColor.id,
                                item.quantity - 1
                              )
                            }
                            className="cart-quantity-button"
                          >
                            <Minus className="cart-quantity-icon" />
                          </button>
                          <span className="cart-quantity-display">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.model.id,
                                item.selectedColor.id,
                                item.quantity + 1
                              )
                            }
                            className="cart-quantity-button"
                          >
                            <Plus className="cart-quantity-icon" />
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="cart-price-remove-group">
                        <div className="cart-price-info">
                          <div className="cart-item-total-price">
                            S/ {(item.model.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="cart-item-unit-price">
                            S/ {item.model.price.toFixed(2)} c/u
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            removeFromCart(item.model.id, item.selectedColor.id)
                          }
                          className="cart-remove-button"
                        >
                          <Trash2 className="cart-remove-icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="cart-summary-section">
            <div className="cart-summary-card">
              {/* MOSTRAR DIRECCIÓN SOLO SI ES DELIVERY */}
              {deliveryType === "delivery" && selectedAddress && (
                <div className="cart-address-card">
                  <h3>Dirección de entrega</h3>
                  <p>
                    <b>
                      {selectedAddress.first_name} {selectedAddress.last_name}
                    </b>
                    <br />
                    {selectedAddress.street_name}
                    <br />
                    {selectedAddress.district}, {selectedAddress.province},{" "}
                    {selectedAddress.department}, {selectedAddress.postal_code}
                    <br />
                    Tel: {selectedAddress.phone_number}
                  </p>
                </div>
              )}

              {/* SELECTOR DE DIRECCIÓN SOLO SI ES DELIVERY */}
              {deliveryType === "delivery" && (
                <div style={{ marginBottom: 16 }}>
                  <AddressPage onSelect={setSelectedAddress} />
                </div>
              )}

              <h2 className="cart-summary-title">Resumen del Pedido</h2>

              {/* Delivery Type */}
              <div className="delivery-type-section">
                <h3 className="delivery-type-title">Tipo de Entrega</h3>
                <div className="delivery-options-group">
                  <label className="delivery-option-label">
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={deliveryType === "pickup"}
                      onChange={handleDeliveryTypeChange}
                      className="delivery-option-radio"
                    />
                    <Store className="delivery-option-icon" />
                    <div className="delivery-option-details">
                      <div className="delivery-option-name">
                        Recojo en Tienda
                      </div>
                      <div className="delivery-option-price">Gratis</div>
                    </div>
                  </label>

                  <label className="delivery-option-label">
                    <input
                      type="radio"
                      name="delivery"
                      value="delivery"
                      checked={deliveryType === "delivery"}
                      onChange={handleDeliveryTypeChange}
                      className="delivery-option-radio"
                    />
                    <MapPin className="delivery-option-icon" />
                    <div className="delivery-option-details">
                      <div className="delivery-option-name">
                        Delivery en Cusco
                      </div>
                      <div className="delivery-option-price">S/ 10.00</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Address for Delivery */}
              {deliveryType === "delivery" && (
                <div className="delivery-address-section">
                  <label className="delivery-address-label">
                    Dirección de Entrega
                  </label>
                  <textarea
                    placeholder="Ingresa tu dirección completa en Cusco"
                    className="delivery-address-textarea"
                    rows={3}
                  />
                </div>
              )}

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-item">
                  <span>Subtotal</span>
                  <span>S/ {total.toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Entrega</span>
                  <span>
                    {deliveryFee === 0
                      ? "Gratis"
                      : `S/ ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="price-total">
                  <span>Total</span>
                  <span>S/ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={deliveryType === "delivery" && !selectedAddress}
                className="checkout-button"
              >
                {user ? "Procesar Pedido" : "Iniciar Sesión para Continuar"}
              </button>

              {/* Additional Info */}
              <div className="additional-info">
                <p>• Todos los precios incluyen IGV</p>
                <p>• Garantía de calidad en todos nuestros productos</p>
                <p>• Soporte técnico incluido</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
