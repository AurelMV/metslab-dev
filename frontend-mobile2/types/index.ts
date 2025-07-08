export interface Product {
  idModelo: number;
  nombre: string;
  descripcion: string;
  dimensiones: string;
  precio: number;
  estado: number;
  modelo_url: string;
  imagen_url: string;
  nombreCategoria: string;
  rating?: number; // opcional si no lo tienes
  reviews?: number;
  downloadCount?: number;
  idCategoria: number;
}


export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryMethod: 'pickup' | 'delivery';
  deliveryFee: number;
  createdAt: Date;
  estimatedDelivery?: Date;
}

export interface Category {
  idCategoria: string;
  nombre: string;

}