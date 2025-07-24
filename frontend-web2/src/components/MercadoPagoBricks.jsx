import React, { useState, useEffect, useCallback, useRef } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { paymentService } from "../services/payment-service";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Inicializar MercadoPago con la clave pública
initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY);

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

const MercadoPagoBricks = ({
  deliveryType,
  deliveryFee,
  selectedAddress,
  preferenceId,
  externalReference,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferenceData, setPreferenceData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // Ref para evitar múltiples renders del Payment Brick
  const paymentBrickRef = useRef(null);
  const preferenceCreatedRef = useRef(false);

  // Crear preferencia de pago cuando el componente se monta
  useEffect(() => {
    // Solo crear preferencia si no se ha creado antes y hay items
    if (items.length > 0 && !preferenceCreatedRef.current) {
      createPaymentPreference();
    }
  }, []); // Dependencias vacías para evitar re-renders

  // Función para crear preferencia de pago
  const createPaymentPreference = useCallback(async () => {
    if (preferenceCreatedRef.current) return; // Evitar crear múltiples preferencias

    setLoading(true);
    setError(null);
    preferenceCreatedRef.current = true;

    try {
      // Preparar datos para el backend
      const paymentData = {
        delivery_type: deliveryType,
        delivery_fee: deliveryFee,
        address_id: selectedAddress?.id || null,
      };

      // Agregar configuración de expiración
      paymentData.expires = true;
      paymentData.expiration_date_to = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();

      // LOG para depuración
      console.log(
        "[DEBUG] Datos enviados a createPreferenceFromCart:",
        paymentData
      );

      const response = await paymentService.createPreferenceFromCart(
        paymentData
      );

      if (response.success) {
        setPreferenceData(response);
        console.log("Payment preference created successfully:", response);
      } else {
        throw new Error(
          response.message || "Error al crear la preferencia de pago"
        );
      }
    } catch (err) {
      console.error("Error creating payment preference:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error al procesar el pago"
      );
      onPaymentError?.(err);
      preferenceCreatedRef.current = false; // Permitir reintentar
    } finally {
      setLoading(false);
    }
  }, [deliveryType, deliveryFee, selectedAddress, onPaymentError]);

  // Función para manejar pago exitoso
  const handlePaymentSuccess = useCallback(
    async (paymentData) => {
      if (isProcessing) return;
      setIsProcessing(true);
      try {
        const { status, status_detail, message } = paymentData;
        let userMessage = message;
        if (!status || status === "error") {
          userMessage =
            message ||
            "Ocurrió un error inesperado. Por favor, intenta nuevamente.";
          onPaymentError?.({ ...paymentData, userMessage });
          setIsProcessing(false);
          return;
        }
        if (status === "approved") {
          await paymentService.processSuccessfulPayment(paymentData);
          onPaymentSuccess?.(paymentData);
          setTimeout(() => clearCart(), 500);
        } else if (status === "rejected") {
          userMessage =
            statusDetailMessages[status_detail] ||
            statusMessages[status] ||
            "El pago fue rechazado. Intenta con otra tarjeta.";
          onPaymentError?.({ ...paymentData, userMessage });
          setIsProcessing(false);
          return;
        } else {
          userMessage =
            statusMessages[status] || message || "Estado desconocido.";
          onPaymentError?.({ ...paymentData, userMessage });
          setIsProcessing(false);
          return;
        }
      } catch (err) {
        console.error("Error processing successful payment:", err);
        setError("Error al procesar el pago exitoso");
        onPaymentError?.(err);
        setIsProcessing(false);
      } finally {
        // Solo limpiar si fue aprobado, para evitar doble set
        // setIsProcessing(false);
      }
    },
    [clearCart, onPaymentSuccess, onPaymentError, isProcessing]
  );

  // Función para manejar errores de pago
  const handlePaymentError = useCallback(
    (error) => {
      console.error("Payment error:", error);
      setError("Error en el procesamiento del pago");
      onPaymentError?.(error);
    },
    [onPaymentError]
  );

  // Función para reintentar
  const handleRetry = useCallback(() => {
    setError(null);
    preferenceCreatedRef.current = false; // Permitir crear nueva preferencia
    createPaymentPreference();
  }, [createPaymentPreference]);

  // Configuración de inicialización según documentación oficial
  const initialization = {
    amount: total + deliveryFee,
    preferenceId: preferenceId,
  };

  // Configuración de personalización SOLO para tarjeta y Yape
  const customization = {
    paymentMethods: {
      creditCard: "all",
      debitCard: "all",
    },
  };

  // Callbacks según documentación oficial
  const onReady = useCallback(() => {
    console.log("Payment Brick is ready");
  }, []);

  const onSubmit = useCallback(
    ({ selectedPaymentMethod, formData }) => {
      console.log("FormData enviado al backend:", formData);
      if (isProcessing) return Promise.resolve(); // Evitar múltiples envíos
      setIsProcessing(true);
      // Agregar external_reference al formData (del pedido creado)
      const payload = { ...formData, external_reference: externalReference };
      return new Promise((resolve, reject) => {
        paymentService
          .processPayment(payload)
          .then((response) => {
            console.log("Payment processed successfully:", response);
            // Si el pago es aprobado, resolver la promesa
            if (response.status === "approved") {
              handlePaymentSuccess(response);
              resolve();
            } else {
              // Si es rechazado o error, rechazar la promesa
              handlePaymentSuccess(response); // Para mostrar el mensaje y liberar el botón
              reject();
            }
          })
          .catch((error) => {
            console.error("Error processing payment:", error);
            handlePaymentError(error);
            reject();
          })
          .finally(() => {
            setIsProcessing(false);
          });
      });
    },
    [isProcessing, handlePaymentSuccess, handlePaymentError, externalReference]
  );

  // Renderizar estados de carga y error
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-lg p-8 border border-gray-100 animate-pulse">
        <Loader2 className="h-10 w-10 text-violet-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">
          Preparando el pago...
        </h3>
        <p className="text-gray-500">
          Estamos configurando tu preferencia de pago
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-lg p-8 border border-red-200">
        <XCircle className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="text-lg font-semibold text-red-700 mb-1">
          Error en el pago
        </h3>
        <p className="text-gray-600 text-center mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg shadow transition"
        >
          <RefreshCw className="h-5 w-5" />
          Reintentar
        </button>
      </div>
    );
  }

  if (!preferenceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-lg p-8 border border-yellow-200">
        <AlertCircle className="h-10 w-10 text-yellow-500 mb-2" />
        <h3 className="text-lg font-semibold text-yellow-700 mb-1">
          No se pudo inicializar el pago
        </h3>
        <p className="text-gray-600 text-center mb-4">
          Por favor, verifica tu conexión e intenta nuevamente
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg shadow transition"
        >
          <RefreshCw className="h-5 w-5" />
          Reintentar
        </button>
      </div>
    );
  }

  // Renderizar Payment Brick solo una vez
  return (
    <div className="max-w-lg mx-auto bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-violet-700 flex items-center justify-center gap-2 mb-1">
          Completa tu pago
        </h3>
        <p className="text-gray-500">Selecciona tu método de pago preferido</p>
      </div>

      {/* Mostrar información del pedido */}
      {preferenceData && (
        <div className="mb-6 bg-violet-50 border border-violet-100 rounded-lg p-4">
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">S/ {total.toFixed(2)}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-600">Envío:</span>
              <span className="font-medium">S/ {deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between mt-2 text-base font-bold text-violet-700">
            <span>Total:</span>
            <span>S/ {(total + deliveryFee).toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Payment Brick según documentación oficial */}
      <div ref={paymentBrickRef} className="mb-6">
        <Payment
          initialization={initialization}
          customization={customization}
          onSubmit={onSubmit}
          onReady={onReady}
          onError={handlePaymentError}
        />
      </div>

      {/* Información adicional */}
      <div className="flex flex-col items-center gap-2 mt-4">
        <p className="flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Pago seguro procesado por MercadoPago
        </p>
        <p className="text-xs text-gray-400">
          Todos los precios están en Soles (PEN)
        </p>
      </div>
    </div>
  );
};

export default MercadoPagoBricks;
