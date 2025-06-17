import env from "../config/env";

const API_URL = env.BASE_URL_API;

// Login: retorna usuario y guarda el token en localStorage
export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error de autenticación");
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

// Logout: elimina el token de localStorage y cierra sesión en el backend
export async function logout() {
  const token = localStorage.getItem("token");
  if (!token) return;
  await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  localStorage.removeItem("token");
}

// Obtener usuario autenticado usando el token guardado
export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const response = await fetch(`${API_URL}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.user || null;
}
