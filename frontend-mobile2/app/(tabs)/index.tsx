import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router/build/hooks';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

import { getModelosByCategoria, getModelos } from '@/services/modelo-service';
import { getCategorias } from '@/services/modelo-service';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    { idCategoria: number; nombre: string }[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(0); // "Todos" por defecto
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Cargar categorías y agregar "Todos"
  useEffect(() => {
    async function loadCategories() {
      try {
        const categorias = await getCategorias();
        setCategories([{ idCategoria: 0, nombre: 'Todos' }, ...categorias]);
      } catch (error) {
        console.error(error);
        setCategories([{ idCategoria: 0, nombre: 'Todos' }]);
      }
    }
    loadCategories();
  }, []);

  // Cargar productos según la categoría seleccionada
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        if (selectedCategory === 0) {
          const productos = await getModelos();
          setProducts(productos);
        } else {
          const productos = await getModelosByCategoria(selectedCategory);
          setProducts(productos);
        }
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [selectedCategory]);

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.idModelo}`);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard product={item} onPress={() => handleProductPress(item)} />
  );

  const renderCategory = ({
    item,
  }: {
    item: { idCategoria: number; nombre: string };
  }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.idCategoria && styles.categoryButtonSelected,
      ]}
      onPress={() => setSelectedCategory(item.idCategoria)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.idCategoria && styles.categoryTextSelected,
        ]}
      >
        {item.nombre}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Modelos 3D</Text>
        <Text style={styles.subtitle}>Descubre increíbles modelos 3D</Text>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.idCategoria.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 10, marginLeft: 10 }}
      />

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" />
      ) : products.length === 0 ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#6b7280', fontSize: 18, marginTop: 40 }}>
            No hay datos
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.idModelo.toString()}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  productGrid: {
    padding: 10,
  },
  categoryButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    marginRight: 8,
    minWidth: 80, // ancho mínimo para uniformidad
    alignItems: 'center', // centra el texto
  },
  categoryButtonSelected: {
    backgroundColor: '#6366f1',
  },
  categoryText: {
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: 14, // tamaño de fuente más pequeño
  },
  categoryTextSelected: {
    color: '#fff',
  },
});
