export type Model3D = {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  modelUrl: string;
  description?: string;
  format?: string;
  polygons?: string;
  textures?: string;
};

export const mockModels: Model3D[] = [
  {
    id: '1',
    title: 'Robot Character',
    price: 29.99,
    thumbnail: 'https://picsum.photos/400/300',
    modelUrl: '/models/robot.glb',
    description: 'Robot character optimizado para juegos móviles y realidad virtual.',
    format: 'GLB/GLTF',
    polygons: '15,000',
    textures: '2K PBR'
  },
  {
    id: '2',
    title: 'Sci-fi Vehicle',
    price: 49.99,
    thumbnail: 'https://picsum.photos/400/301',
    modelUrl: '/models/vehicle.glb',
    description: 'Vehículo futurista para transporte intergaláctico.',
    format: 'GLB/GLTF',
    polygons: '25,000',
    textures: '4K PBR'
  },
  {
    id: '3',
    title: 'Fantasy Weapon',
    price: 19.99,
    thumbnail: 'https://picsum.photos/400/302',
    modelUrl: '/models/weapon.glb',
    description: 'Arma mágica de un mundo de fantasía.',
    format: 'GLB/GLTF',
    polygons: '10,000',
    textures: '2K PBR'
  },
  {
    id: '4',
    title: 'Space Station',
    price: 39.99,
    thumbnail: 'https://picsum.photos/400/303',
    modelUrl: '/models/station.glb',
    description: 'Estación espacial para la exploración del universo.',
    format: 'GLB/GLTF',
    polygons: '50,000',
    textures: '4K PBR'
  },
];
