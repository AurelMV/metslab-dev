import React, { createContext, useContext, useState } from 'react';

const CarritoContext = createContext();

export function useCarrito() {
  return useContext(CarritoContext);
}

export function CarritoProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [items, setItems] = useState([]);

  const handleQty = (id, delta) => {
    setItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const handleRemove = (id) => {
    setItems((items) => items.filter((item) => item.id !== id));
  };
  const addToCart = (product) => {
    if (!product) return;
    
    // Verificar si el producto ya está en el carrito
    const existingItemIndex = items.findIndex(item => item.id === product.idModelo);
    
    if (existingItemIndex >= 0) {
      // Si el producto ya está en el carrito, incrementar la cantidad
      handleQty(product.idModelo, 1);
    } else {
      // Si es un producto nuevo, añadirlo al carrito      console.log('Producto recibido en addToCart:', product);
      const newItem = {
        id: product.idModelo,
        name: product.nombre,
        price: typeof product.precio === 'string' ? parseFloat(product.precio.replace(/[^\d.-]/g, '')) : product.precio,
        qty: 1,
        // Usamos la propiedad imagen_url que viene de la API
        image: product.imagen_url || product.ruta_imagen || 'https://via.placeholder.com/56',
      };
      console.log('Nuevo item creado:', newItem);
      setItems(prevItems => [...prevItems, newItem]);
    }
    
    // Abrir el carrito automáticamente
    setIsCartOpen(true);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const value = {
    isCartOpen,
    setIsCartOpen,
    items,
    setItems,
    handleQty,
    handleRemove,
    addToCart,
    subtotal,
    toggleCart
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
}
