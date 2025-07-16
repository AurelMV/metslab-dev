import env from "../config/env";

const API_URL = env.BASE_URL_API;

// Función para obtener el token de autenticación
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Función para crear headers con autenticación
const createAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Obtener lista de pedidos con filtros y paginación
export async function obtenerPedidos(filtros = {}, page = 1, limit = 20) {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filtros
        });

        const response = await fetch(`${API_URL}/admin/pedidos?${params}`, {
            method: 'GET',
            headers: createAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        throw error;
    }
}

// Obtener detalles de un pedido específico
export async function obtenerDetallePedido(id) {
    try {
        const response = await fetch(`${API_URL}/admin/pedidos/${id}`, {
            method: 'GET',
            headers: createAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener detalles del pedido:', error);
        throw error;
    }
}

// Obtener detalles completos de un pedido específico con imágenes de productos
export async function obtenerDetallesCompletos(id) {
    try {
        const response = await fetch(`${API_URL}/admin/pedidos/${id}/detalles`, {
            method: 'GET',
            headers: createAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener detalles completos del pedido:', error);
        handleAuthError(error);
        throw error;
    }
}

// Actualizar estado de un pedido individual
export async function actualizarEstadoPedido(id, nuevoEstado) {
    try {
        const response = await fetch(`${API_URL}/admin/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: createAuthHeaders(),
            body: JSON.stringify({
                nuevo_estado: nuevoEstado
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al actualizar estado del pedido:', error);
        throw error;
    }
}

// Actualizar estados de múltiples pedidos (lote)
export async function actualizarEstadosLote(pedidosIds, nuevoEstado, notas = '') {
    try {
        const response = await fetch(`${API_URL}/admin/pedidos/estados/lote`, {
            method: 'PUT',
            headers: createAuthHeaders(),
            body: JSON.stringify({
                pedidos: pedidosIds,
                nuevo_estado: nuevoEstado,
                notas: notas
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al actualizar estados por lote:', error);
        throw error;
    }
}

// Obtener estados disponibles
export async function obtenerEstadosDisponibles() {
    try {
        const response = await fetch(`${API_URL}/admin/pedidos/estados/disponibles`, {
            method: 'GET',
            headers: createAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener estados disponibles:', error);
        throw error;
    }
}

// Función de utilidad para manejar errores de autenticación
export function handleAuthError(error) {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // Limpiar token y redirigir al login
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    return error;
}

// Función de utilidad para formatear fechas
export function formatearFecha(fecha) {
    if (!fecha) return 'Sin fecha';
    
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función de utilidad para formatear moneda
export function formatearMoneda(cantidad) {
    if (!cantidad && cantidad !== 0) return 'S/ 0.00';
    
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2
    }).format(cantidad);
}

// Función de utilidad para obtener color del estado
export function obtenerColorEstado(estado) {
    const colores = {
        'pedido_realizado': '#6b7280',
        'capturado': '#3b82f6',
        'pago_confirmado': '#10b981',
        'en_espera': '#f59e0b',
        'pendiente_envio': '#f59e0b',
        'en_preparacion': '#8b5cf6',
        'en_camino': '#06b6d4',
        'en_transito': '#06b6d4',
        'en_reparto': '#06b6d4',
        'intento_entrega': '#f59e0b',
        'pendiente_recogida': '#f59e0b',
        'entregado': '#10b981',
        'completado': '#22c55e',
        'retrasado': '#ef4444',
        'perdido': '#ef4444',
        'devuelto': '#f59e0b',
        'cancelado': '#ef4444',
        'rechazado': '#ef4444',
        'archivado': '#6b7280'
    };
    
    return colores[estado] || '#6b7280';
}

// Función de utilidad para obtener icono del estado
export function obtenerIconoEstado(estado) {
    const iconos = {
        'pedido_realizado': 'clock',
        'capturado': 'check-circle',
        'pago_confirmado': 'credit-card',
        'en_espera': 'clock',
        'pendiente_envio': 'package',
        'en_preparacion': 'package',
        'en_camino': 'truck',
        'en_transito': 'truck',
        'en_reparto': 'truck',
        'intento_entrega': 'alert-circle',
        'pendiente_recogida': 'map-pin',
        'entregado': 'check-circle',
        'completado': 'check-circle',
        'retrasado': 'clock',
        'perdido': 'alert-circle',
        'devuelto': 'rotate-ccw',
        'cancelado': 'x-circle',
        'rechazado': 'x-circle',
        'archivado': 'archive'
    };
    
    return iconos[estado] || 'help-circle';
}
