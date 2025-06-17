import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("metslab_cart");
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("metslab_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (model, color, quantity = 1) => {
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
  };

  const removeFromCart = (modelId, colorId) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(item.model.id === modelId && item.selectedColor.id === colorId)
      )
    );
  };

  const updateQuantity = (modelId, colorId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(modelId, colorId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.model.id === modelId && item.selectedColor.id === colorId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
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
