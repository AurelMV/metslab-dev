import env from "../config/env";
const API_URL = env.BASE_URL_API;

// Obtener todas las reclamaciones del usuario (requiere token)
export async function getReclamaciones(token) {
  const res = await fetch(`${API_URL}/mis-reclamaciones`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener reclamaciones");
  return data.data || [];
}

// Crear una nueva reclamación (requiere token)
export async function createReclamacion(payload, token) {
  const res = await fetch(`${API_URL}/reclamaciones`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al registrar reclamación");
  return data;
}

// Obtener todas las reclamaciones (admin)
export async function getAllReclamaciones(token) {
  const res = await fetch(`${API_URL}/admin/reclamaciones`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener reclamaciones");
  return data.data || [];
}