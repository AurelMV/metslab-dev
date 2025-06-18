import { API_URL } from '../constants/constanst'

// Cambiar la contraseña del usuario autenticado
export async function changePassword(current_password, new_password, new_password_confirmation) {
  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`${API_URL}/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ current_password, new_password, new_password_confirmation })
    })
    if (!response.ok) {
      throw new Error('Error al cambiar la contraseña')
    }
    return await response.json()
  } catch (error) {
    console.error(error)
    throw error
  }
}

// Cambiar la información del perfil del usuario autenticado
export async function updateProfile(name) {
  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    })
    if (!response.ok) {
      throw new Error('Error al cambiar el perfil')
    }
    return await response.json()
  } catch (error) {
    console.error(error)
    throw error
  }
}
