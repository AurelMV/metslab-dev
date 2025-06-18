import { API_URL } from '../constants/constanst'

// Obtener todos los modelos (GET /modelos)
export async function getModelos() {
  const response = await fetch(`${API_URL}/modelos`)
  if (!response.ok) throw new Error('Error al obtener modelos')
  const data = await response.json()
  // El backend retorna { success, data }
  return data.data
}

// Obtener modelos por categoría (GET /modelos/categoria/{idCategoria})
export async function getModelosPorCategoria(idCategoria) {
  const response = await fetch(`${API_URL}/modelos/categoria/${idCategoria}`)
  if (!response.ok) throw new Error('Error al obtener modelos por categoría')
  const data = await response.json()
  return data.data
}

// Obtener un modelo por id (GET /modelos/modelo/{id}) para obtener la URL del .obj
export async function getModelo(idModelo) {
  const response = await fetch(`${API_URL}/modelos/modelo/${idModelo}`)
  if (!response.ok) throw new Error('Error al obtener modelo')
  const data = await response.json()
  // El backend retorna { success, data: { modelo_url } }
  return data.data
}

// Crear un modelo (POST /modelos) - requiere token y FormData
export async function createModelo(formData, token) {
  const response = await fetch(`${API_URL}/modelos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
      // No pongas 'Content-Type', fetch lo maneja con FormData
    },
    body: formData
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Error al crear modelo')
  }
  return await response.json()
}

// Actualizar un modelo (PUT /modelos/{id}) - requiere token y FormData
export async function updateModelo(idModelo, formData, token) {
  const response = await fetch(`${API_URL}/modelos/${idModelo}`, {
    method: 'POST', // Laravel puede requerir POST con _method=PUT en FormData
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: (() => {
      formData.append('_method', 'PUT')
      return formData
    })()
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Error al actualizar modelo')
  }
  return await response.json()
}

// Eliminar un modelo (DELETE /modelos/{id}) - requiere token
export async function deleteModelo(idModelo, token) {
  const response = await fetch(`${API_URL}/modelos/${idModelo}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || 'Error al eliminar modelo')
  }
  return await response.json()
}
