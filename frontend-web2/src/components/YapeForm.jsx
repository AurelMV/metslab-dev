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
      const token = yapeResult.id;
      const payload = {
        transaction_amount: amount,
        token,
        description: "Pago con Yape",
        installments: 1,
        payment_method_id: "yape",
        payer: { email },
        external_reference: externalReference,
        preference_id: preferenceId,
      };
      const response = await paymentService.processPayment(payload);
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
    <form
      className="yape-form max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100"
      onSubmit={handleSubmit}
    >
      <h3 className="text-2xl font-bold text-center text-violet-700 mb-6 flex items-center justify-center gap-2">
        Pagar con Yape
      </h3>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Número de celular
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="9XXXXXXXX"
          pattern="^\d{9}$"
          title="Debe ser un número de celular válido de 9 dígitos"
          maxLength="9"
          minLength="9"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
          }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          OTP (de la app Yape)
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          placeholder="Código de 6 dígitos"
          pattern="^\d{6}$"
          title="Debe ser un código OTP de 6 dígitos"
          maxLength="6"
          minLength="6"
          onInput={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
          }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="tu@email.com"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
        />
      </div>
      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-center">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
            Procesando...
          </span>
        ) : (
          "Pagar con Yape"
        )}
      </button>
    </form>
  );
}
