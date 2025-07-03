import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  XCircle,
  AlertTriangle,
  RefreshCw,
  Home,
  ShoppingCart,
} from "lucide-react";
import { paymentService } from "../services/payment-service";
import "../stayle/PaymentFailure.css";

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");
  const externalReference = searchParams.get("external_reference");

  useEffect(() => {
    if (paymentId) {
      loadPaymentDetails();
    } else {
      setLoading(false);
    }
  }, [paymentId]);

  const loadPaymentDetails = async () => {
    try {
      const response = await paymentService.getPaymentStatus(paymentId);
      if (response.success) {
        setPaymentData(response);
      }
    } catch (error) {
      console.error("Error loading payment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  const getFailureReason = (status) => {
    switch (status) {
      case "rejected":
        return "El pago fue rechazado por el banco o método de pago";
      case "cancelled":
        return "El pago fue cancelado";
      case "pending":
        return "El pago está pendiente de confirmación";
      default:
        return "Hubo un problema al procesar el pago";
    }
  };

  if (loading) {
    return (
      <div className="payment-failure-loading">
        <div className="payment-failure-loading-content">
          <AlertTriangle className="payment-failure-loading-icon animate-pulse" />
          <h2>Verificando el pago...</h2>
          <p>Estamos revisando los detalles de la transacción</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-failure-container">
      <div className="payment-failure-content">
        <div className="payment-failure-header">
          <XCircle className="payment-failure-icon" />
          <h1>Pago No Completado</h1>
          <p>No pudimos procesar tu pago</p>
        </div>

        <div className="payment-failure-message">
          <AlertTriangle className="payment-failure-message-icon" />
          <div className="payment-failure-message-content">
            <h3>¿Qué pasó?</h3>
            <p>{getFailureReason(status)}</p>
          </div>
        </div>

        {paymentData && (
          <div className="payment-failure-details">
            <div className="payment-detail-card">
              <h3>Detalles del Pago</h3>
              <div className="payment-detail-item">
                <span>ID de Pago:</span>
                <span>{paymentData.payment_id}</span>
              </div>
              <div className="payment-detail-item">
                <span>Monto:</span>
                <span className="payment-amount">
                  {formatCurrency(paymentData.amount)}
                </span>
              </div>
              <div className="payment-detail-item">
                <span>Estado:</span>
                <span className={`payment-status ${status}`}>
                  {status === "rejected"
                    ? "Rechazado"
                    : status === "cancelled"
                    ? "Cancelado"
                    : status === "pending"
                    ? "Pendiente"
                    : status}
                </span>
              </div>
              {paymentData.payment_method && (
                <div className="payment-detail-item">
                  <span>Método de Pago:</span>
                  <span>{paymentData.payment_method.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="payment-failure-help">
          <h3>¿Necesitas ayuda?</h3>
          <div className="payment-failure-help-items">
            <div className="payment-help-item">
              <h4>Verifica tu método de pago</h4>
              <p>
                Asegúrate de que tu tarjeta tenga fondos suficientes y esté
                habilitada para compras online.
              </p>
            </div>
            <div className="payment-help-item">
              <h4>Revisa los datos ingresados</h4>
              <p>
                Confirma que todos los datos de tu método de pago sean
                correctos.
              </p>
            </div>
            <div className="payment-help-item">
              <h4>Contacta a tu banco</h4>
              <p>
                Si el problema persiste, contacta a tu banco para verificar si
                hay restricciones.
              </p>
            </div>
          </div>
        </div>

        <div className="payment-failure-actions">
          <Link to="/cart" className="payment-failure-button primary">
            <RefreshCw className="payment-failure-button-icon" />
            Intentar Nuevamente
          </Link>

          <Link to="/" className="payment-failure-button secondary">
            <Home className="payment-failure-button-icon" />
            Volver al Inicio
          </Link>
        </div>

        <div className="payment-failure-support">
          <p>
            <strong>¿Sigues teniendo problemas?</strong>
          </p>
          <p>
            Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te
            ayudaremos a resolver el problema.
          </p>
          <div className="payment-support-contact">
            <a
              href="mailto:soporte@metslab.com"
              className="payment-support-email"
            >
              soporte@metslab.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
