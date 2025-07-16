//import env from "../config/env";
import { API_URL } from '../constants/constanst'

export async function getUsersWithPedidos() {
  const token = localStorage.getItem('token')
  if (!token) return null
  const response = await fetch(`${API_URL}/users-with-pedidos`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!response.ok) return null
  const data = await response.json()
  return data.data || null // <-- ajusta según tu API
}
