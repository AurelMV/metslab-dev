import env from '../config/env';
const API_URL = env.BASE_URL_API;

// Obtener todos los modelos (requiere token)
export async function getModelos() {
  const res = await fetch(`${API_URL}/modelos`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al obtener modelos');
  return data.data || [];
}

export async function getCategorias() {
  const res = await fetch(`${API_URL}/categorias`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al obtener categorías');
  return Array.isArray(data) ? data : [];
}

// Obtener un modelo por ID (requiere token)
export async function getModeloById(id) {
  const res = await fetch(`${API_URL}/modelos/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al obtener modelo');
  return data.data;
}

// Crear modelo (requiere token)
export async function createModelo(formData, token) {
  const res = await fetch(`${API_URL}/modelos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// Actualizar modelo (requiere token)
export async function updateModelo(id, formData, token) {
  // Laravel espera POST con _method: PUT
  formData.append('_method', 'PUT');
  const res = await fetch(`${API_URL}/modelos/${id}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// Obtener archivo/modelo 3D por ID (público)
export async function getModelo3D(idModelo) {
  const res = await fetch(`${API_URL}/modelos/modelo/${idModelo}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al obtener modelo 3D');
  // Puede retornar data.data.modelo_url o solo data.modelo_url
  return data.data?.modelo_url || data.modelo_url || null;
}

export async function getModelosCatalogo(idCategoria = '') {
  let url = `${API_URL}/modelos/recursocatalogo`;
  if (idCategoria) {
    url += `?idCategoria=${idCategoria}`;
  }
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Error al obtener modelos');
  // El backend devuelve { success, data }, pero también puede devolver solo data
  if (Array.isArray(data)) return data;
  if (data.success && Array.isArray(data.data)) return data.data;
  return [];
}
export async function getModelosByCategoria(idCategoria) {
  const res = await fetch(`${API_URL}/modelos/categoria/${idCategoria}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al obtener modelos');
  return data.data; // el array de modelos
}
