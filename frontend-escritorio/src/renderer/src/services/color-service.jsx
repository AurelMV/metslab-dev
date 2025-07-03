import { API_URL } from '../constants/constanst'

// Obtener todos los colores (público)
export async function getColores() {
  const response = await fetch(`${API_URL}/color`)
  if (!response.ok) throw new Error('Error al obtener colores')
  return await response.json()
}

// Crear un nuevo color (requiere token)
export async function createColor(data, token) {
  const response = await fetch(`${API_URL}/color`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Error al crear color')
  return await response.json()
}

// Actualizar un color (requiere token)
export async function updateColor(id, data, token) {
  const response = await fetch(`${API_URL}/color/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Error al actualizar color')
  return await response.json()
}

// Eliminar un color (requiere token)
export async function deleteColor(id, token) {
  const response = await fetch(`${API_URL}/color/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!response.ok) throw new Error('Error al eliminar color')
  return await response.json()
}
