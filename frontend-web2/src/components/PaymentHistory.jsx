import React, { useState, useEffect } from "react";
import { paymentService } from "../services/payment-service";
import { useAuth } from "../contexts/AuthContext";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";

const PaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadPaymentHistory();
    }
  }, [user]);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getUserPayments();

      if (response.success) {
        setPayments(response.payments);
      } else {
        setError("Error al cargar el historial de pagos");
      }
    } catch (err) {
      console.error("Error loading payment history:", err);
      setError("Error al cargar el historial de pagos");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="payment-status-icon approved" />;
      case "pending":
        return <Clock className="payment-status-icon pending" />;
      case "rejected":
      case "cancelled":
        return <XCircle className="payment-status-icon rejected" />;
      default:
        return <Clock className="payment-status-icon pending" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Aprobado";
      case "pending":
        return "Pendiente";
      case "rejected":
        return "Rechazado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Pendiente";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="payment-history-loading">
        <Loader2 className="payment-history-loading-icon animate-spin" />
        <p>Cargando historial de pagos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history-error">
        <XCircle className="payment-history-error-icon" />
        <h3>Error al cargar el historial</h3>
        <p>{error}</p>
        <button
          onClick={loadPaymentHistory}
          className="payment-history-retry-button"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="payment-history-empty">
        <CreditCard className="payment-history-empty-icon" />
        <h3>No hay pagos registrados</h3>
        <p>Aún no has realizado ningún pago en tu cuenta</p>
      </div>
    );
  }

  return (
    <div className="payment-history-container">
      <div className="payment-history-header">
        <h2>Historial de Pagos</h2>
        <p>Revisa todos tus pagos y pedidos</p>
      </div>

      <div className="payment-history-list">
        {payments.map((payment) => (
          <div key={payment.id} className="payment-history-item">
            <div className="payment-history-item-header">
              <div className="payment-history-item-info">
                <div className="payment-history-item-id">
                  <CreditCard className="payment-history-item-icon" />
                  <span>Pago #{payment.token_pago}</span>
                </div>
                <div className="payment-history-item-date">
                  <Calendar className="payment-history-date-icon" />
                  <span>{formatDate(payment.created_at)}</span>
                </div>
              </div>
              <div className="payment-history-item-status">
                {getStatusIcon(payment.estado)}
                <span className={`payment-status-text ${payment.estado}`}>
                  {getStatusText(payment.estado)}
                </span>
              </div>
            </div>

            <div className="payment-history-item-details">
              <div className="payment-history-item-amount">
                <DollarSign className="payment-history-amount-icon" />
                <span className="payment-amount">
                  {formatCurrency(payment.monto)}
                </span>
              </div>

              {payment.pedido && (
                <div className="payment-history-item-order">
                  <Package className="payment-history-order-icon" />
                  <div className="payment-order-info">
                    <span className="payment-order-id">
                      Pedido #{payment.pedido.id}
                    </span>
                    <span
                      className={`payment-order-status ${payment.pedido.estado}`}
                    >
                      {payment.pedido.estado === "pagado"
                        ? "Pagado"
                        : payment.pedido.estado === "pendiente"
                        ? "Pendiente"
                        : payment.pedido.estado === "rechazado"
                        ? "Rechazado"
                        : payment.pedido.estado}
                    </span>
                  </div>
                </div>
              )}

              {payment.Pagocol && payment.Pagocol.payment_method_id && (
                <div className="payment-history-item-method">
                  <span className="payment-method">
                    Método: {payment.Pagocol.payment_method_id.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;
