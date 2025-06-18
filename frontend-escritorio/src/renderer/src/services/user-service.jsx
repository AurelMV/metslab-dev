import { API_URL } from '../constants/constanst'

// Obtener todos los usuarios
export async function getUsers() {
  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!response.ok) {
      throw new Error('Error al obtener los usuarios')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

// Cambiar el rol de un usuario
export async function changeUserRole(id, role) {
  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`${API_URL}/users/${id}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role })
    })
    if (!response.ok) {
      throw new Error('Error al cambiar el rol del usuario')
    }
    return await response.json()
  } catch (error) {
    console.error(error)
    throw error
  }
}
