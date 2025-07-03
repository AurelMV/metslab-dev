import axios from "axios";
import env from "../config/env";

const API_BASE_URL = env.BASE_URL_API;

// Configurar axios con interceptores para el token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const paymentService = {
  /**
   * Crear preferencia de pago desde el carrito
   */
  createPreferenceFromCart: async (paymentData) => {
    try {
      // Agregar información de plataforma automáticamente
      const requestData = {
        ...paymentData,
        platform: "web", // Identificar que es web
        return_urls: {
          success: window.location.origin + "/payment/success",
          failure: window.location.origin + "/payment/failure",
          pending: window.location.origin + "/payment/pending",
        },
      };

      console.log("Creating payment preference with data:", requestData);

      const response = await api.post(
        "/payments/create-preference",
        requestData
      );

      console.log("Payment preference created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating payment preference:", error);

      // Mejorar el manejo de errores
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Error al crear la preferencia de pago");
      }
    }
  },

  /**
   * Crear preferencia de pago con configuración específica
   */
  createCustomPreference: async (paymentData) => {
    try {
      // Agregar información de plataforma automáticamente
      const requestData = {
        ...paymentData,
        platform: "web", // Identificar que es web
        return_urls: {
          success: window.location.origin + "/payment/success",
          failure: window.location.origin + "/payment/failure",
          pending: window.location.origin + "/payment/pending",
        },
      };

      const response = await api.post(
        "/payments/create-custom-preference",
        requestData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating custom payment preference:", error);
      throw error;
    }
  },

  /**
   * Procesar pago según documentación oficial de MercadoPago
   */
  processPayment: async (formData) => {
    try {
      // Enviar el formData tal cual lo recibe el Payment Brick
      const response = await api.post("/payments/process-payment", formData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 422) {
        throw new Error(
          "Datos de pago inválidos. Por favor, verifica la información."
        );
      } else if (error.response?.status === 400) {
        throw new Error(
          "Error en la solicitud de pago. Por favor, intenta nuevamente."
        );
      } else {
        throw new Error(
          "Error al procesar el pago. Por favor, intenta nuevamente."
        );
      }
    }
  },

  /**
   * Obtener estado de un pago
   */
  getPaymentStatus: async (paymentId) => {
    try {
      const response = await api.get(`/payments/status/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting payment status:", error);
      throw error;
    }
  },

  /**
   * Obtener historial de pagos del usuario
   */
  getUserPayments: async () => {
    try {
      const response = await api.get("/payments/user-payments");
      return response.data;
    } catch (error) {
      console.error("Error getting user payments:", error);
      throw error;
    }
  },

  /**
   * Probar configuración de MercadoPago
   */
  testConfiguration: async () => {
    try {
      const response = await api.get("/payments/test");
      return response.data;
    } catch (error) {
      console.error("Error testing MercadoPago configuration:", error);
      throw error;
    }
  },

  /**
   * Procesar pago exitoso (para compatibilidad)
   */
  processSuccessfulPayment: async (paymentData) => {
    try {
      console.log("Processing successful payment:", paymentData);

      // En la nueva implementación, el procesamiento se hace automáticamente
      // a través del webhook, pero mantenemos esta función por compatibilidad

      // Opcionalmente, podemos hacer una llamada al backend para confirmar
      if (paymentData.response?.payment_id) {
        const statusResponse = await api.get(
          `/payments/status/${paymentData.response.payment_id}`
        );
        console.log("Payment status confirmed:", statusResponse.data);
      }

      return {
        success: true,
        message: "Pago procesado exitosamente",
        paymentData,
      };
    } catch (error) {
      console.error("Error processing successful payment:", error);
      throw error;
    }
  },

  /**
   * Validar datos de pago antes de enviar
   */
  validatePaymentData: (formData) => {
    const errors = [];

    if (!formData.transaction_amount || formData.transaction_amount <= 0) {
      errors.push(
        "El monto de la transacción es requerido y debe ser mayor a 0"
      );
    }

    if (!formData.token) {
      errors.push("El token de pago es requerido");
    }

    if (!formData.payment_method_id) {
      errors.push("El método de pago es requerido");
    }

    if (!formData.payer?.email) {
      errors.push("El email del pagador es requerido");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(". "));
    }

    return true;
  },

  /**
   * Formatear datos de pago para el backend
   */
  formatPaymentData: (formData, user) => {
    return {
      transaction_amount: parseFloat(formData.transaction_amount),
      token: formData.token,
      description: formData.description || "Compra en MetsLab",
      installments: parseInt(formData.installments) || 1,
      payment_method_id: formData.payment_method_id,
      payer: {
        email: formData.payer.email,
        identification: formData.payer.identification || null,
      },
    };
  },

  /**
   * Manejar errores de MercadoPago de forma amigable
   */
  handleMercadoPagoError: (error) => {
    const errorMessages = {
      invalid_payment_method: "El método de pago seleccionado no es válido",
      insufficient_amount:
        "El monto es insuficiente para completar la transacción",
      invalid_card: "Los datos de la tarjeta son inválidos",
      card_disabled: "La tarjeta está deshabilitada",
      card_deleted: "La tarjeta ha sido eliminada",
      card_expired: "La tarjeta ha expirado",
      invalid_security_code: "El código de seguridad es incorrecto",
      invalid_expiration_month: "El mes de expiración es inválido",
      invalid_expiration_year: "El año de expiración es inválido",
      invalid_cardholder_name: "El nombre del titular es inválido",
      invalid_document_number: "El número de documento es inválido",
      invalid_document_type: "El tipo de documento es inválido",
      invalid_zip_code: "El código postal es inválido",
      invalid_address: "La dirección es inválida",
      invalid_phone: "El número de teléfono es inválido",
      invalid_email: "El email es inválido",
    };

    // Buscar el mensaje de error específico
    for (const [key, message] of Object.entries(errorMessages)) {
      if (error.message?.toLowerCase().includes(key)) {
        return message;
      }
    }

    // Si no se encuentra un mensaje específico, devolver el mensaje original
    return error.message || "Error en el procesamiento del pago";
  },

  createOrder: async (orderData) => {
    const response = await api.post("/orders/create", orderData);
    return response.data;
  },
};
