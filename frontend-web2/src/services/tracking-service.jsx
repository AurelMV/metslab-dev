import env from "../config/env";
import { getToken } from "./auth-service";

const API_URL = env.BASE_URL_API;

// Función para obtener pedidos activos que se pueden seguir
export async function getSeguimientoPedidos() {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/seguimiento`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error("Error al obtener el seguimiento de pedidos");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error obteniendo seguimiento:", error);
        return null;
    }
}

// Función para obtener el historial completo de pedidos
export async function getHistorialPedidos(page = 1, limit = 10, estado = null) {
    const token = getToken();
    if (!token) return null;

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        if (estado) {
            params.append('estado', estado);
        }

        const response = await fetch(`${API_URL}/historial?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error("Error al obtener el historial de pedidos");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error obteniendo historial:", error);
        return null;
    }
}

// Función para obtener detalles completos de un pedido
export async function getDetallesPedido(pedidoId) {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/pedido/${pedidoId}/detalles`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error("Error al obtener los detalles del pedido");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error obteniendo detalles del pedido:", error);
        return null;
    }
}
