import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, CartItem, Order, Category } from '@/types';

interface AppContextType {
  user: User | null;
  products: Product[];
  categories: Category[];
  cartItems: CartItem[];
  orders: Order[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  createOrder: (deliveryMethod: 'pickup' | 'delivery') => Order;
  updateUserProfile: (userData: Partial<User>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Robot Futurista',
    price: 45.99,
    description:
      'Modelo 3D de robot futurista de alta calidad para juegos y animaciones. Incluye texturas PBR y rigging completo.',
    image:
      'https://images.pexels.com/photos/8566470/pexels-photo-8566470.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'characters',
    rating: 4.8,
    reviews: 156,
    downloadCount: 2340,
    fileSize: '24.5 MB',
    format: ['FBX', 'OBJ', 'BLEND'],
  },
  {
    id: '2',
    name: 'Casa Moderna',
    price: 32.5,
    description:
      'Modelo arquitectónico de casa moderna con interiores detallados. Perfecto para visualizaciones arquitectónicas.',
    image:
      'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'architecture',
    rating: 4.6,
    reviews: 89,
    downloadCount: 1567,
    fileSize: '42.1 MB',
    format: ['3DS', 'OBJ', 'FBX'],
  },
  {
    id: '3',
    name: 'Coche Deportivo',
    price: 28.99,
    description:
      'Modelo 3D de coche deportivo con detalles realistas. Incluye interior completo y materiales metálicos.',
    image:
      'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'vehicles',
    rating: 4.9,
    reviews: 234,
    downloadCount: 3456,
    fileSize: '38.7 MB',
    format: ['MAX', 'FBX', 'OBJ'],
  },
  {
    id: '4',
    name: 'Dragón Mítico',
    price: 55.0,
    description:
      'Criatura fantástica con animaciones incluidas. Ideal para juegos de fantasía y producciones cinematográficas.',
    image:
      'https://images.pexels.com/photos/6214463/pexels-photo-6214463.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'characters',
    rating: 4.7,
    reviews: 178,
    downloadCount: 2890,
    fileSize: '67.3 MB',
    format: ['FBX', 'BLEND', 'MA'],
  },
  {
    id: '5',
    name: 'Espada Medieval',
    price: 15.99,
    description:
      'Arma medieval detallada con texturas realistas. Incluye vaina y efectos de material.',
    image:
      'https://images.pexels.com/photos/1040160/pexels-photo-1040160.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'props',
    rating: 4.4,
    reviews: 95,
    downloadCount: 1234,
    fileSize: '12.8 MB',
    format: ['OBJ', 'FBX', '3DS'],
  },
  {
    id: '6',
    name: 'Nave Espacial',
    price: 42.75,
    description:
      'Nave espacial futurista con detalles complejos. Perfecta para proyectos de ciencia ficción.',
    image:
      'https://images.pexels.com/photos/586063/pexels-photo-586063.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'vehicles',
    rating: 4.8,
    reviews: 167,
    downloadCount: 2156,
    fileSize: '45.2 MB',
    format: ['MAX', 'BLEND', 'FBX'],
  },
];

const mockCategories: Category[] = [
  { id: 'all', name: 'Todos', icon: 'apps', color: '#6366f1' },
  { id: 'characters', name: 'Personajes', icon: 'person', color: '#f59e0b' },
  {
    id: 'architecture',
    name: 'Arquitectura',
    icon: 'business',
    color: '#10b981',
  },
  { id: 'vehicles', name: 'Vehículos', icon: 'car', color: '#ef4444' },
  { id: 'props', name: 'Objetos', icon: 'construct', color: '#8b5cf6' },
  { id: 'nature', name: 'Naturaleza', icon: 'leaf', color: '#059669' },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [products] = useState<Product[]>(mockProducts);
  const [categories] = useState<Category[]>(mockCategories);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication
    if (email && password) {
      const mockUser: User = {
        id: '1',
        email,
        name: 'Usuario Demo',
        avatar:
          'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400',
        phone: '+51 999 888 777',
        address: 'Av. Javier Prado Este 1234, San Isidro, Lima',
      };
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    // Mock registration
    if (name && email && password) {
      const mockUser: User = {
        id: '1',
        email,
        name,
        avatar:
          'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400',
      };
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCartItems([]);
  };

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          product,
          quantity: 1,
          addedAt: new Date(),
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const createOrder = (deliveryMethod: 'pickup' | 'delivery'): Order => {
    const deliveryFee = deliveryMethod === 'delivery' ? 10.0 : 0;
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const total = subtotal + deliveryFee;

    const order: Order = {
      id: Date.now().toString(),
      userId: user?.id || '',
      items: [...cartItems],
      total,
      status: 'pending',
      deliveryMethod,
      deliveryFee,
      createdAt: new Date(),
      estimatedDelivery:
        deliveryMethod === 'delivery'
          ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
          : new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    };

    setOrders((prev) => [...prev, order]);
    clearCart();
    return order;
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        products,
        categories,
        cartItems,
        orders,
        isAuthenticated,
        login,
        register,
        logout,
        addToCart,
        removeFromCart,
        clearCart,
        createOrder,
        updateUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
