import env from '../config/env';
const API_URL = env.BASE_URL_API;

// Obtener todas las categorías (público)
export async function getCategorias() {
  const res = await fetch(`${API_URL}/categorias`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al obtener categorías');
  return Array.isArray(data) ? data : [];
}

// Crear una nueva categoría (requiere token)
export async function createCategoria(nombre, token) {
  const res = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nombre }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al crear categoría');
  return data;
}

// Actualizar una categoría (requiere token)
export async function updateCategoria(idCategoria, nombre, token) {
  const res = await fetch(`${API_URL}/categorias/${idCategoria}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ nombre }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al actualizar categoría');
  return data;
}
