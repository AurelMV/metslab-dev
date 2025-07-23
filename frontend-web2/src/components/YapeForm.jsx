import React, { useState } from "react";
import { paymentService } from "../services/payment-service";
import { useCart } from "../contexts/CartContext";

const PUBLIC_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;

const statusMessages = {
  approved: "¡Pago aprobado! Gracias por tu compra.",
  in_process: "Tu pago está en proceso. Te avisaremos cuando se acredite.",
  rejected: "El pago fue rechazado. Revisa los detalles e inténtalo de nuevo.",
};

const statusDetailMessages = {
  accredited: "¡Pago aprobado con Yape!",
  cc_rejected_call_for_authorize:
    "Debes autorizar el pago con Yape o tu banco.",
  cc_rejected_insufficient_amount: "Fondos insuficientes en tu cuenta Yape.",
  cc_rejected_other_reason:
    "El pago fue rechazado. Intenta nuevamente o usa otro método.",
  cc_rejected_card_type_not_allowed:
    "El tipo de tarjeta asociada a Yape no está permitido.",
  cc_rejected_max_attempts:
    "Se alcanzó el número máximo de intentos permitidos. Intenta más tarde.",
  cc_rejected_bad_filled_security_code: "El código OTP de Yape es incorrecto.",
  cc_rejected_form_error:
    "Error en el formulario. Revisa los datos ingresados.",
  // Mensajes generales
  cc_rejected_bad_filled_cvv:
    "CVV inválido. Por favor, revisa el código de seguridad de tu tarjeta.",
  cc_rejected_bad_filled_date: "Fecha de vencimiento incorrecta.",
  cc_rejected_bad_filled_other: "Datos de la tarjeta incorrectos.",
  cc_rejected_card_disabled:
    "La tarjeta está inhabilitada. Llama a tu banco para activarla.",
  cc_rejected_card_error: "No se pudo procesar el pago. Intenta nuevamente.",
  cc_rejected_high_risk:
    "El pago fue rechazado por seguridad. Prueba con otro medio de pago.",
};

export default function YapeForm({
  amount,
  onSuccess,
  onError,
  preferenceId,
  externalReference,
}) {
  const { clearCart } = useCart();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Cargar el SDK si no está
      if (!window.MercadoPago) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://sdk.mercadopago.com/js/v2";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      const mp = new window.MercadoPago(PUBLIC_KEY, { locale: "es-PE" });
      const yape = mp.yape({ otp, phoneNumber: phone });
      const yapeResult = await yape.create();
      console.log("Resultado de yape.create():", yapeResult);
      const token = yapeResult.id; // ¡Este es el token correcto!
      // Enviar al backend
      const payload = {
        transaction_amount: amount,
        token,
        description: "Pago con Yape",
        installments: 1,
        payment_method_id: "yape",
        payer: { email },
        external_reference: externalReference, // ¡CLAVE!
        preference_id: preferenceId, // Opcional, para debug
      };
      const response = await paymentService.processPayment(payload);
      // Validar el estado del pago
      const { status, status_detail, message } = response;
      if (status === "approved") {
        clearCart();
        onSuccess?.(response);
      } else {
        let userMessage = message;
        if (status === "rejected" && status_detail) {
          userMessage =
            statusDetailMessages?.[status_detail] ||
            statusMessages?.[status] ||
            "El pago fue rechazado. Intenta con otra tarjeta.";
        }
        setError(userMessage);
      }
    } catch (err) {
      setError(err.message || "Error al procesar el pago con Yape");
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="yape-form" onSubmit={handleSubmit}>
      <h3>Pagar con Yape</h3>
      <div>
        <label>Número de celular</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="9XXXXXXXX"
        />
      </div>
      <div>
        <label>OTP (de la app Yape)</label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          placeholder="Código de 6 dígitos"
        />
      </div>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="tu@email.com"
        />
      </div>
      {error && <div className="yape-error">{error}</div>}
      <button type="submit" disabled={loading} className="yape-submit">
        {loading ? "Procesando..." : "Pagar con Yape"}
      </button>
    </form>
  );
}
