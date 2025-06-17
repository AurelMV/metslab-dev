import { API_URL } from '../constants/constanst'

// Obtener todas las categorías (público)
export async function getCategorias() {
  const response = await fetch(`${API_URL}/categorias`)
  if (!response.ok) throw new Error('Error al obtener categorías')
  return await response.json()
}

// Crear una nueva categoría (requiere token)
export async function createCategoria(nombre, token) {
  const response = await fetch(`${API_URL}/categorias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ nombre })
  })
  if (!response.ok) throw new Error('Error al crear categoría')
  return await response.json()
}

// Actualizar una categoría (requiere token)
export async function updateCategoria(idCategoria, nombre, token) {
  const response = await fetch(`${API_URL}/categorias/${idCategoria}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ nombre })
  })
  if (!response.ok) throw new Error('Error al actualizar categoría')
  return await response.json()
}

// Eliminar una categoría (requiere token)
export async function deleteCategoria(idCategoria, token) {
  const response = await fetch(`${API_URL}/categorias/${idCategoria}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!response.ok) throw new Error('Error al eliminar categoría')
  return await response.json()
}
