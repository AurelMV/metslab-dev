import env from "../config/env";
const API_URL = env.BASE_URL_API;

// Obtener todos los colores (público)
export async function getColores() {
  const res = await fetch(`${API_URL}/color`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener colores");
  return Array.isArray(data) ? data : [];
}
export async function getColoresDisponibles() {
  const res = await fetch(`${API_URL}/color/disponibles`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al obtener colores");
  return Array.isArray(data) ? data : [];
}

// Crear un nuevo color (requiere token)
export async function createColor({ nombre, codigo_hex, estado }, token) {
  const res = await fetch(`${API_URL}/color`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nombre, codigo_hex, estado }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al crear color");
  return data;
}

// Actualizar un color (requiere token)
export async function updateColor(id, { nombre, codigo_hex, estado }, token) {
  const res = await fetch(`${API_URL}/color/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nombre, codigo_hex, estado }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error al actualizar color");
  return data;
}
