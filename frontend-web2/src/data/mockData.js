export const categories = [
  { id: '1', name: 'Decoración', description: 'Modelos decorativos para el hogar' },
  { id: '2', name: 'Juguetes', description: 'Figuras y juguetes para niños' },
  { id: '3', name: 'Herramientas', description: 'Herramientas y utilidades' },
  { id: '4', name: 'Arte', description: 'Esculturas y arte decorativo' },
  { id: '5', name: 'Arquitectura', description: 'Modelos arquitectónicos' }
];

export const colors = [
  { id: '1', name: 'Blanco', hex: '#FFFFFF' },
  { id: '2', name: 'Negro', hex: '#000000' },
  { id: '3', name: 'Rojo', hex: '#EF4444' },
  { id: '4', name: 'Azul', hex: '#3B82F6' },
  { id: '5', name: 'Verde', hex: '#10B981' },
  { id: '6', name: 'Amarillo', hex: '#F59E0B' },
  { id: '7', name: 'Naranja', hex: '#FF8C42' },
  { id: '8', name: 'Morado', hex: '#8B5CF6' }
];

export const models3D = [
  {
    id: '1',
    name: 'Vaso Decorativo Moderno',
    description: 'Elegante vaso decorativo con diseño geométrico moderno, perfecto para decorar cualquier espacio.',
    price: 45.00,
    image: 'https://images.pexels.com/photos/6186812/pexels-photo-6186812.jpeg?auto=compress&cs=tinysrgb&w=400',
    modelPath: '/models/vaso-decorativo.obj',
    dimensions: { width: 8, height: 15, depth: 8 },
    categoryId: '1'
  },
  {
    id: '2',
    name: 'Figura de Dragón',
    description: 'Impresionante figura de dragón detallada, ideal para coleccionistas y amantes de la fantasía.',
    price: 120.00,
    image: 'https://images.pexels.com/photos/163084/dragon-fig-colorful-red-163084.jpeg?auto=compress&cs=tinysrgb&w=400',
    modelPath: '/models/dragon.obj',
    dimensions: { width: 20, height: 25, depth: 15 },
    categoryId: '2'
  },
  {
    id: '3',
    name: 'Porta Llaves Minimalista',
    description: 'Práctico porta llaves con diseño minimalista, ideal para mantener organizadas tus llaves.',
    price: 25.00,
    image: 'https://images.pexels.com/photos/1478685/pexels-photo-1478685.jpeg?auto=compress&cs=tinysrgb&w=400',
    modelPath: '/models/porta-llaves.obj',
    dimensions: { width: 12, height: 6, depth: 3 },
    categoryId: '3'
  },
  {
    id: '4',
    name: 'Escultura Abstracta',
    description: 'Moderna escultura abstracta que añade un toque artístico contemporáneo a tu hogar.',
    price: 85.00,
    image: 'https://images.pexels.com/photos/3004792/pexels-photo-3004792.jpeg?auto=compress&cs=tinysrgb&w=400',
    modelPath: '/models/escultura-abstracta.obj',
    dimensions: { width: 15, height: 20, depth: 10 },
    categoryId: '4'
  },
  {
    id: '5',
    name: 'Miniatura Casa Colonial',
    description: 'Detallada miniatura de casa colonial cusqueña, perfecta para maquetas y colecciones.',
    price: 95.00,
    image: 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=400',
    modelPath: '/models/casa-colonial.obj',
    dimensions: { width: 18, height: 12, depth: 15 },
    categoryId: '5'
  },
  {
    id: '6',
    name: 'Maceta Geométrica',
    description: 'Moderna maceta con diseño geométrico, perfecta para plantas pequeñas y suculentas.',
    price: 35.00,
    image: 'https://images.pexels.com/photos/6208086/pexels-photo-6208086.jpeg?auto=compress&cs=tinysrgb&w=400',
    modelPath: '/models/maceta-geometrica.obj',
    dimensions: { width: 10, height: 8, depth: 10 },
    categoryId: '1'
  }
];

// Add category references to models
export const modelsWithCategories = models3D.map(model => ({
  ...model,
  category: categories.find(cat => cat.id === model.categoryId)
}));

export const mockOrders = [
  {
    id: '1',
    userId: '2',
    items: [
      {
        model: models3D[0],
        quantity: 2,
        color: colors[0],
        unitPrice: 45.00
      }
    ],
    deliveryType: 'delivery',
    paymentMethod: 'card',
    address: 'Jr. Comercio 456, Cusco',
    status: 'processing',
    totalAmount: 90.00,
    createdAt: '2024-01-15T10:30:00Z'
  }
];