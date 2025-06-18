import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCartItems,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCartItems,
} from "../services/cart-service";
import { useAuth } from "./AuthContext";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Cargar carrito desde localStorage si no está autenticado
  // o desde API si está autenticado
  useEffect(() => {
    const loadCartData = async () => {
      setLoading(true);
      try {
        if (user) {
          // Si el usuario está autenticado, intentamos cargar desde API
          const cartData = await getCartItems();
          if (cartData) {
            // Transform API data to match our structure
            const transformedItems = cartData.items.map((item) => ({
              carrito_id: item.carrito_id,
              model: {
                id: item.modelo_id,
                name: item.nombre,
                price: item.precio,
                description: item.descripcion,
                image: item.imagen_url,
              },
              selectedColor: { id: 1 }, // Valor por defecto
              quantity: item.cantidad,
            }));
            setItems(transformedItems);
            localStorage.removeItem("metslab_cart"); // Eliminar carrito local
          }
        } else {
          // Si el usuario no está autenticado, cargamos del localStorage
          const storedCart = localStorage.getItem("metslab_cart");
          if (storedCart) {
            setItems(JSON.parse(storedCart));
          }
        }
      } catch (err) {
        console.error("Error cargando carrito:", err);
        setError("Error cargando el carrito");
      } finally {
        setLoading(false);
      }
    };

    loadCartData();
  }, [user]);

  // Guardar en localStorage cuando cambie items (solo si no está autenticado)
  useEffect(() => {
    if (!user && items.length >= 0) {
      localStorage.setItem("metslab_cart", JSON.stringify(items));
    }
  }, [items, user]);

  // Función para agregar al carrito
  const addToCart = async (model, color, quantity = 1) => {
    try {
      if (user) {
        // Si el usuario está autenticado, usar API
        await addItemToCart(model.id, quantity);
        const cartData = await getCartItems();
        if (cartData) {
          const transformedItems = cartData.items.map((item) => ({
            carrito_id: item.carrito_id,
            model: {
              id: item.modelo_id,
              name: item.nombre,
              price: item.precio,
              description: item.descripcion,
              image: item.imagen_url,
            },
            selectedColor: { id: 1 }, // Valor por defecto
            quantity: item.cantidad,
          }));
          setItems(transformedItems);
        }
      } else {
        // Si el usuario no está autenticado, usar localStorage
        setItems((prevItems) => {
          const existingItem = prevItems.find(
            (item) =>
              item.model.id === model.id && item.selectedColor.id === color.id
          );

          if (existingItem) {
            return prevItems.map((item) =>
              item.model.id === model.id && item.selectedColor.id === color.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }

          return [...prevItems, { model, selectedColor: color, quantity }];
        });
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Error agregando al carrito");
    }
  };

  // Función para remover del carrito
  const removeFromCart = async (modelId, colorId) => {
    try {
      if (user) {
        // Si el usuario está autenticado, buscar el ID del carrito
        const cartItem = items.find(
          (item) => item.model.id === modelId && item.selectedColor.id === colorId
        );

        if (cartItem && cartItem.carrito_id) {
          await removeCartItem(cartItem.carrito_id);
          // Actualizar el carrito desde la API
          const cartData = await getCartItems();
          if (cartData) {
            const transformedItems = cartData.items.map((item) => ({
              carrito_id: item.carrito_id,
              model: {
                id: item.modelo_id,
                name: item.nombre,
                price: item.precio,
                description: item.descripcion,
                image: item.imagen_url,
              },
              selectedColor: { id: 1 }, // Default
              quantity: item.cantidad,
            }));
            setItems(transformedItems);
          } else {
            setItems([]);
          }
        }
      } else {
        // Si el usuario no está autenticado, usar localStorage
        setItems((prevItems) =>
          prevItems.filter(
            (item) =>
              !(item.model.id === modelId && item.selectedColor.id === colorId)
          )
        );
      }
    } catch (err) {
      console.error("Error eliminando del carrito:", err);
      setError("Error eliminando del carrito");
    }
  };

  // Función para actualizar la cantidad
  const updateQuantity = async (modelId, colorId, quantity) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(modelId, colorId);
        return;
      }

      if (user) {
        // Si el usuario está autenticado, buscar el ID del carrito
        const cartItem = items.find(
          (item) => item.model.id === modelId && item.selectedColor.id === colorId
        );

        if (cartItem && cartItem.carrito_id) {
          await updateCartItemQuantity(cartItem.carrito_id, quantity);
          // Actualizar el carrito desde la API
          const cartData = await getCartItems();
          if (cartData) {
            const transformedItems = cartData.items.map((item) => ({
              carrito_id: item.carrito_id,
              model: {
                id: item.modelo_id,
                name: item.nombre,
                price: item.precio,
                description: item.descripcion,
                image: item.imagen_url,
              },
              selectedColor: { id: 1 }, // Default
              quantity: item.cantidad,
            }));
            setItems(transformedItems);
          }
        }
      } else {
        // Si el usuario no está autenticado, usar localStorage
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.model.id === modelId && item.selectedColor.id === colorId
              ? { ...item, quantity }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Error actualizando cantidad:", err);
      setError("Error actualizando cantidad");
    }
  };

  // Función para vaciar el carrito
  const clearCart = async () => {
    try {
      if (user) {
        // Si el usuario está autenticado, usar la API para vaciar
        await clearCartItems();
      }
      setItems([]);
    } catch (err) {
      console.error("Error vaciando carrito:", err);
      setError("Error vaciando carrito");
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.model.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
