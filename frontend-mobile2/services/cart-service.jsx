import env from "../config/env";
import { getToken } from "./auth-service";

const API_URL = env.BASE_URL_API;

// Función para obtener los items del carrito
export async function getCartItems() {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/carrito`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            throw new Error("Error al obtener el carrito");
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error obteniendo carrito:", error);
        return null;
    }
}

// Función para agregar un item al carrito
export async function addItemToCart(idModelo, cantidad) {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/carrito`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ idModelo, cantidad }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al agregar al carrito");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error agregando al carrito:", error);
        throw error;
    }
}

// Función para actualizar la cantidad de un item
export async function updateCartItemQuantity(idCarrito, cantidad) {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/carrito/${idCarrito}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ cantidad }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al actualizar el carrito");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error actualizando carrito:", error);
        throw error;
    }
}

// Función para eliminar un item del carrito
export async function removeCartItem(idCarrito) {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/carrito/${idCarrito}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al eliminar del carrito");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error eliminando del carrito:", error);
        throw error;
    }
}

// Función para vaciar el carrito
export async function clearCartItems() {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/carrito/vaciar/todo`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al vaciar el carrito");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error vaciando carrito:", error);
        throw error;
    }
}
