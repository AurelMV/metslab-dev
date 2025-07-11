import env from "../config/env";

const API_URL = env.BASE_URL_API;

export async function getUsersWithPedidos() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const response = await fetch(`${API_URL}/users-with-pedidos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.data || null; // <-- ajusta según tu API
}
