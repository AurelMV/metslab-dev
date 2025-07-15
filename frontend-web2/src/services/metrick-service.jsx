const API_URL = import.meta.env.VITE_BASE_URL_API || "http://localhost:8000/api";

/**
 * Obtiene los pedidos por mes desde el backend
 * @returns {Promise<Array<{anio: number, mes: number, cantidad: number}>>}
 * @throws {Error} Cuando falla la petición
 */
export async function getPedidosPorMes() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/metricas/pedidos-por-mes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 'Error al obtener pedidos por mes',
        { cause: { status: response.status, data: errorData } }
      );
    }

    const data = await response.json();
    
    // Validación básica de datos
    if (!Array.isArray(data)) {
      throw new Error('Formato de datos inválido: se esperaba un array');
    }
    
    return data.map(item => ({
      anio: Number(item.anio),
      mes: Number(item.mes),
      cantidad: Number(item.cantidad)
    }));
    
  } catch (error) {
    console.error('Error en getPedidosPorMes:', error);
    throw new Error(error.message || 'Error al obtener pedidos por mes');
  }
}

/**
 * Obtiene los ingresos por mes desde el backend
 * @returns {Promise<Array<{anio: number, mes: number, ingresos: number}>>}
 * @throws {Error} Cuando falla la petición
 */
export async function getIngresosPorMes() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/metricas/ingresos-por-mes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 'Error al obtener ingresos por mes',
        { cause: { status: response.status, data: errorData } }
      );
    }

    const data = await response.json();
    
    // Validación básica de datos
    if (!Array.isArray(data)) {
      throw new Error('Formato de datos inválido: se esperaba un array');
    }
    
    return data.map(item => ({
      anio: Number(item.anio),
      mes: Number(item.mes),
      ingresos: Number(item.ingresos)
    }));
    
  } catch (error) {
    console.error('Error en getIngresosPorMes:', error);
    throw new Error(error.message || 'Error al obtener ingresos por mes');
  }
}