import env from "../config/env";

const API_URL = env.BASE_URL_API;

// Registrar usuario
export async function register({
  name,
  email,
  password,
  password_confirmation,
}) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, password_confirmation }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error en el registro");
  return data;
}

// Verificar código de registro
export async function verifyCode({ email, code }) {
  const response = await fetch(`${API_URL}/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Código inválido");
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

// Reenviar código de verificación
export async function resendCode(email) {
  const response = await fetch(`${API_URL}/resend-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "No se pudo reenviar el código");
  return data;
}
