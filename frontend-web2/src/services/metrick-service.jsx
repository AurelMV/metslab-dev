const API_URL = import.meta.env.VITE_BASE_URL_API || "http://localhost:8000/api";

export async function getPedidosPorMes() {
  const response = await fetch(`${API_URL}/metricas/pedidos-por-mes`);
  if (!response.ok) {
    throw new Error('Error al obtener pedidos por mes');
  }
  return await response.json();
}

export async function getIngresosPorMes() {
  const response = await fetch(`${API_URL}/metricas/ingresos-por-mes`);
  if (!response.ok) {
    throw new Error('Error al obtener ingresos por mes');
  }
  return await response.json();
}