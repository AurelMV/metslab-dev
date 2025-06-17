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
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

// Import the pure CSS file
import "../stayle/Cart.css"; // Adjust the path as per your file structure

export default function Cart() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [address, setAddress] = useState(user?.address || "");

  const deliveryFee = deliveryType === "delivery" ? 10.0 : 0;
  const finalTotal = total + deliveryFee;

  const handleQuantityChange = (modelId, colorId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(modelId, colorId);
    } else {
      updateQuantity(modelId, colorId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate("/auth/login");
      return;
    }

    // Basic client-side validation for address if delivery is selected
    if (deliveryType === "delivery" && !address.trim()) {
      alert("Por favor, ingresa una dirección de entrega válida.");
      return;
    }

    // Mock checkout process
    alert(
      `Pedido procesado exitosamente!\nTotal: S/ ${finalTotal.toFixed(
        2
      )}\nTipo de entrega: ${
        deliveryType === "pickup" ? "Recojo en tienda" : "Delivery"
      }\nMétodo de pago: ${paymentMethod === "card" ? "Tarjeta" : "Efectivo"}`
    );
    clearCart();
    navigate("/");
  };

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
                      onChange={(e) => setDeliveryType(e.target.value)}
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
                      onChange={(e) => setDeliveryType(e.target.value)}
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
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ingresa tu dirección completa en Cusco"
                    className="delivery-address-textarea"
                    rows={3}
                  />
                </div>
              )}

              {/* Payment Method */}
              <div className="payment-method-section">
                <h3 className="payment-method-title">Método de Pago</h3>
                <div className="payment-options-group">
                  <label className="payment-option-label">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="payment-option-radio"
                    />
                    <CreditCard className="payment-option-icon" />
                    <span className="payment-option-name">
                      Tarjeta de Crédito/Débito
                    </span>
                  </label>

                  <label className="payment-option-label">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="payment-option-radio"
                    />
                    <div className="payment-cash-icon-wrapper">
                      <span className="payment-cash-icon-text">S/</span>
                    </div>
                    <span className="payment-option-name">
                      Pago en Efectivo
                    </span>
                  </label>
                </div>
              </div>

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
                disabled={deliveryType === "delivery" && !address.trim()}
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
